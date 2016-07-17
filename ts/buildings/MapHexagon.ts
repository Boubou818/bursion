/** 
 * A Map Hexagon is an hexagon composed of a type (land, water, beach...) 
 * and a resource slot.
*/
class MapHexagon {
    
    // The unique name of this hex
    public name : string; 
    
    public q:number;
    public r:number;
    
    private _center: BABYLON.Vector3;
    
    // The resource slot this hexagon contains
    public resourceSlot : ResourceSlot = new ResourceSlot();
    
    // The type of this hexagon: land, water, deepwater
    public type : HexagonType;
    
    // The distance between two neighbors
    private static DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    
    constructor(q, r, grid) {
        this.q = q;
        this.r = r;
        let center = grid.getCenterXY(q, r);
        this._center = new BABYLON.Vector3(center.x, 0, center.y);
        this.name = MapHexagon.uniqueID();
    }
    
    get center() : BABYLON.Vector3 {
        return this._center.clone();
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
    
    public distanceToPoint(point:BuildingPoint) {
        return BABYLON.Vector3.DistanceSquared(this.center, point.center);
    }
    
    /**
     * Returns true if the two given hexagons are neighbors : their distance is lower than the distance bewteen two neighbors
     */
    static areNeighbors(hex1: MapHexagon, hex2:MapHexagon) {
        return BABYLON.Vector3.Distance(hex1.center, hex2.center) < MapHexagon.DISTANCE_BETWEEN_TWO_NEIGHBORS; 
    }

    
    /**
     * Returns the squared distance between the two hexagons.
     */
    static distanceSquared(hex1: MapHexagon, hex2:MapHexagon) {
        return BABYLON.Vector3.DistanceSquared(hex1.center, hex2.center);
    }
    
}