
/**
 * A building is something that can be built in the player base. 
 * There is several kind of building : 
 * - Meat processing (meat ++)
 * - Hut (minion ++)
 * - base extension, that needs to be built above land
 */
abstract class Building extends BABYLON.Mesh{
    
    protected _game:Game;
    
    // The time to build in milliseconds
    protected _constructionTime : number;
    
    // The place where minion will come to build this building
    protected _workingSite : MapHexagon;
    
    // The 3D model of the ship
    protected _child : BABYLON.Mesh;
    
    // The list of map hexagons this building takes
    protected _hexagons : Array<MapHexagon> = [];
    
    // The ressources needed to build this building. Each subclass will define this amount in the constructor
    protected _resourcesNeeded : ResourceMap<number> = [];
    
    // Set to true when a minion is taking care of this building
    public waitingToBeBuilt : boolean = false;
            
    constructor(game:Game) {
        super('_building_', game.scene); 
        
        this._game = game;
        
        // Init the cost of this building
        this._initCost();
    }
    
    /**
     * Propagate the material of this node to the child mesh.
     */
    set material(value:BABYLON.Material) {
        if (this._child) {
            this._child.material = value;
        }
    }
    get material() : BABYLON.Material {  
        return this._child.material
    }
    
    get workingSite() : MapHexagon {
        return this._workingSite;
    }
    
    /**
     * Returns true if the building can be built (ressources are sufficient)
     */
    public canBuild() : boolean {
        // Browser resources needed and check if the game has enough
        let canBuild = true;
        for (let r in this._resourcesNeeded) {
            canBuild = canBuild && this._game.resources[r] >= this._resourcesNeeded[r]; 
        }
        return canBuild;
    }
    
    /**
     * Init the cost of this building
     */
    protected abstract _initCost() : void;
    
    /**
     * Create the shape of the building.
     */
    protected abstract _createBuildingMesh() : BABYLON.Mesh;
    
    /**
     * Function used to init the building (create a set of hexagon for example for 
     * BaseExtension...)
     * @param data Any kind of data the building need to initialize
     */
    protected abstract _initBuilding(data?:any) : void;
    
    /**
     * Set the 'waiting for minion' material to this building
     */
    protected abstract _setWaitingForMinionMaterial() : void;
    protected abstract _setPrebuildMaterial() : void;
    protected abstract _setFinishedMaterial() : void;
        
    /**
     * Create the child mesh corresponding to the building,
     * and attach it to this node. In mode prebuild, the building is attached to 
     * the mouse.
     */
    public preBuild():void {
        // Init building
        this._initBuilding();
        
        // Create it      
        this._child = this._createBuildingMesh();
        this._child.parent = this;
        
        // Set prebuild material
        this._setPrebuildMaterial();
    }    
    
    /**
     * The building is now attached to the player base and is ready to be built
     * by minions.
     * @param hexagons The list of hexagons the building will be built on
     * @param workingSite The hexagon where the minion should come to build this building
     */
    public prepareToBuildOn(hexagons : Array<MapHexagon>, workingSite: MapHexagon) : void {
        // Save the list of hexagons taken by this building
        this._hexagons = hexagons.slice();
        
        // Set the working site
        this._workingSite = workingSite;
        
        // Set 'waiting for build' material
        this._setWaitingForMinionMaterial();
        
        // Waiting for a minion to build this building
        this.waitingToBeBuilt = true;
    }
    
    /**
     * Method called when the building is finished to built on the player base
     */
    public finishBuild(base : Base) : void {
        
        // No more waiting
        this.waitingToBeBuilt = false;
        
        // Set 'waiting for build' material
        this._setFinishedMaterial();     
        
        // Notify the base this building is finished
        base.buildingFinished(this);   
    }
}