/// <reference path="shapes/HexagonSet.ts" />
/**
 * Contains the player base :
 * - the field where minions can walk on,
 * - all building built by the player
 *
 */
var Base = (function () {
    // The base is always composed of a starting platform, composed of a set of 4*4 hex
    function Base(scene) {
        // The list of buildings of the base. Minions can walk on each one of these buildings
        this._buildings = [];
        // All hexagones of all building unfolded in a single array. Updated each time a new building is built
        this._hexUnfolded = [];
        var starter = new HexagonSet(scene, HexagonSet.STARTER_TEMPLATE);
        this.addBuilding(starter);
    }
    /**
     * Add a building to the player base. The graph is updated.
     */
    Base.prototype.addBuilding = function (building) {
        this._buildings.push(building);
        // Unfold all hexagons of the map
        for (var _i = 0, _a = building.hexagons; _i < _a.length; _i++) {
            var hex = _a[_i];
            this._hexUnfolded.push(hex);
        }
        this._createMap();
    };
    Base.prototype._createMap = function () {
        this.graph = new Graph();
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex1 = _a[_i];
            var neighbors = {};
            for (var _b = 0, _c = this._hexUnfolded; _b < _c.length; _b++) {
                var hex2 = _c[_b];
                var dist = BABYLON.Vector3.Distance(hex1.getWorldCenter(), hex2.getWorldCenter());
                if (dist < Hexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS) {
                    neighbors[hex2.name] = 1;
                }
            }
            this.graph.addVertex(hex1.name, neighbors);
        }
    };
    /**
     * Returns the hexagon corresponding to the given name
     */
    Base.prototype.getHexByName = function (name) {
        for (var _i = 0, _a = this._hexUnfolded; _i < _a.length; _i++) {
            var hex1 = _a[_i];
            if (hex1.name === name) {
                return hex1;
            }
        }
        console.warn('No hexagon with name ', name);
        return null;
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
        // Connected with at least one shape : there is at least one 
        // hexagon of the new shape with distance < DISTANCE_BETWEEN_NEIGHBORS
        return true;
    };
    return Base;
}());
//# sourceMappingURL=Base.js.map