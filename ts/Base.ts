declare var Graph : any;
/**
 * Contains the player base : 
 * - the field where minions can walk on,
 * - all building built by the player
 * 
 * At the beginning of the game, the base is composed of a starting extension, and a drakkar.
 */
class Base {
    
    // The list of building (all status : waiting, finished...) in the base
    private _buildings : Array<Building> = [];

    // All resources hexagones coming from baseextensions unfolded in a single array. Updated each time a new building is built
    private _hexUnfolded : Array<MapHexagon> = [];
    
    // The fog of war that will be updated each time an extension is built
    private _fogOfWar : FogOfWar;
    
    // The Djikstra graph
    public graph : any = new Graph();
    
    // The game instance
    private _game : Game;

    // The map where the player base will be built on
    private _map : HexagonMap;
    
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    constructor(game:Game, map : HexagonMap) {
        this._map = map;
        this._game = game;
        let starter = new StarterWarehouse(game, this);
        starter.preBuild();
        
        // Set the base on the starting position of the map
        let starterPosition : MapHexagon = this._map.basePosition;
        starter.position.copyFrom(starterPosition.center);
        
        let drakkarPosition : MapHexagon = this._map.drakkarPosition;
        let drakkar = BABYLON.Mesh.CreateBox('', 1, game.scene);
        
        drakkar.position.copyFrom(drakkarPosition.center);
        drakkar.position.y = 1;
        drakkar.scaling.x = 3;
        
        // Create fog of war
        this._fogOfWar = new FogOfWar(150, game.scene);
        this._fogOfWar.position.y = 1.8/2+0.1; // TODO FIX THIS SHIT
        
        // Add this extension to the player base
        this.addBuilding(starter);
        
        // The starter should not be waiting for minions
        starter.finishBuild();
    }

    /**
     * Returns the first hexagon of the base
     */
    public getStarterHex() : MapHexagon {
        return this._hexUnfolded[0];
    }
    
    /**
     * Add a building to the player base 
     * @param building the extension to add to the base
     */
    public addBuilding(building : Building) { 
        
        // Unfold all hexagons of the map and add them to the base
        let resourcesHex = this._getResourcesOnMap(building)
        
        // Get the working site hexagon - where minion will build it
        let workingSite = this._getWorksiteHex(resourcesHex);
        
        // Add the building place to the base
        for (let hex of resourcesHex) {               
            this._hexUnfolded.push(hex);  
            this._map.removeMapHex(hex);      
        }        
        this._buildings.push(building);  
                
        // Build it
        building.prepareToBuildOn(workingSite); 
        
        // Remove fog where needed
        this._fogOfWar.dissipateFog(this._hexUnfolded); 
        
        // Add working site in the walking graph
        this._addHexToWalkingGraph(building.workingSite) 
    }
    
    /**
     * Function called when a building is finished.
     * - Update walking graph
     */
    public buildingFinished(building : Building) { 
        
        // Update walking graph
        this._createWalkingGraph();        
    }
    
    /**
     * Returns the hexagon of the building the nearest of the base
     */
    private _getWorksiteHex(buildingPlaces : Array<MapHexagon>) : MapHexagon {
        let res = buildingPlaces[0];
        let min = Number.POSITIVE_INFINITY;
        
        // For each hexagons the building is set on...
        for (let b of buildingPlaces) {
            // ... check which one is the nearest of the base
            for (let h of this._hexUnfolded) {
                let dist = MapHexagon.distanceSquared(b, h);
                if (dist < min) {
                    min = dist;
                    res = b;
                }    
            }
        }
        return res;
    }

    /**
     * Setup this building on the map, and retrieve the list of hexagon present on the map.
     */
    private _getResourcesOnMap(build : Building) : Array<MapHexagon> {
        let resourcesHex : Array<MapHexagon> = [];

        // For each hexagon, get the corresponding resource 
        for (let point of build.points) {
            resourcesHex.push(this._map.getResourceHex(point));
        }

        return resourcesHex;
    }
    
