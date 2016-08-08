var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A minion with a build strategy will go the the nearest warehouse with needed resources,
 *  and go back and forth to the nearest building waiting for a minion.
 * Once the building finished, the minion will
 * try to find another one. If not found, the minion stays idle.
 */
var BuildStrategy = (function (_super) {
    __extends(BuildStrategy, _super);
    function BuildStrategy(minion) {
        _super.call(this, minion);
        // The building the minion is currently working on
        this._workingOn = null;
        // The resource this minion will bring
        this._package = [];
        this._warehouse = null;
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
            TRAVELING_TO_WAREHOUSE: 1,
            AT_WAREHOUSE: 2,
            TOOK_RESOURCE: 3,
            TRAVELING_TO_BUILDING: 4,
            AT_BUILDING: 5,
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
                // Check if a building is waiting to be built
                var building = this._minion.getNearestBuildingWaitingForMinion();
                if (building) {
                    // This building needs help !
                    this._workingOn = building;
                    // Go to warehouse to take resources
                    var nbOfHexToTravel = this._findAndGoToNearestWarehouse();
                    if (nbOfHexToTravel != -1) {
                        // Choose resource to carry on
                        this._createPackage();
                        // Exit this state
                        if (nbOfHexToTravel === 0) {
                            // If the minion is already on the warehouse
                            this._currentState = this._states.AT_WAREHOUSE;
                        }
                        else {
                            this._currentState = this._states.TRAVELING_TO_WAREHOUSE;
                        }
                    }
                } // Nothing to do, stay idle
                break;
            case this._states.TRAVELING_TO_WAREHOUSE:
            case this._states.TRAVELING_TO_BUILDING:
                // Nothing to do, let the minion go the to resource point.
                // He will notify when he'll arrive.
                break;
            case this._states.AT_WAREHOUSE:
                // Take resource
                var hasResources = this._takeNeededResource();
                if (!hasResources) {
                    // Go back to idle state
                    this._currentState = this._states.IDLE;
                    break;
                }
                // Create 3D model of resource on minion and go to next state
                var resource = Number(Object.keys(this._package)[0]);
                this._resourceModel = Resources.getModelForResource(this._minion.game, resource);
                this._resourceModel.position.y = 1;
                this._resourceModel.parent = this._minion;
                // Go to building
                this._minion.moveTo(this._workingOn.workingSite);
                // Exit state
                this._currentState = this._states.TRAVELING_TO_BUILDING;
                break;
            case this._states.AT_BUILDING:
                // Remove 3D model above the mlinion head
                this._resourceModel.dispose();
                // Add package to material for this building
                this._addPackageToBuilding();
                // Check if the building is finished
                if (this._workingOn.isFinished()) {
                    this._workingOn.finishBuild();
                }
                // go back as idle
                this._currentState = this._states.IDLE;
            default:
                break;
        }
    };
    /**
     * Get the resource from the warehouse
     * Returns false if the warehouse has no more resources
     */
    BuildStrategy.prototype._takeNeededResource = function () {
        var resource = Number(Object.keys(this._package)[0]);
        var toBring = this._package[resource];
        var realAmount = this._warehouse.take(toBring, resource);
        if (realAmount == 0) {
            return false;
        }
        this._package[resource] = realAmount;
        return true;
    };
    /**
     * Choose a resource to bring to the building.
     * Register this resource and the amoung into the incomingResource of the building.
     */
    BuildStrategy.prototype._createPackage = function () {
        this._package = [];
        var resourcesNeeded = this._workingOn.getNeededResources();
        var canCarryMax = 10;
        var resource = Number(Object.keys(resourcesNeeded)[0]);
        var toBring = resourcesNeeded[resource];
        toBring = (toBring > canCarryMax) ? canCarryMax : toBring;
        this._package[resource] = toBring;
        // Register as 'incomingResource' into the building
        this._workingOn.addIncomingMaterial(toBring, resource);
    };
    /**
    * Restore the package caried if any : restore on the warehouse and on the building
    */
    BuildStrategy.prototype._disposePackage = function () {
        var resource = Number(Object.keys(this._package)[0]);
        // resource = NaN if the package is empty
        if (resource) {
            var toBring = this._package[resource];
            if (this._currentState === this._states.TRAVELING_TO_BUILDING) {
                // reset incoming resources and restore stock on warehouse
                this._workingOn.restoreIncomingMaterial(toBring, resource);
                this._warehouse.add(toBring, resource);
            }
            else if (this._currentState === this._states.TRAVELING_TO_WAREHOUSE) {
                // reset incoming resources on the building but don't restore stock
                this._workingOn.restoreIncomingMaterial(toBring, resource);
            }
        } // else nothing to do, the package was empty
        // Delete package
        this._package = [];
    };
    /**
     * Add the package to the building
     */
    BuildStrategy.prototype._addPackageToBuilding = function () {
        var resource = Number(Object.keys(this._package)[0]);
        var toBring = this._package[resource];
        this._workingOn.addMaterial(toBring, resource);
        // Delete package
        this._package = [];
    };
    /**
     * Reset the building this minion was working on.
     * If the minion was carrying a package, this one is replaced on the warehouse
     * and incomingResource of the building are reset.
     */
    BuildStrategy.prototype.dispose = function () {
        // Delete package if traveling to building
        this._disposePackage();
        if (this._workingOn) {
            this._workingOn = null;
        } // else the minion was idle
        // Delete 3D model if any
        if (this._resourceModel) {
            this._resourceModel.dispose();
        }
    };
    /**
     * The minion arrived at the given resouceslot.
     */
    BuildStrategy.prototype.finishedWalkingOn = function (data) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING_TO_WAREHOUSE) {
            this._currentState = this._states.AT_WAREHOUSE;
        }
        else if (this._currentState == this._states.TRAVELING_TO_BUILDING) {
            this._currentState = this._states.AT_BUILDING;
        }
        else {
        }
    };
    /**
     * Find the nearest warehouse.
     * Returns -1 if no warehouse found
     */
    BuildStrategy.prototype._findAndGoToNearestWarehouse = function () {
        var warehouse = this._minion.getNearestWarehouse();
        if (warehouse) {
            // Save warehouse
            this._warehouse = warehouse;
            var nbHexToTravel = this._minion.moveTo(warehouse.workingSite);
            return nbHexToTravel;
        }
        else {
            console.warn('no warehouse found in base');
            return -1;
        }
    };
    return BuildStrategy;
}(WorkingStrategy));
//# sourceMappingURL=BuildStrategy.js.map