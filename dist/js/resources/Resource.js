/**
 * A resource is located on the original map.
 * There is 3 kind of resources:
 * - wood, coming from trees
 * - rocks, coming from... bigger rocks
 * - meat, coming from boars
 * Each onne of these resources will be subclasses of this one
 */
var Resource = (function () {
    function Resource() {
        // The amount of material this resource will generate every 10 seconds
        this.gain = 0;
        // The number of material this resource can generate.
        this.amount = 100;
    }
    // The probability a Wood resource has to appear in a hexagon
    Resource.WOOD_PROBABILITY = 0.15;
    // The probability a Rock resource has to appear in a hexagon
    Resource.ROCK_PROBABILITY = 0.15;
    return Resource;
}());
//# sourceMappingURL=Resource.js.map