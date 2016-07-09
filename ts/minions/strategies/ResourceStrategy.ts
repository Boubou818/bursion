/**
 * A minion will gather resource: 
 * 
 * - go to the nearest wood resource available in the base
 *   - If no resource is available, nothing is done
 * - generate resource if already at a resource point
 * - If the resource is empty, go to another resource point available 
 */
class ResourceStrategy extends WorkingStrategy {
        
    // The resource to gather
    private _resource : Resources;
    
    // The resource slot this minion is working on
    private _slot : ResourceSlot = null;
    
    // The timer used to generate resource each
    private _generatingTimer : Timer;
    
    /**
     * Give me the resource to gather
     */
    constructor(minion:Minion, res : Resources) { 
        super(minion);
        
        this._resource = res;
    }
    
    /**
     * A resource strategy is composed of 3 states : 
     * - the minion is idle, looking for next resource to gather
     * - searching for the nearest resource point and going there. This state is over when
     * the minion is at the resource point
     * -  Generating resources. This state is over when 
     * the resource slot is empty
     */
    protected _buildStates() {
        this._states = {
            IDLE:0,
            TRAVELING:1,
            GENERATING:2
        }
        this._currentState = this._states.IDLE;
    }
    
    
    public applyStrategy() {
        switch (this._currentState) {
            
            case this._states.IDLE:
                // Look for the nearest resource point
                this._findAndGoToNearestResource();
                // Exit this state
                this._currentState = this._states.TRAVELING;
                break;  
            case this._states.TRAVELING:
                // Nothing to do, let the minion go the to resource point.
                // He will notify when he'll arrive.
                break;
                
            case this._states.GENERATING:
                // Update the generating timer
                this._slot.amount  = 0; // TODO delete this debug
                
                if (this._slot.amount == 0) {
                    // find another resource
                    this._currentState = this._states.IDLE;                    
                }
                break;
        
            default:
                break;
        }
    }
    
    /**
     * The minion arrived at the given resouceslot.
     */
    public finishedWalkingOn(data?:Hexagon) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING) {
            // Make it generate !
            this._currentState = this._states.GENERATING;
            this._slot = data.resourceSlot;
        } else {
            // Nothing to do
        }
    }
    
    /**
     * Find the nearest hexagon containing the resource to find, and move the 
     * minion to it.
     */
    private _findAndGoToNearestResource() {
        let nearestHexagon = this._minion.getNearestResource(this._resource);
        if (nearestHexagon) {
            nearestHexagon.resourceSlot.isOccupied = true;
            this._minion.moveTo(nearestHexagon);
        } else {
            console.warn('no such resource found in base : ', this._resource);
        }
    }
    
    /**
     * Generate resource each XX ms using the generatingtimer
     */
    private _generate() {
        
    }
    
    /**
     * Reset the occupied slot
     */
    public dispose() {
        // The resource slot is no more occupied
        if (this._slot) {
            this._slot.isOccupied = false;
        }
        // TODO delete timer
    }
}