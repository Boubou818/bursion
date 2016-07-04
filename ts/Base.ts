/// <reference path="shapes/HexagonSet.ts" />

declare var Graph : any;
/**
 * Contains the player base : the field where minions can walk on.
 */
class Base {
    
    // The list of buildings of the base. Minions can walk on each one of these buildings
    private _buildings : Array<any> = [];

    private _hexUnfolded : Array<Hexagon> = [];
    
    // The Djikstra graph
    public graph : any;
    
    constructor() {
    }
    
    /**
     * Add a building to the player base. The graph is updated.
     */
    public addBuilding(building : HexagonSet) {
        this._buildings.push(building);
        
        // Unfold all hexagons of the map
        for (let hex of building.hexagons) {               
            this._hexUnfolded.push(hex);              
        }
        
        this._createMap();
    }
    
    private _createMap() {
        
        this.graph = new Graph();

        for (let hex1 of this._hexUnfolded) {
            let neighbors = {}; 
            for (let hex2 of this._hexUnfolded) { 
                let dist = BABYLON.Vector3.Distance(hex1.getWorldCenter(), hex2.getWorldCenter()); 
                if (dist < 1.75) { // FIXME HARDCODED VALUE = distance between two neighbors hexagons
                    neighbors[hex2.name] = 1;
                } 
            }
            this.graph.addVertex(hex1.name, neighbors);
        }        
    }

    /**
     * Returns the hexagon corresponding to the given name
     */
    public getHexByName(name:string) {
        for (let hex1 of this._hexUnfolded) {
            if (hex1.name === name) {
                return hex1;
            }
        }
        console.warn('No hexagon with name ', name);
        return null;
    }

       
    
    
}