/**
 * A building point is a node in a building.
 * It's used to check the distance between two building : 
 * - overlapping
 * - neighbors
 */
class BuildingPoint {
    // The position of this point
    private _center : BABYLON.Vector3;
    
    // The building this point belongs to
    private _building : Building;
    
    // The distance between two neighbors
    private static DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    
    constructor(center : BABYLON.Vector3, building : Building){
        this._center = center;
        this._building = building;
    }
    
    /**
     * Returns the center of this hexagon in world coordinates (relative to the building);
     */
    get center() : BABYLON.Vector3 {
        if (this._building) {
            return this._center.add(this._building.position);
        } else {
            return this._center.clone();
        }
    }
    
    public equals(other:BuildingPoint) : boolean {
        return this.center.subtract(other.center).length() < BABYLON.Epsilon;
    }
    
    /**
     * Returns true if the two points are neighbors : their distance is lower than the distance bewteen two neighbors
     */
    static AreNeighbors(bp1: BuildingPoint, bp2:BuildingPoint) {
        return BABYLON.Vector3.Distance(bp1.center, bp2.center) < BuildingPoint.DISTANCE_BETWEEN_TWO_NEIGHBORS; 
    }    
}

/**
 * A building is something that can be built on the map (only on land). 
 * Every building is composed of a set of hexagon + 1 hexagon that will contain the 3D 
 * model (depending on the building)
 * Two building cannot overlap.
 * 
 */
abstract class Building extends BABYLON.Mesh{
    
    protected _game:Game;
    
    // The base this building belongs to
    protected _base : Base;
        
    // The place where minion will come to build this building
    protected _workingSite : MapHexagon;
    
    // The mesh : the set of hexagons composing the shape
    protected _shape : BABYLON.Mesh;
    
    // The 3D model of the building. Its parent is this building
    protected _buildingModel : BABYLON.AbstractMesh;
    
    // All resources incoming from builders. This building is nearly finished when resourcesIncoming == cost
    private _materialIncoming : ResourceMap<number> = [];
    
    // All materials brought by minions. The building is finished when materials == cost
    private _materials : ResourceMap<number> = [];
    
    // The ressources needed to build this building. Each subclass will define this amount in the constructor
    protected _cost : ResourceMap<number> = [];

    // All ressources that are taken by the building. This array is filled when the building is placed on the map
    private _usableResources : Array<MapHexagon>;
    
    // The list of points composing this building
    protected _points : Array<BuildingPoint> = [];
    
    // The building will have exactly nbHexa + 1 hexagons
    private _nbHexa : number;
            
    constructor(game:Game, base : Base, nbhexa : number = 4) {
        super('_building_', game.scene); 
        
        this._game = game;
        
        this._base = base;
        
        this._nbHexa = nbhexa;
        
        // Init the cost of this building
        this._initCost();
    }
    
