/// <reference path="../babylon.d.ts" />
/// <reference path="HexagonSet.ts" />

declare var Grid : any;

/**
 * An hexagon is represented by its coordinates (q,r). Two hexagons are the same if their coordinates are the same
 */
class Hexagon {
    public q:number;
    public r:number;
    public center: BABYLON.Vector3;
    // The unique name of this hex
    public name : string;
    // The list of hexagons names that are linked to this hexagon
    public neighbors : Array<string> = [];
    // The shape this hex belongs to
    private _shape : HexagonSet;
    
    constructor(q, r, grid, shape) {
        this.q = q;
        this.r = r;
        let center = grid.getCenterXY(q, r);
        this.center = new BABYLON.Vector3(center.x, 0, center.y);
        this.name = Hexagon.uniqueID();
        this._shape = shape;
    }
     
    public equals(other:Hexagon) {
        return this.q === other.q && this.r === other.r;
    }
    
    static uniqueID() : string { 
        function chr4(){
            return Math.random().toString(16).slice(-4);
        }
        return chr4() + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() +
            '-' + chr4() + chr4() + chr4();
    }
    
    public addNeighbor(hex:Hexagon) {
        this.neighbors.push(hex.name);
    }
    
    public getWorldCenter() {
        return this.center.add(this._shape.position);
    }
    
    public overlaps(other:Hexagon) {
        // Get world center
        let center = this.getWorldCenter();
        // Get world center
        let otherCenter = other.getWorldCenter();
        if (BABYLON.Vector3.DistanceSquared(center, otherCenter) < BABYLON.Epsilon) {
            return true;
        } 
        return false;
    }
}
