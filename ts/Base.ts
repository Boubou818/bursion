declare var Graph : any;
/**
 * Contains the player base : 
 * - the field where minions can walk on,
 * - all building built by the player
 * 
 */
class Base {
    
    // The list of buildings of the base. Minions can walk on each one of these buildings
    private _extensions : Array<BaseExtension> = [];

    // All resources hexagones unfolded in a single array. Updated each time a new building is built
    private _hexUnfolded : Array<Hexagon> = [];
    
    // The Djikstra graph
    public graph : any;
    
    // The game instance
    private _game : Game;

    // The map where the player base will be built on
    private _map : HexagonGrid;
    
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    constructor(game:Game, map : HexagonGrid) {
        this._map = map;
        this._game = game;
        let starter = new BaseExtension(game.scene, BaseExtension.STARTER_TEMPLATE);
        this.addExtension(starter);
    }
    
    /**
     * Returns the base material (earth texture)
     */
    public getBaseMaterial() : BABYLON.Material {
        let mat : BABYLON.Material = this._game.scene.getMaterialByName('_baseMaterial_');
        if (!mat) {
            let mymat = new BABYLON.StandardMaterial('_baseMaterial_', this._game.scene);
            mymat.diffuseTexture = new BABYLON.Texture('img/textures/earth.jpg', this._game.scene);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        return mat;
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
    public addExtension(building : BaseExtension) {  
        building.material = this.getBaseMaterial();
             
        this._extensions.push(building);
        
        // Unfold all hexagons of the map
        let resourcesHex = this._getResourcesOnMap(building)
        for (let hex of resourcesHex) {               
            this._hexUnfolded.push(hex);  
            this._map.removeMapHex(hex);         
        }
        
        // Update walking graph
        this._createWalkingGraph();
    }

    /**
     * Setup this building on the map, and retrieve the list of hexagon present on the map.
     */
    private _getResourcesOnMap(ext : BaseExtension) : Array<Hexagon> {
        let resourcesHex = [];

        // For each hexagon, get the corresponding resource 
        for (let hex of ext.hexagons) {
            resourcesHex.push(this._map.getResourceHex(hex));
        }

        return resourcesHex;
    }
    
    /**
     * Create the base map by adding a link between all neighbors
     */
    private _createWalkingGraph() {
        
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
    public canBuildHere (shape:BaseExtension) {
        for (let s of this._extensions) {
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
     * Locate the nearest resource slot containing the given resource on the map 
     * (the resource is available) and return it. 
     * Returns null if no such hexagon is found.
     */
    public getNearestResource(hexagon:Hexagon, resource:Resources) : Hexagon {
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



       
    
    
}