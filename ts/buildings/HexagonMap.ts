declare var Grid : any;

/**
 * The hexagonal map, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource, and is a specific type : land, water, beach, deepawater...
 */
class HexagonMap {
    
    // The Hexagon grid containing land, water and deepwater hexagons
    private  _map : Array<MapHexagon> = [];   

    // The numbre of rings the map has
    private _size : number;
    
    // The starting position on the map
    private _basePosition : MapHexagon = null;
    
    // The starting position of the drakkar on the map
    private _drakkarPosition : MapHexagon = null;
    
    // The list of all hexagons meshes on the map, indexed by hexagon name
    private _meshes : {[hexName:string] : BABYLON.AbstractMesh} = {};
    
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
                let randomInt = Math.floor(Math.random() * 2); // random int between 0 and 1, two resources : wood and rock
                let randomProba = Math.random();
                switch (randomInt) {
                    case 0:
                        if (randomProba < Resources.getProbability(Resources.Wood)) {
                            hex.resourceSlot.resource = Resources.Wood;
                        } //else it's empty by default
                        break;
                    case 1 : 
                        if (randomProba < Resources.getProbability(Resources.Rock)) {
                            hex.resourceSlot.resource =Resources.Rock;
                        } //else it's empty by default
                
                    default:
                        break;
                }
            }
            this._map.push(hex); 
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
        this._map.forEach((hex:MapHexagon) => {
            let dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
            if (dist < min) {
                min = dist;
                res = hex;
            }
        });
        return res;
    }

    /**
     * Returns the hexagon present on the map corresponding to the given position
     */
    public getResourceHex(p : BuildingPoint) : MapHexagon {

        for (let hex of this._map) {
            let dist = hex.distanceToPoint(p);
            if (dist < BABYLON.Epsilon) {
               return hex;
            }
        }
        return null;
    }
    
    /**
     * Returns the hexagon of the map corresponding to the given coordinates.
     * Returns null if not found
     */
    private _getHexagonByHexCoordinates(q : number, r:number) : MapHexagon {
        for (let hex of this._map) {
            if (hex.q == q && hex.r == r) {
                return hex;
            }   
        }
        return null;
    }
    
    /**
     * Remove the given hex from the map
     */
    public removeMapHex(hexagon:MapHexagon) {
        if (hexagon) {
            let mapHex = this._meshes[hexagon.name];
            if (mapHex) {
                mapHex.dispose();
                this._meshes[hexagon.name] = null;
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
    
    /**
     * Draw the hexagon grid in the given scene.
     * Hexagons and resources are two different models.
     */
    public draw(game:Game) {

        let scene : BABYLON.Scene = game.scene;
                
        // land
        let land = BABYLON.Mesh.CreateCylinder('', 1.5, 1.9,1.9, 6, 1, scene);
        land.rotation.y = Math.PI/2;
        land.isVisible = false;
        land.convertToUnIndexedMesh();
        let landMaterial = new BABYLON.StandardMaterial('grass', scene);
        landMaterial.diffuseColor = BABYLON.Color3.FromInts(161, 176, 51);
        landMaterial.specularColor = BABYLON.Color3.Black();
        land.material = landMaterial;
        
        // beach
        let beachRef = BABYLON.Mesh.CreateCylinder('', 1, 1.95, 1.95, 6, 1, scene);
        beachRef.rotation.y = Math.PI/2;
        beachRef.isVisible = false;        
        beachRef.convertToUnIndexedMesh();
        let beachMaterial = new BABYLON.StandardMaterial('beach', scene);
        beachMaterial.diffuseColor = BABYLON.Color3.FromInts(255,232,204);
        beachMaterial.specularColor = BABYLON.Color3.Black();
        beachRef.material = beachMaterial;

        // water1
        let water1Ref = BABYLON.Mesh.CreateCylinder('', 0.8, 1.95, 1.95, 6, 1, scene);
        water1Ref.rotation.y = Math.PI/2;
        water1Ref.isVisible = false;
        water1Ref.convertToUnIndexedMesh();
        let water1Material = new BABYLON.StandardMaterial('grass', scene);
        water1Material.diffuseColor = BABYLON.Color3.FromInts(77, 119, 99);
        water1Material.specularColor = BABYLON.Color3.Black();
        water1Ref.material = water1Material;

        // water2 - deeper  
        let water2Ref = BABYLON.Mesh.CreateCylinder('', 0.6, 1.97, 1.97, 6, 1, scene);
        water2Ref.rotation.y = Math.PI/2;
        water2Ref.isVisible = false;
        water2Ref.convertToUnIndexedMesh();
        let water2Material = new BABYLON.StandardMaterial('grass', scene);
        water2Material.diffuseColor = BABYLON.Color3.FromInts(38, 62, 66);
        water2Material.specularColor = BABYLON.Color3.Black();
        water2Ref.material = water2Material;   

        // Rock
        let rockRef = BABYLON.Mesh.CreateCylinder('_rock_', 2, 0.3, 0.3, 6, 1, scene);
        rockRef.isVisible = false;
        let rockMaterial = new BABYLON.StandardMaterial('', scene);
        rockMaterial.diffuseColor = BABYLON.Color3.FromInts(170,170,170);
        rockRef.material = rockMaterial;
        
        for (let h of this._map){

            let hex = null;
            switch (h.type) {
                case HexagonType.DeepWater:
                    hex = water2Ref.createInstance(''+h.q+' '+h.r);
                    break;    
                case HexagonType.Water:
                    hex = water1Ref.createInstance(''+h.q+' '+h.r);
                    break;    
                case HexagonType.Beach:
                    hex = beachRef.createInstance(''+h.q+' '+h.r);
                    break;    
                case HexagonType.Land:        
                default:
                    hex = land.createInstance(''+h.q+' '+h.r);
                    break;
            }
           
            hex.isVisible = true;
            hex.position.copyFrom(h.center); 
            
            hex.freezeWorldMatrix();  
            
            // Add the mesh instance to the meshes list
            this._meshes[h.name] = hex;

            if (h.resourceSlot.resource === Resources.Wood) {
                let wood = game.assets['tree'].clone();//Resources.getModelForResource(game, h.resourceSlot.resource);
                // let wood = basemesh.clone('_resource_');                
                wood.setEnabled(true);
                wood.position.copyFrom(h.center);
                wood.position.y = 0.75;
                // wood.rotation.y = Math.random()-0.5;
                wood.scaling.scaleInPlace(this._random(0.3,0.8));
            }
            if (h.resourceSlot.resource === Resources.Rock) {
                let rock = game.assets['rock'].clone();//Resources.getModelForResource(game, h.resourceSlot.resource);
                // let wood = basemesh.clone('_resource_');                
                rock.setEnabled(true);
                rock.position.copyFrom(h.center);
                rock.position.y = 0.75;
                // wood.rotation.y = Math.random()-0.5;
                rock.scaling.scaleInPlace(this._random(0.3,0.8));
            }


            //     wood.isVisible = true;
            //     wood.position.copyFrom(h.center);
            //     wood.freezeWorldMatrix();
            // }
            // if (h.resourceSlot.resource === Resources.Rock) {
            //     let rock = rockRef.createInstance('rock');
            //     rock.isVisible = true;
            //     rock.position.copyFrom(h.center);
            //     rock.freezeWorldMatrix();
            // }            
        }
    }
}