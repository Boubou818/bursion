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
    
    // The time to build in milliseconds
    protected _constructionTime : number;
        
    // The place where minion will come to build this building
    protected _workingSite : MapHexagon;
    
    // The mesh : the set of hexagons and the 3D model of the building 
    protected _child : BABYLON.Mesh;
    
    // The ressources needed to build this building. Each subclass will define this amount in the constructor
    protected _resourcesNeeded : ResourceMap<number> = [];
    
    // The list of points composing this building
    protected _points : Array<BuildingPoint> = [];
    
    // Set to true when a minion is taking care of this building
    public waitingToBeBuilt : boolean = false;
            
    constructor(game:Game) {
        super('_building_', game.scene); 
        
        this._game = game;
        
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
 
        let size = 5;//Math.floor(((Math.random() * (6 - 3)) + 3)); // random [3;6[
        
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
        
        for (let i=0; i<size; i++) {
            let next = getNext(currentHex.q, currentHex.r);
            if (!next) break;                        
            this._points.push(next.point);
            currentHex.q = next.q, currentHex.r = next.r;
        } 
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
    get points () : Array<BuildingPoint> {
        return this._points;
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
     * Retuens the 3D model of the building to add on hexagons. 
     * The 3D model returned should have its position set one buildingpoint
     */
    protected abstract _getBuildingModel() : BABYLON.Mesh;
    
    /**
     * Create the shape of the building.
     */
    private _createBuildingMesh() : BABYLON.Mesh {
        // Merge all cylinders
        let hexes = [];        
        for (let p of this._points) {
            let center = p.center;
            let myhex = BABYLON.Mesh.CreateCylinder('', 0.5, 2, 2, 6, 1, this.getScene());
            myhex.rotation.y = Math.PI/2;
            myhex.position.copyFrom(center);
            myhex.position.y = 0.65;
            hexes.push(myhex);
        }
        // Add the building and merge it with hexagons
        hexes.push(this._getBuildingModel());
        return BABYLON.Mesh.MergeMeshes(hexes, true);
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
    public prepareToBuildOn(workingSite: MapHexagon) : void {
                
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