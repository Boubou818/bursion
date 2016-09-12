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
    Resources.Empty = 0;
    Resources.Wood = 1;
    Resources.Rock = 2;
    Resources.Meat = 3;
    /**
     * Returns the probabilty of a resource to be in an hexagon
     */
    function getProbability(res) {
        switch (res) {
            case Resources.Wood:
                return 0.35;
            case Resources.Rock:
                return 0.15;
            case Resources.Meat:
                return 0.05;
            default:
                return 0;
        }
    }
    Resources.getProbability = getProbability;
    /**
     * Returns the 3D model corresponding to the given resource
     */
    function getModelForResource(game, res) {
        switch (res) {
            case Resources.Wood:
                return game.assets['wood'].clone();
            case Resources.Rock:
                var box = BABYLON.Mesh.CreateBox('rock', 0.5, game.scene);
                return box;
            case Resources.Meat:
                return game.assets['leg'].clone();
            default:
                return game.assets['wood'];
        }
    }
    Resources.getModelForResource = getModelForResource;
})(Resources || (Resources = {}));
//# sourceMappingURL=Resource.js.map