    /**
     * Create the base map by adding a link between all neighbors
     */
    private _createWalkingGraph() : void {
        
        this.graph = new Graph();

        for (let hex1 of this._hexUnfolded) {
            this._addHexToWalkingGraph(hex1);
        }        
    }
    
    /**
     * Add a given hexagon to the walking graph
     */
    private _addHexToWalkingGraph(hex1: MapHexagon) : void {
        let neighbors = {}; 
        for (let hex2 of this._hexUnfolded) { 
            if (MapHexagon.areNeighbors(hex1, hex2)) {
                // Road from hex1 to hex2
                neighbors[hex2.name] = 1;
                // Road from hex2 to hex1
                if (!this.graph.vertices[hex2.name]) {
                    this.graph.vertices[hex2.name] = {};
                }                
                this.graph.vertices[hex2.name][hex1.name] = 1;
            } 
        }
        this.graph.addVertex(hex1.name, neighbors);
    }

    /**
     * Returns the hexagon corresponding to the given name
     */
    private _getHexByName(name:string) : MapHexagon {
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
     * Retursn true if the given building can be built here : 
     * that means no overlap with another shape, and it must be 
     * connected with at least one shape.
     */
    public canBuildHere (building:Building) : boolean {
                
        for (let b of this._buildings) {
            if (building.overlaps(b)) {
                return false;
            } 
        }
        return true;
        // // Connected with at least one shape : there is at least one 
        // // hexagon of the new shape with distance < DISTANCE_BETWEEN_NEIGHBORS
        // let areConnected = false;
        // for (let sHex of shape.hexagons) {
        //     for (let bHex of this._hexUnfolded) {
        //         areConnected = areConnected || MapHexagon.areNeighbors(sHex, bHex)
        //     }
        // }
        
        // // Can build only on land
        // let onLand = this._map.canBuild(shape);
        
        // return areConnected && onLand;
    }

    /**
     * Returns the shortest path from the given hex to the given hex.
     */
    public getPathFromTo(from: MapHexagon, to:MapHexagon) : Array<MapHexagon>{
        let pathString : Array<string> = this.graph.shortestPath(from.name, to.name).reverse();
        if (pathString.length === 0) {
            console.warn('No road found to ', to.name);
        }
        let pathHex = [];
        for (let str of pathString) {
            pathHex.push(this._getHexByName(str));
        }
        return pathHex;
    }

    /**
     * Locate the nearest resource slot containing the given resource on the map 
     * (the resource is available) and return it. 
     * Returns null if no such hexagon is found.
     * @param hexagon The position from where the nearest resource will be returned
     */
    public getNearestResource(hexagon:MapHexagon, resource:Resources) : MapHexagon {
        let nearest = null;
        let distance = Number.POSITIVE_INFINITY;

        for (let hex of this._hexUnfolded) {
            if (hex.resourceSlot.resource === resource) {
                // Check availability of the resource
                if (hex.resourceSlot.isAvailable()) {
                    // Check distance
                    let currentDist = this.getPathFromTo(hexagon, hex).length;
                    if (currentDist < distance) {
                        nearest = hex;
                        distance = currentDist;
                    }
                }
            }
        }
        return nearest;
    }
    
    /**
     * Returns the nearest building waiting to be built.
     * It also checks if a road exists between the position and the building
     */
    public getNearestBuildingWaitingForMinion(hexagon:MapHexagon) : Building {
        let nearest = null;
        let distance = Number.POSITIVE_INFINITY;

        let check = (b:Building) => {
            // Check distance
            let currentDist = this.getPathFromTo(hexagon, b.workingSite).length;
            if (currentDist > 0 && currentDist < distance) {
                nearest = b;
                distance = currentDist;
            }
        }        
        
        // Check base extensions...
        // for (let ext of this._extensions) {
        //     if (ext.waitingToBeBuilt) {
        //         check(ext);
        //     }
        // }
        //.. and check buildings  
        for (let build of this._buildings) {
            if (build.waitingToBeBuilt) {
                check(build);
            }
        }
        return nearest;
    }
}