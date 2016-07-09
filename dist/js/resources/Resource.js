/**
 * A resource is located on the original map.
 * There is 3 kind of resources:
 * - wood, coming from trees
 * - rocks, coming from... bigger rocks
 * - meat, coming from boars
 * Each onne of these resources will be subclasses of this one
 */
var Resources;
(function (Resources) {
    Resources[Resources["Empty"] = 0] = "Empty";
    Resources[Resources["Wood"] = 1] = "Wood";
    Resources[Resources["Rock"] = 2] = "Rock";
    Resources[Resources["Meat"] = 3] = "Meat";
})(Resources || (Resources = {}));
var Resources;
(function (Resources) {
    /**
     * Returns the probabilty of a resource to be in an hexagon
     */
    function getProbability(res) {
        switch (res) {
            case Resources.Wood:
            case Resources.Rock:
                return 0.15;
            default:
                return 0;
        }
    }
    Resources.getProbability = getProbability;
})(Resources || (Resources = {}));
//# sourceMappingURL=Resource.js.map