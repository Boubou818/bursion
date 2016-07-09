declare var Grid : any;

/**
 * The hexagonal grid, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource
 */
class HexagonGrid {
    
    // The Hexagon grid
    private  _grid : Array<Hexagon> = [];   
    
    constructor(size:number) {
        let grid         = Hexagon.getDefaultGrid();
        
        let coordinates = grid.hexagon(0, 0 ,size, true);  
        for (let c of coordinates) {
            let hex = new Hexagon(c.q, c.r, grid);

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

            this._grid.push(hex); 
        }
    }
    
    /**
     * Returns the hexagon the nearest of the given position. Used to snap a building on the nearest hex.
     */
    public getNearestHex (p:BABYLON.Vector3) : Hexagon {
        let min = 99999,
        res = null;
        this._grid.forEach((hex:Hexagon) => {
            let dist = BABYLON.Vector3.DistanceSquared(hex.getWorldCenter(), p);
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
    public getResourceHex(hexagon : Hexagon) : Hexagon {

        for (let hex of this._grid) {
            let dist = Hexagon.distanceSquared(hexagon, hex);
            if (dist < BABYLON.Epsilon) {
               return hex;
            }
        }

        return null;
    }
    
    /**
     * Draw the hexagon grid in the given scene
     */
    public draw(scene) {
        
        let ref = BABYLON.Mesh.CreateCylinder('', 0.1, 1.9, 1.9, 6, 1, scene);
        ref.rotation.y = Math.PI/2;
        ref.isVisible = false;

        // Wood
        let woodRef = BABYLON.Mesh.CreateCylinder('_wood_', 2, 0.3, 0.3, 6, 1, scene);
        woodRef.isVisible = false;
        let woodMaterial = new BABYLON.StandardMaterial('', scene);
        woodMaterial.diffuseColor = BABYLON.Color3.FromInts(120, 216, 17);
        woodRef.material = woodMaterial;

        // Rock
        let rockRef = BABYLON.Mesh.CreateCylinder('_rock_', 2, 0.3, 0.3, 6, 1, scene);
        rockRef.isVisible = false;
        let rockMaterial = new BABYLON.StandardMaterial('', scene);
        rockMaterial.diffuseColor = BABYLON.Color3.FromInts(170,170,170);
        rockRef.material = rockMaterial;
        
        for (let h of this._grid){
           
            let hex = ref.createInstance(''+h.q+' '+h.r);
            hex.isVisible = true;
            hex.position.copyFrom(h.getWorldCenter());     

            // Resource
            if (h.resourceSlot.resource === Resources.Wood) {
                let wood = woodRef.createInstance('wood');
                wood.isVisible = true;
                wood.position.copyFrom(h.getWorldCenter());
            }
            if (h.resourceSlot.resource === Resources.Rock) {
                let rock = rockRef.createInstance('rock');
                rock.isVisible = true;
                rock.position.copyFrom(h.getWorldCenter());
            }
                 
        };
    }
}