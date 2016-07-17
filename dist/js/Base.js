/**
 * Contains the player base :
 * - the field where minions can walk on,
 * - all building built by the player
 *
 * At the beginning of the game, the base is composed of a starting extension, and a drakkar.
 */
var Base = (function () {
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    function Base(game, map) {
        // The list of extensions of the base. Minions can walk on each one of these buildings
        this._extensions = [];
        // The list of building (all status : waiting, finished...) in the base
        this._buildings = [];
        // All resources hexagones coming from baseextensions unfolded in a single array. Updated each time a new building is built
        this._hexUnfolded = [];
        // The Djikstra graph
        this.graph = new Graph();
        this._map = map;
        this._game = game;
        var starter = new StarterExtension(game);
        starter.preBuild();
        // Set the base on the starting position of the map
        var starterPosition = this._map.basePosition;
        starter.position.copyFrom(starterPosition.getWorldCenter());
        var drakkarPosition = this._map.drakkarPosition;
        var drakkar = BABYLON.Mesh.CreateBox('', 1, game.scene);
        drakkar.position.copyFrom(drakkarPosition.getWorldCenter());
        drakkar.position.y = 1;
        drakkar.scaling.x = 3;
        // Create fog of war
        this._fogOfWar = new FogOfWar(150, game.scene);
        this._fogOfWar.position.y = 1.8 / 2 + 0.1; // TODO FIX THIS SHIT
        // Add this extension to the player base
        this.addExtension(starter);
        // The starter should not be waiting for minions
        starter.finishBuild(this);
    }
    /**
     * Returns the first hexagon of the base
     */
    Base.prototype.getStarterHex = function () {
        return this._hexUnfolded[0];
    };
    /**
     * Add a building to the player base. The graph is updated.
     * @param building the extension to add to the base
     * @param hex The hexagon position of the building.
     */
    Base.prototype.addExtension = function (extension) {
        // Unfold all hexagons of the map and add them to the base
        var resourcesHex = this._getResourcesOnMap(extension);
        // Get the working site hexagon - where minion will build it
        var workingSite = this._getWorksiteHex(resourcesHex);
        // Add the building place to the base
        for (var _i = 0, resourcesHex_1 = resourcesHex; _i < resourcesHex_1.length; _i++) {
            var hex = resourcesHex_1[_i];
            this._hexUnfolded.push(hex);
            this._map.removeMapHex(hex);
        }
        this._extensions.push(extension);
        // Build it
        extension.prepareToBuildOn(resourcesHex, workingSite);
        // Remove fog where needed
        this._fogOfWar.dissipateFog(this._hexUnfolded);
        // Add working site in the walking graph
        this._addHexToWalkingGraph(extension.workingSite);
    };
    /**
     * Function called when a building is finished.
     * - Update walking graph
     */
    Base.prototype.buildingFinished = function (building) {
        // Update walking graph
        this._createWalkingGraph();
    };
    /**
     * Returns the hexagon of the building the nearest of the base
     */
    Base.prototype._getWorksiteHex = function (buildingPlaces) {
        var res = buildingPlaces[0];
        var min = Number.POSITIVE_INFINITY;
        // For each hexagons the building is set on...
        for (var _i = 0, buildingPlaces_1 = buildingPlaces; _i < buildingPlaces_1.length; _i++) {
            var b = buildingPlaces_1[_i];
            // ... check which one is the nearest of the base
            for (var _a = 0, _b = this._hexUnfolded; _a < _b.length; _a++) {
                var h = _b[_a];
                var dist = Hexagon.distanceSquared(b, h);
                if (dist < min) {
                    min = dist;
                    res = b;
                }
            }
        }
        return res;
    };
    /**
     * Setup this building on the map, and retrieve the list of hexagon present on the map.
     */
    Base.prototype._getResourcesOnMap = function (ext) {
        var resourcesHex = [];
        // For each hexagon, get the corresponding resource 
        for (var _i = 0, _a = ext.hexagons; _i < _a.length; _i++) {
            var hex = _a[_i];
            resourcesHex.push(this._map.getResourceHex(hex));
        }
        return resourcesHex;
    };
    /**
     * Create the base map by adding a link between all neighbors
     */
    Base.prototype._createWalkingGraph = function () {
        this.graph = new Graph();
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex1 = _a[_i];
            this._addHexToWalkingGraph(hex1);
        }
    };
    /**
     * Add a given hexagon to the walking graph
     */
    Base.prototype._addHexToWalkingGraph = function (hex1) {
        var neighbors = {};
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex2 = _a[_i];
            if (Hexagon.areNeighbors(hex1, hex2)) {
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
    };
    /**
     * Returns the hexagon corresponding to the given name
     */
    Base.prototype._getHexByName = function (name) {
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex1 = _a[_i];
            if (hex1.name === name) {
                return hex1;
            }
        }
        console.warn('No hexagon with name ', name);
        return null;
    };
    Base.prototype.getHexByName = function (name) {
        return this._getHexByName(name);
    };
    /**
     * Retursn true if the given shape can be built here :
     * that means no overlap with another shape, and it must be
     * connected with at least one shape.
     */
    Base.prototype.canBuildHere = function (shape) {
        for (var _i = 0, _a = this._extensions; _i < _a.length; _i++) {
            var s = _a[_i];
            if (shape.overlaps(s)) {
                return false;
            }
        }
        // Connected with at least one shape : there is at least one 
        // hexagon of the new shape with distance < DISTANCE_BETWEEN_NEIGHBORS
        var areConnected = false;
        for (var _b = 0, _c = shape.hexagons; _b < _c.length; _b++) {
            var sHex = _c[_b];
            for (var _d = 0, _e = this._hexUnfolded; _d < _e.length; _d++) {
                var bHex = _e[_d];
                areConnected = areConnected || Hexagon.areNeighbors(sHex, bHex);
            }
        }
        // Can build only on land
        var onLand = this._map.canBuild(shape);
        return areConnected && onLand;
    };
    /**
     * Returns the shortest path from the given hex to the given hex.
     */
    Base.prototype.getPathFromTo = function (from, to) {
        var pathString = this.graph.shortestPath(from.name, to.name).reverse();
        if (pathString.length === 0) {
            console.warn('No road found to ', to.name);
        }
        var pathHex = [];
        for (var _i = 0, pathString_1 = pathString; _i < pathString_1.length; _i++) {
            var str = pathString_1[_i];
            pathHex.push(this._getHexByName(str));
        }
        return pathHex;
    };
    /**
     * Locate the nearest resource slot containing the given resource on the map
     * (the resource is available) and return it.
     * Returns null if no such hexagon is found.
     * @param hexagon The position from where the nearest resource will be returned
     */
    Base.prototype.getNearestResource = function (hexagon, resource) {
        var nearest = null;
        var distance = Number.POSITIVE_INFINITY;
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex = _a[_i];
            if (hex.resourceSlot.resource === resource) {
                // Check availability of the resource
                if (hex.resourceSlot.isAvailable()) {
                    // Check distance
                    var currentDist = this.getPathFromTo(hexagon, hex).length;
                    if (currentDist < distance) {
                        nearest = hex;
                        distance = currentDist;
                    }
                }
            }
        }
        return nearest;
    };
    /**
     * Returns the nearest building waiting to be built
     */
    Base.prototype.getNearestBuildingWaitingForMinion = function (hexagon) {
        var _this = this;
        var nearest = null;
        var distance = Number.POSITIVE_INFINITY;
        var check = function (b) {
            // Check distance
            var currentDist = _this.getPathFromTo(hexagon, b.workingSite).length;
            if (currentDist < distance) {
                nearest = b;
                distance = currentDist;
            }
        };
        // Check base extensions...
        for (var _i = 0, _a = this._extensions; _i < _a.length; _i++) {
            var ext = _a[_i];
            if (ext.waitingToBeBuilt) {
                check(ext);
            }
        }
        //.. and check buildings  
        for (var _b = 0, _c = this._buildings; _b < _c.length; _b++) {
            var build = _c[_b];
            if (build.waitingToBeBuilt) {
                check(build);
            }
        }
        return nearest;
    };
    return Base;
}());
//# sourceMappingURL=Base.js.map