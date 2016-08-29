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
    public hexagons : Array<MapHexagon> = []; 
      
    constructor(game:Game, base : Base) {
        super(game, base);
    }
    
    /**
     * 10 Wood - 20 Rock
     */
    protected _initCost() { 
        // Init cost
        this._cost[Resources.Wood] = 10;
        this._cost[Resources.Rock] = 20;
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
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('base');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_baseExtensionFinishedMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(126, 138, 162);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    }

    /** 
     * Returns a 3D model corresponding to this shape
     */
    protected _getBuildingModel() : BABYLON.Mesh {
        return null;
    }
}