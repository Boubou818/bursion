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
    private _resource: Resources;

    // The 3D model displayed above the head of the minion
    private _resourceModel: BABYLON.Mesh;

    // The package the minion is carrying around.
    // Is reset when the minion is looking for resources
    private _package: { slot?: ResourceSlot, amount?: number };

    // The timer used to generate resource
    private _generatingTimer: Timer;

    // The time to generate a given amount of resource
    private static TIME_TO_GENERATE: number = 2000;

    /**
     * Give me the resource to gather
     */
    constructor(minion: Minion, res: Resources) {
        super(minion);

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
    private _comeBackToWarehouse(): void {
        // Reset timer
        this._generatingTimer.hardReset();

        // Remove resources from the slot
        let amount = 10; // TODO replace with minion.strength
        this._package.slot.extract(amount);
        this._package.amount = amount;

        this._currentState = this._states.END_GENERATING;
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
            IDLE: 0,
            TRAVELING_TO_RESOURCE: 1,
            AT_RESOURCE: 2,
            END_GENERATING: 3,
            TRAVELING_TO_WAREHOUSE: 4,
            AT_WAREHOUSE: 5
        }
        this._currentState = this._states.IDLE;
    }


    public applyStrategy() {
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
                this._resourceModel = BABYLON.Mesh.CreateSphere('resource', 3, 0.5, this._minion.getScene());
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
                this._minion.addResourceToGame(this._package.amount, this._resource);
                this._package = null;

                // Go to idle state
                this._currentState = this._states.IDLE;
                break;

            default:
                break;
        }
    }

    /**
     * The minion arrived at the given resouceslot.
     */
    public finishedWalkingOn(data?: MapHexagon) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING_TO_RESOURCE) {
            // Set new state to AT_RESOURCE
            this._currentState = this._states.AT_RESOURCE;
        } else if (this._currentState == this._states.TRAVELING_TO_WAREHOUSE) {
            // Set new state to AT_WAREHOUSE
            this._currentState = this._states.AT_WAREHOUSE;
        }
    }

    /**
     * Find the nearest warehouse 
     */
    private _findAndGoToNearestWarehouse(): boolean {
        let warehouse: Warehouse = this._minion.getNearestWarehouse();
        if (warehouse) {
            this._minion.moveTo(warehouse.workingSite);
            return true;
        } else {
            console.warn('no warehouse found in base');
            return false;
        }
    }

    /**
     * Find the nearest hexagon containing the resource to find, and move the 
     * minion to it. Returns false if no available resource.
     */
    private _findAndGoToNearestResource(): boolean {
        let nearestHexagon = this._minion.getNearestResource(this._resource);
        if (nearestHexagon) {
            // Initalize minion's package
            this._package = {};
            this._package.slot = nearestHexagon.resourceSlot;
            this._minion.moveTo(nearestHexagon);
            return true;
        } else {
            console.warn('no such resource found in base : ', this._resource);
            return false;
        }
    }

    /**
     * Reset the occupied slot
     */
    public dispose() {
        // Delete timer
        this._generatingTimer.stop(true);

        // Delete 3D model if any
        if (this._resourceModel) {
            this._resourceModel.dispose();
        }
    }
}