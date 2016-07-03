/// <reference path="shapes/HexagonSet.ts" />

declare var Graph : any;
/**
 * Contains the player base : the field where minions can walk on.
 */
class Base {
    
    // The list of buildings of the base. Minions can walk on each one of these buildings
    private _buildings : Array<any> = [];
    
    // The Djikstra graph
    private _graph : any;
    
    constructor() {
    }
    
    /**
     * Add a building to the player base. The graph is updated.
     */
    public addBuilding(building : HexagonSet) {
        this._buildings.push(building);
        
        this._createMap();
    }
    
    private _createMap() {
        
        this._graph = new Graph();
        
        let allHexs = [];
        for (let b of this._buildings) {
            for (let hex of b.hexagons) {               
                allHexs.push(hex);              
            }
        }
         for (let hex1 of allHexs) {
            for (let hex2 of allHexs) {   
                console.log(BABYLON.Vector3.DistanceSquared(hex1.getWorldCenter(), hex2.getWorldCenter()));     
            }
        }
        
    }
    
    
    
}