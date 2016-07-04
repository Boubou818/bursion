/// <reference path="shapes/HexagonSet.ts" />
/**
 * Contains the player base : the field where minions can walk on.
 */
var Base = (function () {
    function Base() {
        // The list of buildings of the base. Minions can walk on each one of these buildings
        this._buildings = [];
        this._hexUnfolded = [];
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
                if (dist < 1.75) {
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
    return Base;
}());
//# sourceMappingURL=Base.js.map