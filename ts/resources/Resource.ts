/**
 * A resource is located on the original map. 
 * There is 3 kind of resources:
 * - wood, coming from trees
 * - rocks, coming from... bigger rocks
 * - meat, coming from boars
 * Each onne of these resources will be subclasses of this one 
 */

/** A resource map links the kind of resource to a specific item (amount, objects...) */
interface ResourceMap<T> {
    [type:number] : T;
}

// Alias type for resources
type Resources = number;

namespace Resources {
    
    export const Empty : number = 0;
    export const Wood : number = 1;
    export const Rock : number = 2;
    export const Meat : number = 3;
    
    /**
     * Returns the probabilty of a resource to be in an hexagon
     */
    export function getProbability(res : number) {
        switch (res) {
            case Resources.Wood:
            case Resources.Rock:
                return 0.15;        
            default:
                return 0;
        }
    }
    
    /**
     * Returns the 3D model corresponding to the given resource
     */
    export function getModelForResource(game:Game, res : Resources) {
        switch (res) {
            case Resources.Wood:
                return game.assets['wood'];
            case Resources.Rock:
            default:
                return 0;
        }
    }
}