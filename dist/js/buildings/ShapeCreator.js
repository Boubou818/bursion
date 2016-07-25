/**
 * Creates a new shapes composed of several hexagons.
 * next shape to use - shape - shape - last shape to use
 */
var ShapeCreator = (function () {
    function ShapeCreator(game) {
        // The list of available shapes. A new shape is pushed at the end of the array.
        this._shapes = [];
        this._scene = game.scene;
    }
    /**
     * Returns the next shape to use, and create a new one added at the end of the array
     */
    ShapeCreator.prototype.getCurrentShape = function () {
        // Push new shape
        // returns the head othe array
        return this._shapes.shift();
    };
    ShapeCreator.prototype._addShape = function (points) {
        // push in last place
        this._shapes.push(points);
    };
    return ShapeCreator;
}());
//# sourceMappingURL=ShapeCreator.js.map