    /**
     * Create the shape of the building: a set of 5 hexagons, setup randomly.
     */
    protected _initBuilding () : void {
        
        // Get a grid of hexgons composed of 3 rings (enough for 5 hexagons)
        let grid = MapHexagon.getDefaultGrid();
        let coordinates = grid.hexagon(0,0,3, true);
         
        // Shuffle an array
        let shuffle = (a) => {
            let j, x, i;
            for (i = a.length; i; i -= 1) {
                j = Math.floor(Math.random() * i); 
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        };
        
        // Returns true if the building point is already in the building
        let isInBuilding = (bp:BuildingPoint) : boolean => {
            for (let p of this._points) {
                if (p.equals(bp)){
                    return true;
                }
            }
            return false;
        };
        
        // returns a random neighbor of the given hex
        let getNext = (q, r) : {point:BuildingPoint, q:number, r:number} => {
            let neighbors = grid.neighbors(q, r);
            shuffle(neighbors);
            for (let i=0; i<neighbors.length; i++) {
                let center = grid.getCenterXY(neighbors[i].q, neighbors[i].r);
                let bp = new BuildingPoint(new BABYLON.Vector3(center.x, 0, center.y), this);
                if (!isInBuilding(bp)) { 
                    return {
                        point:bp, 
                        q:neighbors[i].q,
                        r:neighbors[i].r
                    };
                }
            }                    
            return null;        
        };        
        
        // Start a random shape with the center of the grid and iterate over neighbors
        let currentHex = coordinates[0];
        let center = grid.getCenterXY(currentHex.q, currentHex.r);
        let first = new BuildingPoint(new BABYLON.Vector3(center.x, 0, center.y), this);
        this._points.push(first);
        
        for (let i=0; i< this._nbHexa; i++) {
            let next = getNext(currentHex.q, currentHex.r);
            if (!next) break;                        
            this._points.push(next.point);
            currentHex.q = next.q, currentHex.r = next.r;
        } 
    }    
    
    /**
     * Propagate the material of this node to the shape mesh only.
     */
    set material(value:BABYLON.Material) {
        if (this._shape) {
            this._shape.material = value;
        }
    }
    get material() : BABYLON.Material {  
        return this._shape.material
    }
    
    get workingSite() : MapHexagon {
        return this._workingSite;
    }
    get points () : Array<BuildingPoint> {
        return this._points;
    }
    get usableResources() : Array<MapHexagon> {
        return this._usableResources;
    }
    
    /**
     * Returns true if the building can be built (ressources are sufficient)
     */
    public canBuild() : boolean {
        // Browser resources needed and check if the game has enough
        let canBuild = true;
        for (let r in this._cost) {
            canBuild = canBuild && this._game.resources[r] >= this._cost[r]; 
        }
        return canBuild;
    }
    
    /**
     * Init the cost of this building
     */
    protected abstract _initCost() : void;
    
    /**
     * Returns the 3D model of the building to add on hexagons. 
     * The 3D model returned should have its position set one buildingpoint. Can be null
     */
    protected abstract _getBuildingModel() : BABYLON.AbstractMesh;
    
    /**
     * Create a mesh from an asset name that can be merged at will
     */
    private _createBaseBuildingMesh(name:string) : BABYLON.AbstractMesh {
        var toMerge = [];
        let model = this._game.assets[name];
        var childrens = model.getDescendants();
        for (var i = 0; i < childrens.length; i++) {
            toMerge.push(childrens[i].clone());     
        }        
        return BABYLON.Mesh.MergeMeshes(toMerge, true);
    }
    
    /**
     * Create the shape of the building.
     */
    private _createBuildingMesh() : BABYLON.Mesh {
        // Merge all cylinders
        let hexes = [];        
        let mesh = new BABYLON.Mesh('', this._game.scene);
        for (let p of this._points) { 
            let center = p.center;
            let myhex = this._createBaseBuildingMesh('hexa-selected');
            myhex.position.copyFrom(center);
            hexes.push(myhex);
        }
        var merged = BABYLON.Mesh.MergeMeshes(hexes, true);
        return merged; 
    }
    
    /**
     * Returns true if this building overlap with the one given as a parameter
     */
    public overlaps (building: Building) : boolean {
        
        for (let p of  this._points) {
            for (let otherP of building.points) {
                if (p.equals(otherP)) {
                    return true;
                }
            }
        }        
        return false;
    }
    
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
        this._shape = this._createBuildingMesh();
        var arc= <BABYLON.ArcRotateCamera> this._game.scene.activeCamera;
        arc.setTarget(this._shape.position);
        this._shape.parent = this;
        
        // Create the 3D model of the building        
        // Add the building and merge it with hexagons
        this._buildingModel = this._getBuildingModel();
        if (this._buildingModel) {
            this._buildingModel.parent = this;
        }
        
        // Set prebuild material
        this._setPrebuildMaterial();
    }    
    
    /**
     * The building is now attached to the player base and is ready to be built
     * by minions.
     * @param hexagons The list of hexagons the building will be built on
     * @param workingSite The hexagon where the minion should come to build this building
     */
    public prepareToBuildOn(workingSite: MapHexagon, resources : Array<MapHexagon>) : void {
        // set usable resource
        this._usableResources = resources;

        // Set the working site
        this._workingSite = workingSite;
        
        // Set 'waiting for build' material
        this._setWaitingForMinionMaterial();
        
        // Wake up minions
        this._game.wakeUpBuilders();
    }
    
    /**
     * Method called when the building is finished to built on the player base
     */
    public finishBuild() : void {
                
        // Set 'waiting for build' material
        this._setFinishedMaterial();     
        
        // Notify the base this building is finished
        this._base.buildingFinished(this);   
    }
    
    //----------------------
    // MATERIAL MANAGEMENT
    //----------------------
    
    /**
     * Returns true if the building is finished or being finished.
     * Returns true if resourcesIncoming == cost
     */
    public isNearlyFinished() : boolean {
        for (let res in this._cost) {
            if (this._materialIncoming[res] !== this._cost[res]) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Returns true when this building is finished : materials == cost
     */
    public isFinished() : boolean {
        for (let res in this._cost) {
            if (this._materials[res] !== this._cost[res]) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Returns all resources needed by the building in order to construct it.
     * Returns cost - resourcesIncoming
     */
    public getNeededResources() : ResourceMap<number> {
        let result = [];
        
        for (let res in this._cost) {
            if (this._materialIncoming[res]) {
                let diff = this._cost[res] - this._materialIncoming[res];
                if (diff > 0) {                    
                    result[res] = diff;
                } // Else don't add this resource as needed
            } else {
                result[res] = this._cost[res];
            }
        }
        
        return result;
    }
    
    /**
     * Add the given resource into the incomingResources of this building.
     */
    public addIncomingMaterial(amount:number, res:Resources) {
        if (! this._materialIncoming[res]) {
            this._materialIncoming[res] = amount;      
        } else {
            this._materialIncoming[res] += amount;            
        }
    }

    /**
     * Restore the incoming resource of the building
     */
    public restoreIncomingMaterial(amount:number, res:Resources) {
        this._materialIncoming[res] -= amount;   
    }
    
    /**
     * Add the given material into the materials array of this building.
     */
    public addMaterial(amount:number, res:Resources) {
        if (! this._materials[res]) {
            this._materials[res] = amount;      
        } else {
            this._materials[res] += amount;            
        }
    }
}