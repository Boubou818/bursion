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

    // The subset of hexagons that can generate resources
    private _resourceSlots : Array<Hexagon> = [];

    // Q and R coordinates of a starter platform
    public static STARTER_TEMPLATE : Array<number> = [
        0, 0,
        1, 0, 
        2, 0, 
        3, 0, 
        0, 1, 
        1, 1,
        2, 1, 
        3, 1];
        
    constructor(scene: BABYLON.Scene, template?:Array<number>) {
        super('_shape_', scene);
        this._initShape(template);
    }

    /**
     * Create the shape, which has a random size between 3 and 5 hexs.
     */
    private _initShape (template?:Array<number>) {
        
        let grid = Hexagon.getDefaultGrid();
        let coordinates = grid.hexagon(0,0,3, true);
 
        let size = Math.floor(((Math.random() * (6 - 3)) + 3)); // random [3;6[
        
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
        // If a template is given in parameter, use template
        if (template) {
            for (let i=0; i<template.length-1; i+=2) {
                this.hexagons.push(new Hexagon(template[i], template[i+1], grid, this));
            }
        } else {
            // Else start a random shape
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

            // Choose resources slots
            for (let i=0; i<size; i++) {
                if (Math.random() < 0.5){
                    // 
                }
            } 
        }

        // Create 3D model        
        this._child = this._createModel();
        this._child.parent = this;    
        
    }    

    /** 
     * Returns a 3D model corresponding to this shape
        */
    private _createModel() : BABYLON.Mesh {
        // Merge all cylinders
        let hexes = [];        
        this.hexagons.forEach((hex) => {
            let center = hex.center;
            let myhex = BABYLON.Mesh.CreateCylinder('', 1, 2, 2, 6, 1, this.getScene());
            myhex.rotation.y = Math.PI/2;
            myhex.position.copyFrom(center);
            hexes.push(myhex);
        });
        return BABYLON.Mesh.MergeMeshes(hexes, true);
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