/// <reference path="../babylon.d.ts"/>
/// <reference path="Hexagon.ts"/>

/**
 * A shape is a set of 3/4/5 hexagons.
 * Hexagon coordinates are relative to the shape.
 * The center of the shape is the first hexagon at (0,0).
 */
class HexagonSet extends BABYLON.Mesh {
    
    // The set of hexagons
    public hexagons : Array<Hexagon> = [];
    
    // The shape mesh    
    private _child : BABYLON.AbstractMesh;
    
    // The map of this shape
    private _map : Array<any> = [];
    
    constructor(scene: BABYLON.Scene) {
        super('_shape_', scene);       
        
        this._initShape();
    }
    
    /**
     * Create the shape
     */
    private _initShape () {
        
        let grid         = new Grid();
        grid.tileSize    = 1;
        grid.tileSpacing = 0;
        grid.pointyTiles = true;
        
        let coordinates = grid.hexagon(0,0,3, true);  
        let size = this._randomInt(3,6);
        
        // Shuffle an array
        let shuffle = (a) => {
            let j, x, i;
            for (i = a.length; i; i -= 1) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        }
        
        // returns a random neighbor of the given hex
        let getNext = (q, r) => {
            let neighbors = grid.neighbors(q, r);
            shuffle(neighbors);
            for (let i=0; i<neighbors.length; i++) {
                let hex = new Hexagon(neighbors[i].q, neighbors[i].r, grid, this);
                if (!this._isInShape(hex)) { 
                    return hex;
                }
            }                    
            return null;        
        }
        
        // Start with the center of the grid and iterate over neighbors
        let currentHex = coordinates[0];
        let first = new Hexagon(currentHex.q, currentHex.r, grid, this);
        this.hexagons.push(first);
        
        for (let i=0; i<size; i++) {
            let next = getNext(currentHex.q, currentHex.r);
            if (!next) break;                        
            this.hexagons.push(next);
            currentHex.q = next.q, currentHex.r = next.r;
        }  
        
        // Merge all cylinders
        let hexes = [];        
        this.hexagons.forEach((hex) => {
            let center = grid.getCenterXY(hex.q, hex.r);
            let myhex = BABYLON.Mesh.CreateCylinder('', 1, 2, 2, 6, 1, this.getScene());
            myhex.rotation.y = Math.PI/2;
            myhex.position.x = center.x; 
            myhex.position.z = center.y; 
            hexes.push(myhex);
        })
        this._child = BABYLON.Mesh.MergeMeshes(hexes, true);
        this._child.parent = this;    
        
        // Returns neighbors of the given hexagon
        let getNeighborsInShape = (hex:Hexagon) => {
            let neighbors = [];
            for (let h of this.hexagons) {
                if (grid.axialDistance(hex.q, hex.r, h.q, h.r) == 1) {
                    neighbors.push(h);
                }
            }
            return neighbors;
        } 
                     
        // Build shape map  
        for (let h of this.hexagons) {
            let neighbors = getNeighborsInShape(h);
            for (let n of neighbors) {
                h.addNeighbor(n);
            }
        }      
    }    
    
    /**
     * Returns -1 if the given hex is not in the shape
     */
    private _isInShape(hex:Hexagon) {
        for (let i=0; i<this.hexagons.length; i++) {
            if (this.hexagons[i].equals(hex)){
                return true;
            }
        }
        return false;
    }
    
    
    private _randomInt (min, max) {
        if (min === max) {
            return (min);
        }
        var random = Math.random();
        return Math.floor(((random * (max - min)) + min));
    }    
    
    /**
     * Returns true if two shapes are overlapping. 
     * There is an overlap if at least one hexagon is overlapping wioth another one
     */
    public overlaps (other:HexagonSet) : boolean {
        for (let hex of this.hexagons) {
            for (let otherHex of other.hexagons) { 
                if (hex.overlaps(otherHex)) {
                    return true;
                }
            }   
        } 
        return false;             
    } 
    
    set material(value:BABYLON.Material) {
        this._child.material = value;
    }
}