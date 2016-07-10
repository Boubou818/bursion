/**
 * A resource is located on the original map. 
 * There is 3 kind of resources:
 * - wood, coming from trees
 * - rocks, coming from... bigger rocks
 * - meat, coming from boars
 * Each onne of these resources will be subclasses of this one 
 */

enum Resources {
    Empty,
    Wood, 
    Rock,
    Meat
}

/** A resource map links the kind of resource to a specific item (amount, objects...) */
interface ResourceMap<T> {
    [type:number] : T;
}

namespace Resources {
    /**
     * Returns the probabilty of a resource to be in an hexagon
     */
    export function getProbability(res : Resources) {
        switch (res) {
            case Resources.Wood:
            case Resources.Rock:
                return 0.15;        
            default:
                return 0;
        }
    }
}