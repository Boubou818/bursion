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
        // The generating timer is an infinite loop
        this._buildingTimer = new Timer(BuildStrategy.TIME_TO_BUILD, minion.getScene(), { repeat: -1 } // repeat infinitely
        );
        // At each tick, add resource
        this._buildingTimer.callback = this._build.bind(this);
    }
    /**
     * Build the building at each tick using the buildingTimer
     */
    BuildStrategy.prototype._build = function () {
        var amount = 10; // TODO replace with minion.strength
        this._workingOn.buildTick(amount);
    };
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
                if (this._findAndGoToNearestBuilding()) {
                    // Exit this state
                    this._currentState = this._states.TRAVELING;
                }
                break;
            case this._states.TRAVELING:
                // Nothing to do, let the minion go the to resource point.
                // He will notify when he'll arrive.
                break;
            case this._states.BUILDING:
                // Update the generating timer
                if (!this._buildingTimer.started) {
                    this._buildingTimer.start();
                }
                if (this._workingOn.isFinished()) {
                    // reset timer                  
                    this._buildingTimer.reset();
                    // Finish building
                    this._workingOn.finishBuild();
                    // Reset building worked on
                    this._workingOn = null;
                    // find another building if any
                    this._currentState = this._states.IDLE;
                }
                break;
            default:
                break;
        }
    };
    /**
     * Find the nearest building waiting to be built, and move the
     * minion to it.
     * Returns true if a building have been found, false otherwise
     */
    BuildStrategy.prototype._findAndGoToNearestBuilding = function () {
        var building = this._minion.getNearestBuilding();
        if (building) {
            this._workingOn = building;
            this._workingOn.waitingToBeBuilt = false;
            // Move minion
            this._minion.moveTo(building.workingSite);
            return true;
        }
        else {
            console.warn('no building found in base');
            return false;
        }
    };
    /**
     * Reset the building this minion was working on
     */
    BuildStrategy.prototype.dispose = function () {
        if (this._workingOn) {
            this._workingOn.waitingToBeBuilt = true;
            this._workingOn = null;
        } // else the minion was idle
        // Delete timer
        this._buildingTimer.stop(true);
    };
    /**
     * The minion arrived at the given resouceslot.
     * TODO
     */
    BuildStrategy.prototype.finishedWalkingOn = function (data) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING) {
            // Make it generate !
            this._currentState = this._states.BUILDING;
        }
        else {
        }
    };
    // The building will be updated every 1s
    BuildStrategy.TIME_TO_BUILD = 500;
    return BuildStrategy;
}(WorkingStrategy));
//# sourceMappingURL=BuildStrategy.js.map