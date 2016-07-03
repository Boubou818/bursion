/// <reference path="shapes/HexagonSet.ts" />
/**
 * Contains the player base : the field where minions can walk on.
 */
var Base = (function () {
    function Base() {
        // The list of buildings of the base. Minions can walk on each one of these buildings
        this._buildings = [];
    }
    /**
     * Add a building to the player base. The graph is updated.
     */
    Base.prototype.addBuilding = function (building) {
        this._buildings.push(building);
        this._createMap();
    };
    Base.prototype._createMap = function () {
        this._graph = new Graph();
        var allHexs = [];
        for (var _i = 0, _a = this._buildings; _i < _a.length; _i++) {
            var b = _a[_i];
            for (var _b = 0, _c = b.hexagons; _b < _c.length; _b++) {
                var hex = _c[_b];
                allHexs.push(hex);
            }
        }
        for (var _d = 0, allHexs_1 = allHexs; _d < allHexs_1.length; _d++) {
            var hex1 = allHexs_1[_d];
            for (var _e = 0, allHexs_2 = allHexs; _e < allHexs_2.length; _e++) {
                var hex2 = allHexs_2[_e];
                console.log(BABYLON.Vector3.DistanceSquared(hex1.getWorldCenter(), hex2.getWorldCenter()));
            }
        }
    };
    return Base;
}());
//# sourceMappingURL=Base.js.map