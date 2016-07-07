/// <reference path="buildings/Building.ts" />

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

    // All hexagones of all building unfolded in a single array. Updated each time a new building is built
    private _hexUnfolded : Array<Hexagon> = [];
    
    // The Djikstra graph
    public graph : any;
    
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    constructor(scene:BABYLON.Scene) {
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
        for (let hex of building.hexagons) {               
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
                let dist = BABYLON.Vector3.Distance(hex1.getWorldCenter(), hex2.getWorldCenter()); 
                if (dist < Hexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS) { 
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
        return true;
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
     * Locate the nearest resource slot containing the given resource
     */
    private _findResource(resource:any) {
        
    }



       
    
    
}