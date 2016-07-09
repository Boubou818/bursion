var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A minion will gather resource:
 *
 * - go to the nearest wood resource available in the base
 *   - If no resource is available, nothing is done
 * - generate resource if already at a resource point
 * - If the resource is empty, go to another resource point available
 */
var ResourceStrategy = (function (_super) {
    __extends(ResourceStrategy, _super);
    /**
     * Give me the resource to gather
     */
    function ResourceStrategy(minion, res) {
        _super.call(this, minion);
        // The resource slot this minion is working on
        this._slot = null;
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
    ResourceStrategy.prototype._buildStates = function () {
        this._states = {
            IDLE: 0,
            TRAVELING: 1,
            GENERATING: 2
        };
        this._currentState = this._states.IDLE;
    };
    ResourceStrategy.prototype.applyStrategy = function () {
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
                this._slot.amount = 0; // TODO delete this debug
                if (this._slot.amount == 0) {
                    // find another resource
                    this._currentState = this._states.IDLE;
                }
                break;
            default:
                break;
        }
    };
    /**
     * The minion arrived at the given resouceslot.
     */
    ResourceStrategy.prototype.finishedWalkingOn = function (data) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING) {
            // Make it generate !
            this._currentState = this._states.GENERATING;
            this._slot = data.resourceSlot;
        }
        else {
        }
    };
    /**
     * Find the nearest hexagon containing the resource to find, and move the
     * minion to it.
     */
    ResourceStrategy.prototype._findAndGoToNearestResource = function () {
        var nearestHexagon = this._minion.getNearestResource(this._resource);
        if (nearestHexagon) {
            nearestHexagon.resourceSlot.isOccupied = true;
            this._minion.moveTo(nearestHexagon);
        }
        else {
            console.warn('no such resource found in base : ', this._resource);
        }
    };
    /**
     * Generate resource each XX ms using the generatingtimer
     */
    ResourceStrategy.prototype._generate = function () {
    };
    /**
     * Reset the occupied slot
     */
    ResourceStrategy.prototype.dispose = function () {
        // The resource slot is no more occupied
        if (this._slot) {
            this._slot.isOccupied = false;
        }
        // TODO delete timer
    };
    return ResourceStrategy;
}(WorkingStrategy));
//# sourceMappingURL=ResourceStrategy.js.map