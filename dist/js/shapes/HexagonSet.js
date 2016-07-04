/// <reference path="../babylon.d.ts"/>
/// <reference path="Hexagon.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A shape is a set of 3/4/5 hexagons.
 * Hexagon coordinates are relative to the shape.
 * The center of the shape is the first hexagon at (0,0).
 */
var HexagonSet = (function (_super) {
    __extends(HexagonSet, _super);
    function HexagonSet(scene) {
        _super.call(this, '_shape_', scene);
        // The set of hexagons
        this.hexagons = [];
        this._initShape();
    }
    /**
     * Create the shape, which has a random size between 3 and 5 hexs.
     */
    HexagonSet.prototype._initShape = function () {
        var _this = this;
        var grid = Hexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, 3, true);
        var size = Math.floor(((Math.random() * (6 - 3)) + 3)); // random [3;6[
        // Shuffle an array
        var shuffle = function (a) {
            var j, x, i;
            for (i = a.length; i; i -= 1) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        };
        // returns a random neighbor of the given hex
        var getNext = function (q, r) {
            var neighbors = grid.neighbors(q, r);
            shuffle(neighbors);
            for (var i = 0; i < neighbors.length; i++) {
                var hex = new Hexagon(neighbors[i].q, neighbors[i].r, grid, _this);
                if (!_this._isInShape(hex)) {
                    return hex;
                }
            }
            return null;
        };
        // Start with the center of the grid and iterate over neighbors
        var currentHex = coordinates[0];
        var first = new Hexagon(currentHex.q, currentHex.r, grid, this);
        this.hexagons.push(first);
        for (var i = 0; i < size; i++) {
            var next = getNext(currentHex.q, currentHex.r);
            if (!next)
                break;
            this.hexagons.push(next);
            currentHex.q = next.q, currentHex.r = next.r;
        }
        // Merge all cylinders
        var hexes = [];
        this.hexagons.forEach(function (hex) {
            var center = grid.getCenterXY(hex.q, hex.r);
            var myhex = BABYLON.Mesh.CreateCylinder('', 1, 2, 2, 6, 1, _this.getScene());
            myhex.rotation.y = Math.PI / 2;
            myhex.position.x = center.x;
            myhex.position.z = center.y;
            hexes.push(myhex);
        });
        this._child = BABYLON.Mesh.MergeMeshes(hexes, true);
        this._child.parent = this;
    };
    /**
     * Returns -1 if the given hex is not in the shape
     */
    HexagonSet.prototype._isInShape = function (hex) {
        for (var i = 0; i < this.hexagons.length; i++) {
            if (this.hexagons[i].equals(hex)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Returns true if two shapes are overlapping.
     * There is an overlap if at least one hexagon is overlapping wioth another one
     */
    HexagonSet.prototype.overlaps = function (other) {
        for (var _i = 0, _a = this.hexagons; _i < _a.length; _i++) {
            var hex = _a[_i];
            for (var _b = 0, _c = other.hexagons; _b < _c.length; _b++) {
                var otherHex = _c[_b];
                if (hex.overlaps(otherHex)) {
                    return true;
                }
            }
        }
        return false;
    };
    Object.defineProperty(HexagonSet.prototype, "material", {
        set: function (value) {
            this._child.material = value;
        },
        enumerable: true,
        configurable: true
    });
    return HexagonSet;
}(BABYLON.Mesh));
//# sourceMappingURL=HexagonSet.js.map