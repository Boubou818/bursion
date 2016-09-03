declare var Grid : any;

/**
 * The hexagonal map, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource, and is a specific type : land, water, beach, deepawater...
 */
class HexagonMap {
    
    // The Hexagon grid containing land, water and deepwater hexagons, indexed by hexagon name
    private  _map : {[hexName:string] : MapHexagon} = {};

    // The numbre of rings the map has
    private _size : number;
    
    // The starting position on the map
    private _basePosition : MapHexagon = null;
    
    // The starting position of the drakkar on the map
    private _drakkarPosition : MapHexagon = null;    
    
    constructor(size:number) {
        this._size  = size;
        
        let grid         = MapHexagon.getDefaultGrid();
                
        let mapCoords = grid.hexagon(0,0 ,size+10, true);
        
        // Build the land part of the map
        for (let c of mapCoords) {
            let hex = new MapHexagon(c.q, c.r, grid);
            let axialDistance = Grid.axialDistance(c.q, c.r, 0, 0);
            if (axialDistance <= this._size) {
                hex.type = HexagonType.Land;
            } else if (axialDistance <= this._size+1) {
                hex.type = HexagonType.Beach;
            } else if (axialDistance <= this._size+3) {
                hex.type = HexagonType.Water;
            } else if (axialDistance <= this._size+4) {
                if (Math.random() < 0.45) {
                    hex.type = HexagonType.Water;
                } else {
                    hex.type = HexagonType.DeepWater;
                }
            }else {
                hex.type = HexagonType.DeepWater;
            }

            // Generate resources on land only
            if (hex.type === HexagonType.Land) {
                let randomInt = Math.floor(Math.random() * 3); // random int between 0 and 2, two resources : wood, meat and rock
                let randomProba = Math.random();
                switch (randomInt) {
                    case 0:
                        if (randomProba < Resources.getProbability(Resources.Wood)) {
                            hex.resourceSlot.resource = Resources.Wood;
                        } //else it's empty by default
                        break;
                    case 1 : 
                        if (randomProba < Resources.getProbability(Resources.Rock)) {
                            hex.resourceSlot.resource = Resources.Rock;
                        } //else it's empty by default
                        
                    case 2 : 
                        if (randomProba < Resources.getProbability(Resources.Meat)) {
                            hex.resourceSlot.resource = Resources.Meat;
                        } //else it's empty by default
                
                    default:
                        break;
                }
            }
            this._map[hex.name] = hex; 
        }        
        
        // get starters position
        // Base position
        let starterQ = -Math.floor(this._size/2),
            starterR = this._size-1;    
        this._basePosition = this._getHexagonByHexCoordinates(starterQ, starterR);
        
        // Drakkar position
        starterQ = -Math.floor(this._size/2)+1;
        starterR = this._size+1;        
        this._drakkarPosition = this._getHexagonByHexCoordinates(starterQ, starterR);        
    }

    /**
     * Get map size - read only attribute
     */
    get size() :number {
        return this._size;
    }
    
    /**
     * Returns the very first position of the base (near the beach, on the land)
     */
    get basePosition() : MapHexagon {
        return this._basePosition;
    }
    
    /**
     * Returns the drakkar position (in water, near the starting base)
     */
    get drakkarPosition() : MapHexagon {
        return this._drakkarPosition;
    }

    
    /**
     * Returns the hexagon the nearest of the given position. Used to snap a building on the nearest hex.
     */
    public getNearestHex (p:BABYLON.Vector3) : MapHexagon {
        let min = 99999,
        res = null;
        for (let name in this._map) {
            let hex = this._map[name];
            if (hex) {
                let dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
                if (dist < min) {
                    min = dist;
                    res = hex;
                }
            }
        };
        return res;
    }

    /**
     * Returns the hexagon present on the map corresponding to the given position
     */
    public getResourceHex(p : BuildingPoint) : MapHexagon {

        for (let name in this._map) {
            let hex = this._map[name];
            if (hex) {
                let dist = hex.distanceToPoint(p);
                if (dist < BABYLON.Epsilon) {
                return hex;
                }
            }
        }
        return null;
    }
    
    /**
     * Returns the hexagon of the map corresponding to the given coordinates.
     * Returns null if not found
     */
    private _getHexagonByHexCoordinates(q : number, r:number) : MapHexagon {
        for (let name in this._map) {
            let hex = this._map[name];
            if (hex) {
                if (hex.q == q && hex.r == r) {
                    return hex;
                }   
            }
        }
        return null;
    }
    
    /**
     * Remove the given hex from the map
     */
    public removeMapHex(hexagon:MapHexagon, disposeResource?:boolean) {
        if (hexagon) {
            let mapHex : MapHexagon = this._map[hexagon.name];
            if (mapHex) {
                mapHex.dispose(disposeResource);
                this._map[hexagon.name] = null;
            }
        }
    }

    /**
     * Returns true if the extension can be build. 
     * The extension can only be built on land.
     */
    public canBuild(building: Building) {
        let canBuild = true;
        for (let h of building.points) {
            let mapHex = this.getResourceHex(h);
            canBuild = canBuild && (mapHex.type === HexagonType.Land);
        }
        return canBuild;
    }

    private _random(min, max) {
        var random = Math.random();
        return ((random * (max - min)) + min);
    }
    private _randomInt(min, max) {
        var random = Math.random();
        return Math.floor(((random * (max - min)) + min));
    }
    
