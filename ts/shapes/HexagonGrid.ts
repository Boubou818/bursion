/// <reference path="Hexagon.ts" />
/// <reference path="../babylon.d.ts" />

declare var Grid : any;

/**
 * The hexagonal grid, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 */
class HexagonGrid {
    
    // The Hexagon grid
    private  _grid : Array<Hexagon> = [];    
    
    constructor(size:number) {
        var grid         = Hexagon.getDefaultGrid();
        
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
    
    /**
     * Draw the hexagon grid in the given scene
     */
    public draw(scene) {
        
        let ref = BABYLON.Mesh.CreateCylinder('', 0.1, 1.9, 1.9, 6, 1, scene);
        ref.rotation.y = Math.PI/2;
        ref.isVisible = false;
        
        this._grid.forEach((h) => {
           
            let hex : any = ref.createInstance(''+h.q+' '+h.r);
            hex.isVisible = true;
            
            hex.position.copyFrom(h.center);          
        });
    }
}