declare var Graph : any;
/**
 * Contains the player base : 
 * - the field where minions can walk on,
 * - all building built by the player
 * 
 */
class Base {
    
    // The list of buildings of the base. Minions can walk on each one of these buildings
    private _buildings : Array<any> = [];

    // All resources hexagones unfolded in a single array. Updated each time a new building is built
    private _hexUnfolded : Array<Hexagon> = [];
    
    // The Djikstra graph
    public graph : any;

    // The map where the player base will be built on
    private _map : HexagonGrid;
    
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    constructor(scene:BABYLON.Scene, map : HexagonGrid) {
        this._map = map;
        let starter = new Building(scene, Building.STARTER_TEMPLATE);
        this.addBuilding(starter);
    }

    /**
     * Returns the first hexagon of the base
     */
    public getStarterHex() : Hexagon {
        return this._hexUnfolded[0];
    }
    
    /**
     * Add a building to the player base. The graph is updated.
     */
    public addBuilding(building : Building) {
        this._buildings.push(building);
        
        // Unfold all hexagons of the map
        for (let hex of building.getResourcesOnMap(this._map)) {               
            this._hexUnfolded.push(hex);           
        }
        
        this._createMap();
    }
    
    /**
     * Create the base map : 
     * - link between neighbors
     * - Locate resources
     */
    private _createMap() {
        
        this.graph = new Graph();

        for (let hex1 of this._hexUnfolded) {
            let neighbors = {}; 
            for (let hex2 of this._hexUnfolded) { 
                if (Hexagon.areNeighbors(hex1, hex2)) {
                    neighbors[hex2.name] = 1;
                } 
            }
            this.graph.addVertex(hex1.name, neighbors);
        }        
    }

    /**
     * Returns the hexagon corresponding to the given name
     */
    private _getHexByName(name:string) {
        for (let hex1 of this._hexUnfolded) {
            if (hex1.name === name) {
                return hex1;
            }
        }
        console.warn('No hexagon with name ', name);
        return null;
    }

    public getHexByName(name) {
        return this._getHexByName(name);
    }
        
    /**
     * Retursn true if the given shape can be built here : 
     * that means no overlap with another shape, and it must be 
     * connected with at least one shape.
     */
    public canBuildHere (shape:Building) {
        for (let s of this._buildings) {
            if (shape.overlaps(s)) {
                return false;
            } 
        }
        //  TODO Connected with at least one shape : there is at least one 
        // hexagon of the new shape with distance < DISTANCE_BETWEEN_NEIGHBORS
        let areConnected = false;
        for (let sHex of shape.hexagons) {
            for (let bHex of this._hexUnfolded) {
                areConnected = areConnected || Hexagon.areNeighbors(sHex, bHex)
            }
        }
        return areConnected;
    }

    /**
     * Returns the shortest path from the given hex to the given hex.
     */
    public getPathFromTo(from: Hexagon, to:Hexagon) : Array<Hexagon>{
        let pathString = this.graph.shortestPath(from.name, to.name).reverse();
        let pathHex = [];
        for (let str of pathString) {
            pathHex.push(this._getHexByName(str));
        }
        return pathHex;
    }

    /**
     * Locate the nearest resource slot containing wood on the map.
     * Returns the hexagon (containing a woodresource not empty) 
     * which is the nearest of the given position. Returns null if no such hexagon is found.
     */
    public getNearestWoodHexagon(hexagon:Hexagon) : Hexagon {
        let nearest = null;
        let distance = Number.POSITIVE_INFINITY;

        for (let hex of this._hexUnfolded) {
            if (hex.resourceSlot.resource instanceof Wood) {
                // Check availability of the resource
                if (hex.resourceSlot.isAvailable()) {
                    // Check distance
                    let currentDist = this.getPathFromTo(hexagon, hex).length;
                    console.log(currentDist);
                    if (currentDist < distance) {
                        nearest = hex;
                        distance = currentDist;
                    }
                }
            }
        }
        return nearest;
    }



       
    
    
}