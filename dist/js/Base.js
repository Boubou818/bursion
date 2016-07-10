/**
 * Contains the player base :
 * - the field where minions can walk on,
 * - all building built by the player
 *
 */
var Base = (function () {
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    function Base(game, map) {
        // The list of buildings of the base. Minions can walk on each one of these buildings
        this._extensions = [];
        // All resources hexagones unfolded in a single array. Updated each time a new building is built
        this._hexUnfolded = [];
        this._map = map;
        this._game = game;
        var starter = new BaseExtension(game.scene, BaseExtension.STARTER_TEMPLATE);
        this.addExtension(starter);
    }
    /**
     * Returns the base material (earth texture)
     */
    Base.prototype.getBaseMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_baseMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_baseMaterial_', this._game.scene);
            mymat.diffuseTexture = new BABYLON.Texture('img/textures/earth.jpg', this._game.scene);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        return mat;
    };
    /**
     * Returns the first hexagon of the base
     */
    Base.prototype.getStarterHex = function () {
        return this._hexUnfolded[0];
    };
    /**
     * Add a building to the player base. The graph is updated.
     */
    Base.prototype.addExtension = function (building) {
        building.material = this.getBaseMaterial();
        this._extensions.push(building);
        // Unfold all hexagons of the map
        var resourcesHex = this._getResourcesOnMap(building);
        for (var _i = 0, resourcesHex_1 = resourcesHex; _i < resourcesHex_1.length; _i++) {
            var hex = resourcesHex_1[_i];
            this._hexUnfolded.push(hex);
            this._map.removeMapHex(hex);
        }
        // Update walking graph
        this._createWalkingGraph();
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
            var neighbors = {};
            for (var _b = 0, _c = this._hexUnfolded; _b < _c.length; _b++) {
                var hex2 = _c[_b];
                if (Hexagon.areNeighbors(hex1, hex2)) {
                    neighbors[hex2.name] = 1;
                }
            }
            this.graph.addVertex(hex1.name, neighbors);
        }
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
        //  TODO Connected with at least one shape : there is at least one 
        // hexagon of the new shape with distance < DISTANCE_BETWEEN_NEIGHBORS
        var areConnected = false;
        for (var _b = 0, _c = shape.hexagons; _b < _c.length; _b++) {
            var sHex = _c[_b];
            for (var _d = 0, _e = this._hexUnfolded; _d < _e.length; _d++) {
                var bHex = _e[_d];
                areConnected = areConnected || Hexagon.areNeighbors(sHex, bHex);
            }
        }
        return areConnected;
    };
    /**
     * Returns the shortest path from the given hex to the given hex.
     */
    Base.prototype.getPathFromTo = function (from, to) {
        var pathString = this.graph.shortestPath(from.name, to.name).reverse();
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
    return Base;
}());
//# sourceMappingURL=Base.js.map