/// <reference path="Hexagon.ts" />
/// <reference path="../babylon.d.ts" />

declare var Grid : any;

/**
 * The hexagonal grid, whre the player will be able to build.
 */
class HexagonGrid {
    
    // The Hexagon grid
    private  _grid : Array<Hexagon> = [];    

    private _mapGrid : any;    
    
    constructor(size:number) {
        var grid         = new Grid();
        grid.tileSize    = 1;
        grid.tileSpacing = 0;
        grid.pointyTiles = true;

        this._mapGrid = grid;
        
        let coordinates = grid.hexagon(0,0,size, true);  
        coordinates.forEach((c) => {
            this._grid.push(new Hexagon(c.q, c.r, grid));
        });        
    }
    
    /**
     * Returns the hexagon the nearest of the given position
     */
    public getNearestHex (p:BABYLON.Vector3) : Hexagon {
        let min = 99999,
        res = null;
        this._grid.forEach((hex:Hexagon) => {
            let dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
            if (dist < min) {
                min = dist;
                res = hex;
            }
        });
        return res;
    }
    
    public draw(scene) {
        
        let ref = BABYLON.Mesh.CreateCylinder('', 1, 1.8, 1.8, 6, 1, scene);
        ref.isVisible = false;
        
        this._grid.forEach((h) => {
           
            let hex : any = ref.clone(''+h.q+' '+h.r);
            hex.isVisible = true;
            
            hex.rotation.y = Math.PI/2;
            hex.position.copyFrom(h.center);          
        });
    }
}