declare var Grid : any;

/**
 * An hexagon is represented by its coordinates (q,r). Two hexagons are the same if their coordinates are the same
 */
class Hexagon {
    public q:number;
    public r:number;
    private center: BABYLON.Vector3;
    // The unique name of this hex
    public name : string; 
    
    // The shape this hex belongs to
    private _shape : BaseExtension;
    
    // The distance between two neighbors
    private static DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    
    constructor(q, r, grid, shape?: BaseExtension) {
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
     * Returns true if the two given hexagons are neighbors
     */
    static areNeighbors(hex1: Hexagon, hex2:Hexagon) {
        return BABYLON.Vector3.Distance(hex1.getWorldCenter(), hex2.getWorldCenter()) < Hexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS; 
    }

    /**
     * Returns the squared distance between the two hexagons.
     */
    static distanceSquared(hex1: Hexagon, hex2:Hexagon) {
        return BABYLON.Vector3.DistanceSquared(hex1.getWorldCenter(), hex2.getWorldCenter());
    }
    
    /**
     * Returns the center of this hexagon in world coordinates (relative to the shape);
     */
    public getWorldCenter() {
        if (this._shape) {
            return this.center.add(this._shape.position);
        } else {
            return this.center.clone();
        }
    }
    
    /**
     * Returns true if this hexagon overlaps the given one (if the two world center are separated by a very small distance)
     */
    public overlaps(other:Hexagon) :boolean {
        return Hexagon.distanceSquared(this, other) < BABYLON.Epsilon;
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
