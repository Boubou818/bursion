/// <reference path="Hexagon.ts" />
/// <reference path="../babylon.d.ts" />
/**
 * The hexagonal grid, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 */
var HexagonGrid = (function () {
    function HexagonGrid(size) {
        var _this = this;
        // The Hexagon grid
        this._grid = [];
        var grid = Hexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, size, true);
        coordinates.forEach(function (c) {
            _this._grid.push(new Hexagon(c.q, c.r, grid));
        });
    }
    /**
     * Returns the hexagon the nearest of the given position
     */
    HexagonGrid.prototype.getNearestHex = function (p) {
        var min = 99999, res = null;
        this._grid.forEach(function (hex) {
            var dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
            if (dist < min) {
                min = dist;
                res = hex;
            }
        });
        return res;
    };
    HexagonGrid.prototype.draw = function (scene) {
        var ref = BABYLON.Mesh.CreateCylinder('', 1, 1.8, 1.8, 6, 1, scene);
        ref.isVisible = false;
        this._grid.forEach(function (h) {
            var hex = ref.clone('' + h.q + ' ' + h.r);
            hex.isVisible = true;
            hex.rotation.y = Math.PI / 2;
            hex.position.copyFrom(h.center);
        });
    };
    return HexagonGrid;
}());
//# sourceMappingURL=HexagonGrid.js.map