/**
 * Creates a new shapes composed of several hexagons.
 * next shape to use - shape - shape - last shape to use
 */
class ShapeCreator {

    private _scene : BABYLON.Scene;

    // The list of available shapes. A new shape is pushed at the end of the array.
    public _shapes : Array<Array<BuildingPoint>> = [];

    constructor(game : Game) {
        this._scene = game.scene;
    }

    /**
     * Returns the next shape to use, and create a new one added at the end of the array
     */
    public getCurrentShape() : Array<BuildingPoint> {
        // Push new shape

        // returns the head othe array
        return this._shapes.shift();
    }

    private _addShape (points : Array<BuildingPoint>) {
        // push in last place
        this._shapes.push(points);
    }

}