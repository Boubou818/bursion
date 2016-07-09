/**
 * An hexagon is represented by its coordinates (q,r). Two hexagons are the same if their coordinates are the same
 */
var Hexagon = (function () {
    function Hexagon(q, r, grid, shape) {
        // The resource slot this hexagon contains
        this.resourceSlot = new ResourceSlot();
        this.q = q;
        this.r = r;
        var center = grid.getCenterXY(q, r);
        this.center = new BABYLON.Vector3(center.x, 0, center.y);
        this.name = Hexagon.uniqueID();
        this._shape = shape;
    }
    /**
     * Two hexs are equals if their coordinates are the same. This should be used with the same reference grid !
     */
    Hexagon.prototype.equals = function (other) {
        return this.q === other.q && this.r === other.r;
    };
    /**
     * Returns an unique ID
     */
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
    /**
     * Returns the default hexagon grid used in the game.
     */
    Hexagon.getDefaultGrid = function () {
        var grid = new Grid();
        grid.tileSize = 1;
        grid.tileSpacing = 0;
        grid.pointyTiles = true;
        return grid;
    };
    /**
     * Returns true if the two given hexagons are neighbors
     */
    Hexagon.areNeighbors = function (hex1, hex2) {
        return BABYLON.Vector3.Distance(hex1.getWorldCenter(), hex2.getWorldCenter()) < Hexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS;
    };
    /**
     * Returns the squared distance between the two hexagons.
     */
    Hexagon.distanceSquared = function (hex1, hex2) {
        return BABYLON.Vector3.DistanceSquared(hex1.getWorldCenter(), hex2.getWorldCenter());
    };
    /**
     * Returns the center of this hexagon in world coordinates (relative to the shape);
     */
    Hexagon.prototype.getWorldCenter = function () {
        if (this._shape) {
            return this.center.add(this._shape.position);
        }
        else {
            return this.center.clone();
        }
    };
    /**
     * Returns true if this hexagon overlaps the given one (if the two world center are separated by a very small distance)
     */
    Hexagon.prototype.overlaps = function (other) {
        return Hexagon.distanceSquared(this, other) < BABYLON.Epsilon;
    };
    /**
     * Returns the axial distance between two hexagon.
     * The two hexagon should belong to the same original grid!!
     */
    Hexagon.prototype.axialDistance = function (other) {
        var q1 = this.q, r1 = this.r;
        var q2 = other.q, r2 = other.r;
        return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(q1 + r1 - q2 - r2)) / 2;
    };
    // The distance between two neighbors
    Hexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    return Hexagon;
}());
//# sourceMappingURL=Hexagon.js.map