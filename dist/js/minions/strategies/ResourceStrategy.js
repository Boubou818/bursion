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
        this._resource = res;
        // The generating timer is an finite loop
        this._generatingTimer = new Timer(ResourceStrategy.TIME_TO_GENERATE, minion.getScene());
        // At the end of the timer, update state
        this._generatingTimer.onFinish = this._comeBackToWarehouse.bind(this);
    }
    /**
     * When the minion finished generate resources, go back to the warehouse
     * by updating its state.
     * Also reset the timer.
     */
    ResourceStrategy.prototype._comeBackToWarehouse = function () {
        // Reset timer
        this._generatingTimer.hardReset();
        // Remove resources from the slot
        var amount = 10; // TODO replace with minion.strength
        this._package.slot.extract(amount);
        this._package.amount = amount;
        this._currentState = this._states.END_GENERATING;
    };
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
            TRAVELING_TO_RESOURCE: 1,
            AT_RESOURCE: 2,
            END_GENERATING: 3,
            TRAVELING_TO_WAREHOUSE: 4,
            AT_WAREHOUSE: 5
        };
        this._currentState = this._states.IDLE;
    };
    ResourceStrategy.prototype.applyStrategy = function () {
        switch (this._currentState) {
            case this._states.IDLE:
                // Look for the nearest resource point
                if (this._findAndGoToNearestResource()) {
                    // Exit this state
                    this._currentState = this._states.TRAVELING_TO_RESOURCE;
                } // else nothing to do, stay idle
                break;
            case this._states.TRAVELING_TO_RESOURCE:
            case this._states.TRAVELING_TO_WAREHOUSE:
                // Nothing to do, let the minion go the to given point.
                // He will notify when he'll arrive.
                break;
            case this._states.AT_RESOURCE:
                // Start the resource generation
                this._generatingTimer.start();
                break;
            case this._states.END_GENERATING:
                // Create 3D model of resource on minion and go to next state
                this._resourceModel = Resources.getModelForResource(this._minion.game, this._resource);
                this._resourceModel.position.y = 1;
                this._resourceModel.parent = this._minion;
                // Find nearest warehouse
                if (this._findAndGoToNearestWarehouse()) {
                    this._currentState = this._states.TRAVELING_TO_WAREHOUSE;
                }
                // Go to next state
                break;
            case this._states.AT_WAREHOUSE:
                // Remove 3D model of the resource carried on by the minion
                this._resourceModel.dispose();
                // Add stock to the warehouse   
                this._warehouse.add(this._package.amount, this._resource);
                this._package = null;
                // Go to idle state
                this._currentState = this._states.IDLE;
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
        if (this._currentState == this._states.TRAVELING_TO_RESOURCE) {
            // Set new state to AT_RESOURCE
            this._currentState = this._states.AT_RESOURCE;
        }
        else if (this._currentState == this._states.TRAVELING_TO_WAREHOUSE) {
            // Set new state to AT_WAREHOUSE
            this._currentState = this._states.AT_WAREHOUSE;
        }
    };
    /**
     * Find the nearest warehouse
     */
    ResourceStrategy.prototype._findAndGoToNearestWarehouse = function () {
        var warehouse = this._minion.getNearestWarehouse();
        if (warehouse) {
            this._warehouse = warehouse;
            this._minion.moveTo(warehouse.workingSite);
            return true;
        }
        else {
            console.warn('no warehouse found in base');
            return false;
        }
    };
    /**
     * Find the nearest hexagon containing the resource to find, and move the
     * minion to it. Returns false if no available resource.
     */
    ResourceStrategy.prototype._findAndGoToNearestResource = function () {
        var nearestHexagon = this._minion.getNearestResource(this._resource);
        if (nearestHexagon) {
            // Initalize minion's package
            this._package = {};
            this._package.slot = nearestHexagon.resourceSlot;
            this._minion.moveTo(nearestHexagon);
            return true;
        }
        else {
            console.warn('no such resource found in base : ', this._resource);
            return false;
        }
    };
    /**
     * Reset the occupied slot
     */
    ResourceStrategy.prototype.dispose = function () {
        // Delete timer
        this._generatingTimer.stop(true);
        // Delete 3D model if any
        if (this._resourceModel) {
            this._resourceModel.dispose();
        }
    };
    // The time to generate a given amount of resource
    ResourceStrategy.TIME_TO_GENERATE = 2000;
    return ResourceStrategy;
}(WorkingStrategy));
//# sourceMappingURL=ResourceStrategy.js.map