    private _createResourceAnimation(model : BABYLON.AbstractMesh, duration) {
        var quarter = duration*60*0.001 / 4;
        var p = model.position;
        model.scaling.scaleInPlace(0);

        // Position animation
        var position = new BABYLON.Animation("", "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        position.setKeys([
            { frame: 0, value: 0 },
            { frame: quarter, value: p.y+1 },
            { frame: quarter*2, value: p.y+1 },
            { frame: quarter*3, value: p.y+1 },
            { frame: quarter*4, value: 0 }
        ]);
        var e = new BABYLON.CubicEase();
        e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        position.setEasingFunction(e);
        model.animations.push(position);
        

        // Scaling
        var scaling = new BABYLON.Animation("", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        scaling.setKeys([
            { frame: 0, value: BABYLON.Vector3.Zero() },
            { frame: quarter*2, value: new BABYLON.Vector3(1,1,1) }
        ]);
        var f = new BABYLON.BackEase(0.5);
        f.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        scaling.setEasingFunction(f);
        model.animations.push(scaling);

        // Rotation
        var rotation = new BABYLON.Animation("", "rotation.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        rotation.setKeys([
            { frame: 0, value: 0 },
            { frame: quarter*4, value: model.rotation.y+Math.PI*2 }
        ]);
        rotation.setEasingFunction(e);
        model.animations.push(rotation);
        
        model.getScene().beginAnimation(model, 0, quarter*4, false, 1);
    }


    private _assignResourceModel(h:MapHexagon, game:Game) : Timer {
        let timer = new Timer(500, game.scene, {autostart:false, autodestroy:true});
        
        if (h.resourceSlot.resource === Resources.Wood) {
            timer.callback = () => {
                let wood = game.createInstanceAsset('trees');
                wood.setEnabled(true);
                wood.position.copyFrom(h.center);
                wood.rotation.y = Math.random()-0.5;   
                h.resourceSlot.model = wood;
                    
                this._createResourceAnimation(wood, 1000);
                
            } 
        }
        if (h.resourceSlot.resource === Resources.Rock) {
            timer.callback = () => {
                let rock = game.createInstanceAsset('rock');              
                rock.setEnabled(true);
                rock.position.copyFrom(h.center);
                h.resourceSlot.model = rock;
                
                this._createResourceAnimation(rock, 1000);
            } 
        }    
        if (h.type === HexagonType.DeepWater) {            
            timer.callback = () => {
                // Whale
                if (Math.random() < 0.005) {
                    let whale = game.createInstanceAsset('whale', '__whale__');
                    whale.position.copyFrom(h.center);
                    whale.scaling.scaleInPlace(2);
                }
            }
        }        
        if (h.resourceSlot.resource === Resources.Meat) {
                      
            timer.callback = () => {
                let boar = game.createInstanceAsset('boar');     
                boar.position.copyFrom(h.center);
                boar.rotation.y = Math.random()-0.5;
                h.resourceSlot.model = boar;
                this._createResourceAnimation(boar, 1000); 
            }
        }
        // if (h.resourceSlot.resource === Resources.Empty && h.type === HexagonType.Land) {
        //     let grass = game.createInstanceAsset('grass');               
        //     grass.setEnabled(true);
        //     grass.position.copyFrom(h.center);
        //     grass.position.y = 0.75;
        //     grass.scaling.scaleInPlace(this._random(0.7, 1));
        //     // grass.freezeWorldMatrix();
        //     h.resourceSlot.model = grass;
        // }   
        return timer;          
    }
    
    /**
     * Draw the hexagon grid in the given scene.
     * Hexagons and resources are two different models.
     * @param game The game instance
     * @param callback The function called when the map is finished to be drawn (after all animations are finished)
     */
    public draw(game:Game, callback:()=>void) {

        let scene : BABYLON.Scene = game.scene;
        
        var delay = 0;
        
        // Hexa scheduler
        let schedulerResources = new Scheduler();
        schedulerResources.whenAllOver = () => {
           console.log("ALL OVER");
           callback();
        };
        schedulerResources.finishDelay = 1000;
        
        // Ressources scheduler
        let schedulerHexa = new Scheduler();
        schedulerHexa.whenAllOver = () => {
           console.log("Building resources");
            schedulerResources.start();
        };
        
        for (let name in this._map) {
            let h = this._map[name];

            var timer = new Timer(delay, scene, {autostart:false, autodestroy:true});
            delay += 1.5;

            let hex = null;    
            let ressourceTimer : Timer = null;        
            switch (h.type) {
                case HexagonType.DeepWater:
                    hex = game.createInstanceAsset('hexa-water2', '__water2__');
                    break;    
                case HexagonType.Water:
                    hex =  game.createInstanceAsset('hexa-water1', '__water1__');
                    break;    
                case HexagonType.Beach:
                    hex =  game.createInstanceAsset('hexa-beach', '__beach__');
                    break;    
                case HexagonType.Land:        
                default:
                    hex = game.createInstanceAsset('hexa-empty', '__land__');
                    break;
            }
        
            hex.rotation.y += this._randomInt(-6,6) * Math.PI/3; 
            hex.isVisible = true;
            // h.center.y = 10;
            hex.position.copyFrom(h.center); 
            hex.position.y = 100;
            // Add the mesh instance to the meshes list
            h.model = hex;

            var ease = new BABYLON.QuarticEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

            ressourceTimer = this._assignResourceModel(h, game);
            schedulerResources.add(ressourceTimer);

            timer.callback = () => {
                                
                BABYLON.Animation.CreateAndStartAnimation(
                    'pos', 
                    hex, 'position.y', 
                    60, 60, 
                    hex.position.y, h.center.y, 
                    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
                    ease);         
            }
            
            schedulerHexa.add(timer);
        }
        schedulerHexa.start();
    }
}