/**
 * A base extension is a set of 3/4/5 hexagons, used to expand the player base.
 * Minion can only walk on base extension, and buildings can only be built on base extension.
 * Resource can only be harvested on base extension.
 * When a base extension is setup, all hexagon of the map below are disposed.
 * Hexagon coordinates are relative to the shape.
 * The center of the shape is the first hexagon at (0,0).
 */
class BaseExtension extends Building {
    
    // The set of hexagons. These hexagons does not contains any resources
    public hexagons : Array<Hexagon> = []; 
      
    constructor(game:Game) {
        super(game);
    }
    
    /**
     * 10 Wood - 20 Rock
     */
    protected _initCost() { 
        // Init cost
        this._resourcesNeeded[Resources.Wood] = 10;
        this._resourcesNeeded[Resources.Rock] = 20;
    }
    
    
    /**
     * Create and set the base extension material
     */
    protected _setWaitingForMinionMaterial() : void {
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_baseExtensionMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_baseExtensionMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(255, 152, 0);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }
    
    /**
     * Create and set the prebuild base extension material
     */
    protected _setPrebuildMaterial() : void {        
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_baseExtensionWaitingMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_baseExtensionWaitingMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.Green();
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }
    /**
     * Create and set base extension material
     */
    protected _setFinishedMaterial() : void {        
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_baseExtensionFinishedMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_baseExtensionFinishedMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(126, 138, 162);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }

    /**
     * Create the shape, which has a random size between 3 and 5 hexs.
     */
    protected _initBuilding () {
        
        let grid = Hexagon.getDefaultGrid();
        let coordinates = grid.hexagon(0,0,3, true);
 
        let size = Math.floor(((Math.random() * (6 - 3)) + 3)); // random [3;6[
        
        // Shuffle an array
        let shuffle = (a) => {
            let j, x, i;
            for (i = a.length; i; i -= 1) {
                j = Math.floor(Math.random() * i); 
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        }
        
        // returns a random neighbor of the given hex
        let getNext = (q, r) => {
            let neighbors = grid.neighbors(q, r);
            shuffle(neighbors);
            for (let i=0; i<neighbors.length; i++) {
                let hex = new Hexagon(neighbors[i].q, neighbors[i].r, grid, this);
                if (!this._isInShape(hex)) { 
                    return hex;
                }
            }                    
            return null;        
        }
        // Start a random shape with the center of the grid and iterate over neighbors
        let currentHex = coordinates[0];
        let first = new Hexagon(currentHex.q, currentHex.r, grid, this);
        this.hexagons.push(first);
        
        for (let i=0; i<size; i++) {
            let next = getNext(currentHex.q, currentHex.r);
            if (!next) break;                        
            this.hexagons.push(next);
            currentHex.q = next.q, currentHex.r = next.r;
        } 
    }    

    /** 
     * Returns a 3D model corresponding to this shape
     */
    protected _createBuildingMesh() : BABYLON.Mesh {
        // Merge all cylinders
        let hexes = [];        
        this.hexagons.forEach((hex) => {
            let center = hex.getWorldCenter();
            let myhex = BABYLON.Mesh.CreateCylinder('', 0.5, 2, 2, 6, 1, this.getScene());
            myhex.rotation.y = Math.PI/2;
            myhex.position.copyFrom(center);
            myhex.position.y = 0.65;
            hexes.push(myhex);
        });
        return BABYLON.Mesh.MergeMeshes(hexes, true);
    }
    
    /**
     * Returns -1 if the given hex is not in the shape
     */
    protected _isInShape(hex:Hexagon) {
        for (let i=0; i<this.hexagons.length; i++) {
            if (this.hexagons[i].equals(hex)){
                return true;
            }
        }
        return false;
    }
    
    /**
     * Returns true if two extensions are overlapping. 
     * There is an overlap if at least one hexagon is overlapping wioth another one
     */
    public overlaps (other:BaseExtension) : boolean {
        for (let hex of this.hexagons) {
            for (let otherHex of other.hexagons) { 
                if (hex.overlaps(otherHex)) {
                    return true;
                }
            }   
        } 
        return false;             
    } 
   
}

class StarterExtension extends BaseExtension {
       
    // Q and R coordinates of a starter platform
    private static TEMPLATE : Array<number> = [
        -1, 1,
        0, 0,
        1, 0, 
        2, 0, 
        0, 1, 
        1, 1,
        2, 1
        ];        
        
    constructor(game) {
        super(game);  
    }
    
    protected _initCost() {   
        this._resourcesNeeded[Resources.Wood] = 0;
        this._resourcesNeeded[Resources.Rock] = 0;
    }
    
    /**
     * The starter extension 
     */
    protected _initBuilding (data?:any) {
        
        let grid = Hexagon.getDefaultGrid();
        let coordinates = grid.hexagon(0,0,3, true);
 
        // Use template
        for (let i=0; i<StarterExtension.TEMPLATE.length-1; i+=2) {
            this.hexagons.push(new Hexagon(StarterExtension.TEMPLATE[i], StarterExtension.TEMPLATE[i+1], grid, this));
        }
        // No resources slots for template
    }
}