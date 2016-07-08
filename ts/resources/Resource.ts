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

    // The number of material this resource can generate.
    public amount : number = 100;

    // The probability a Wood resource has to appear in a hexagon
    public static WOOD_PROBABILITY : number = 0.15;
    
    // The probability a Rock resource has to appear in a hexagon
    public static ROCK_PROBABILITY : number = 0.15;

    constructor() {
    }
}