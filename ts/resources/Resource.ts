/// <reference path="../buildings/Hexagon.ts" />

/**
 * A resource is located on the original map. 
 * There is 3 kind of resources:
 * - wood, coming from trees
 * - rocks, coming from... bigger rocks
 * - meat, coming from boars
 * Each onne of these resources will be subclasses of this one 
 */
abstract class Resource {

    // The amount of material this resource will generate every 10 seconds
    public gain : number = 0;   

    // The probability this resource has to appear in a hexagon
    public probability : number = 0;

    constructor() {
    }
}