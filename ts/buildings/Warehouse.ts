
class Warehouse extends Building {

    // The stock of this warehouse
    protected _stock : ResourceMap<number> = [];
    
    constructor(game : Game, base : Base) {
        super(game, base);  
    }
     
    protected _initCost() {   
        this._cost[Resources.Wood] = 20;
        this._cost[Resources.Rock] = 20;
    }
    
    /**
     * Returns the amount of material for the given resource
     */
    public getStockOf(res : Resources) {
        if (this._stock[res]) {
            return this._stock[res];
        } else {
            return 0;
        }
    }
    
    /** 
     * Returns a 3D model corresponding to this shape
     */
    protected _getBuildingModel() : BABYLON.Mesh {
        let b = BABYLON.Mesh.CreateBox('_warehouse_', 0.5, this._game.scene);
        b.position.copyFrom(this._points[this._points.length-1].center);
        return b;
    }
    /**
     * Create and set base extension material
     */
    protected _setFinishedMaterial() : void {        
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_warehouseFinishedMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_warehouseFinishedMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(255,0,0);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }
    /**
     * Create and set the prebuild base extension material
     */
    protected _setPrebuildMaterial() : void {        
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_warehouseWaitingMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_warehouseWaitingMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.Blue();
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }
    
    /**
     * Create and set the base extension material
     */
    protected _setWaitingForMinionMaterial() : void {
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_warehouseMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_warehouseMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.Yellow();
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }

    /**
     * Add the given stock to the warehouse
     * TODO
     */
    public add (amount:number, res : Resources) {
        if (! this._stock[res]) {
            this._stock[res] = amount;      
        } else {
            this._stock[res] += amount;            
        }
    }

    /**
     * Take from stock the given amount of resources
     * TODO
     */
    public take (amount:number, res : Resources) {
        this._stock[res] -= amount;    
    }
    
    
}

class StarterWarehouse extends Warehouse {
    
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
        
    protected _initCost() {   
        this._cost[Resources.Wood] = 0;
        this._cost[Resources.Rock] = 0;
    }
    
    /**
     * The starter extension 
     */
    protected _initBuilding () {
        
        let grid = MapHexagon.getDefaultGrid();
        let coordinates = grid.hexagon(0,0,3, true);
 
        // Use template
        for (let i=0; i<StarterWarehouse.TEMPLATE.length-1; i+=2) {
            let center = grid.getCenterXY(StarterWarehouse.TEMPLATE[i],StarterWarehouse.TEMPLATE[i+1]);
            this._points.push(new BuildingPoint(new BABYLON.Vector3(center.x, 0, center.y), this));
        }  
        
        // Init stock
        this._stock[Resources.Wood] = 100;
        this._stock[Resources.Rock] = 100;
        this._stock[Resources.Meat] = 100;
    }
    
    // This building is finished
    public isNearlyFinished() : boolean {        
        return true;
    }
}