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
    
    // The shape this hex belongs to
    private _shape : HexagonSet;

    // The distance between two neighbors
    public static DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    
    constructor(q, r, grid, shape?: HexagonSet) {
        this.q = q;
        this.r = r;
        let center = grid.getCenterXY(q, r);
        this.center = new BABYLON.Vector3(center.x, 0, center.y);
        this.name = Hexagon.uniqueID();
        this._shape = shape;
    }
     
    /**
     * Two hexs are equals if their coordinates are the same. This should be used with the same reference grid !
     */
    public equals(other:Hexagon) : boolean{
        return this.q === other.q && this.r === other.r;
    }
    
    /**
     * Returns an unique ID
     */
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
    
    /**
     * Returns the default hexagon grid used in the game.
     */
    static getDefaultGrid() : any {
        
        let grid         = new Grid();
        grid.tileSize    = 1;
        grid.tileSpacing = 0;
        grid.pointyTiles = true;
        
        return grid;
    }
    
    /**
     * Returns the center of this hexagon in world coordinates (relative to the shape);
     */
    public getWorldCenter() {
        if (this._shape) {
            return this.center.add(this._shape.position);
        } else {
            return this.center;
        }
    }
    
    /**
     * Returns true if this hexagon overlaps the given one (if the two world center are separated by a very small distance)
     */
    public overlaps(other:Hexagon) :boolean {
        // Get world center
        let center = this.getWorldCenter();
        // Get world center
        let otherCenter = other.getWorldCenter();
        if (BABYLON.Vector3.DistanceSquared(center, otherCenter) < BABYLON.Epsilon) {
            return true;
        } 
        return false;
    }          

    /** 
     * Returns the axial distance between two hexagon. 
     * The two hexagon should belong to the same original grid!!
     */
    public axialDistance (other:Hexagon) {
        let q1 = this.q, r1 = this.r;
        let q2 = other.q, r2 = other.r;
        return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(q1 + r1 - q2 - r2)) / 2;
    }
}
