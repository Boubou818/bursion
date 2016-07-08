/**
 * Contains the player base :
 * - the field where minions can walk on,
 * - all building built by the player
 *
 */
var Base = (function () {
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    function Base(scene, map) {
        // The list of buildings of the base. Minions can walk on each one of these buildings
        this._buildings = [];
        // All resources hexagones unfolded in a single array. Updated each time a new building is built
        this._hexUnfolded = [];
        this._map = map;
        var starter = new Building(scene, Building.STARTER_TEMPLATE);
        this.addBuilding(starter);
    }
    /**
     * Returns the first hexagon of the base
     */
    Base.prototype.getStarterHex = function () {
        return this._hexUnfolded[0];
    };
    /**
     * Add a building to the player base. The graph is updated.
     */
    Base.prototype.addBuilding = function (building) {
        this._buildings.push(building);
        // Unfold all hexagons of the map
        for (var _i = 0, _a = building.getResourcesOnMap(this._map); _i < _a.length; _i++) {
            var hex = _a[_i];
            this._hexUnfolded.push(hex);
        }
        this._createMap();
    };
    /**
     * Create the base map :
     * - link between neighbors
     * - Locate resources
     */
    Base.prototype._createMap = function () {
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
        for (var _i = 0, _a = this._buildings; _i < _a.length; _i++) {
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
     * Locate the nearest resource slot containing wood on the map.
     * Returns the hexagon (containing a woodresource not empty)
     * which is the nearest of the given position. Returns null if no such hexagon is found.
     */
    Base.prototype.getNearestWoodHexagon = function (hexagon) {
        var nearest = null;
        var distance = Number.POSITIVE_INFINITY;
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex = _a[_i];
            if (hex.resourceSlot.resource instanceof Wood) {
                // Check availability of the resource
                if (hex.resourceSlot.isAvailable()) {
                    // Check distance
                    var currentDist = this.getPathFromTo(hexagon, hex).length;
                    console.log(currentDist);
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