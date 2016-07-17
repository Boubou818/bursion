var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A minion with a build strategy will go the the nearest building waiting for a minion
 * and spend some time on it, in order to build it. Once the building finished, the minion will
 * try to find another one. If not found, the minion stays idle.
 */
var BuildStrategy = (function (_super) {
    __extends(BuildStrategy, _super);
    function BuildStrategy(minion) {
        _super.call(this, minion);
        // The building the minion is currently working on
        this._workingOn = null;
    }
    /**
     * A build strategy is composed of 3 states, like the resource strategy :
     * - the minion is idle, looking for next building to build
     * - searching for the nearest building and going there. This state is over when
     * the minion is at the building point
     * -  Build. This state is over when
     * the building is finished
     */
    BuildStrategy.prototype._buildStates = function () {
        this._states = {
            IDLE: 0,
            TRAVELING: 1,
            BUILDING: 2
        };
        this._currentState = this._states.IDLE;
    };
    /**
     *
     * TODO
     */
    BuildStrategy.prototype.applyStrategy = function () {
        switch (this._currentState) {
            case this._states.IDLE:
                // Look for the nearest resource point
                this._findAndGoToNearestBuilding();
                // Exit this state
                this._currentState = this._states.TRAVELING;
                break;
            case this._states.TRAVELING:
                // Nothing to do, let the minion go the to resource point.
                // He will notify when he'll arrive.
                break;
            case this._states.BUILDING:
                // Update the generating timer
                // if (!this._generatingTimer.started){
                //     this._generatingTimer.start();
                // } 
                // if (this._slot.amount == 0) {  
                //     // reset timer                  
                //     this._generatingTimer.reset();
                //     // find another resource
                //     this._currentState = this._states.IDLE;                    
                // }
                break;
            default:
                break;
        }
    };
    /**
     * Find the nearest building waiting to be built, and move the
     * minion to it.
     */
    BuildStrategy.prototype._findAndGoToNearestBuilding = function () {
        var building = this._minion.getNearestBuilding();
        if (building) {
            this._workingOn = building;
            this._workingOn.waitingToBeBuilt = false;
            this._minion.moveTo(building.workingSite);
        }
        else {
            console.warn('no building found in base');
        }
    };
    /**
     * Reset the building this minion was working on
     */
    BuildStrategy.prototype.dispose = function () {
        this._workingOn.waitingToBeBuilt = true;
        this._workingOn = null;
    };
    /**
     * The minion arrived at the given resouceslot.
     * TODO
     */
    BuildStrategy.prototype.finishedWalkingOn = function (data) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING) {
            // Make it generate !
            this._currentState = this._states.GENERATING;
        }
        else {
        }
    };
    return BuildStrategy;
}(WorkingStrategy));
//# sourceMappingURL=BuildStrategy.js.map