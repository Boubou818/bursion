/**
 * A Map Hexagon is an hexagon composed of a type (land, water, beach...)
 * and a resource slot.
*/
var MapHexagon = (function () {
    function MapHexagon(q, r, grid) {
        // The resource slot this hexagon contains
        this.resourceSlot = new ResourceSlot();
        this.q = q;
        this.r = r;
        var center = grid.getCenterXY(q, r);
        this._center = new BABYLON.Vector3(center.x, 0, center.y);
        this.name = MapHexagon.uniqueID();
    }
    Object.defineProperty(MapHexagon.prototype, "center", {
        get: function () {
            return this._center.clone();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the default hexagon grid used in the game.
     */
    MapHexagon.getDefaultGrid = function () {
        var grid = new Grid();
        grid.tileSize = 1;
        grid.tileSpacing = 0;
        grid.pointyTiles = true;
        return grid;
    };
    /**
     * Returns an unique ID
     */
    MapHexagon.uniqueID = function () {
        function chr4() {
            return Math.random().toString(16).slice(-4);
        }
        return chr4() + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() + chr4() + chr4();
    };
    MapHexagon.prototype.distanceToPoint = function (point) {
        return BABYLON.Vector3.DistanceSquared(this.center, point.center);
    };
    /**
     * Returns true if the two given hexagons are neighbors : their distance is lower than the distance bewteen two neighbors
     */
    MapHexagon.areNeighbors = function (hex1, hex2) {
        return BABYLON.Vector3.Distance(hex1.center, hex2.center) < MapHexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS;
    };
    /**
     * Returns the squared distance between the two hexagons.
     */
    MapHexagon.distanceSquared = function (hex1, hex2) {
        return BABYLON.Vector3.DistanceSquared(hex1.center, hex2.center);
    };
    /**
     * Overrides the default dispose to dispose the resource slot as well
     */
    MapHexagon.prototype.dispose = function () {
        if (this.model) {
            this.model.dispose();
        }
        this.resourceSlot.dispose();
    };
    // The distance between two neighbors
    MapHexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    return MapHexagon;
}());
//# sourceMappingURL=MapHexagon.js.map