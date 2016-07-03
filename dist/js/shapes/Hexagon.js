/// <reference path="../babylon.d.ts" />
/// <reference path="HexagonSet.ts" />
/**
 * An hexagon is represented by its coordinates (q,r). Two hexagons are the same if their coordinates are the same
 */
var Hexagon = (function () {
    function Hexagon(q, r, grid, shape) {
        // The list of hexagons names that are linked to this hexagon
        this.neighbors = [];
        this.q = q;
        this.r = r;
        var center = grid.getCenterXY(q, r);
        this.center = new BABYLON.Vector3(center.x, 0, center.y);
        this.name = Hexagon.uniqueID();
        this._shape = shape;
    }
    Hexagon.prototype.equals = function (other) {
        return this.q === other.q && this.r === other.r;
    };
    Hexagon.uniqueID = function () {
        function chr4() {
            return Math.random().toString(16).slice(-4);
        }
        return chr4() + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() + chr4() + chr4();
    };
    Hexagon.prototype.addNeighbor = function (hex) {
        this.neighbors.push(hex.name);
    };
    Hexagon.prototype.getWorldCenter = function () {
        return this.center.add(this._shape.position);
    };
    Hexagon.prototype.overlaps = function (other) {
        // Get world center
        var center = this.getWorldCenter();
        // Get world center
        var otherCenter = other.getWorldCenter();
        if (BABYLON.Vector3.DistanceSquared(center, otherCenter) < BABYLON.Epsilon) {
            return true;
        }
        return false;
    };
    return Hexagon;
}());
//# sourceMappingURL=Hexagon.js.map