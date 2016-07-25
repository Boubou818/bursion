/**
 * A minion with a build strategy will go the the nearest warehouse with needed resources, 
 *  and go back and forth to the nearest building waiting for a minion. 
 * Once the building finished, the minion will 
 * try to find another one. If not found, the minion stays idle. 
 */
class BuildStrategy extends WorkingStrategy {

    // The building the minion is currently working on
    private _workingOn: Building = null;
    
    // The 3D model displayed above the head of the minion
    private _resourceModel: BABYLON.Mesh;
    
    // The resource this minion will bring
    private _package : ResourceMap<number> = [];
    
    private _warehouse : Warehouse = null;

    constructor(minion: Minion) {
        super(minion);
    }

    /**
     * A build strategy is composed of 3 states, like the resource strategy : 
     * - the minion is idle, looking for next building to build
     * - searching for the nearest building and going there. This state is over when
     * the minion is at the building point
     * -  Build. This state is over when 
     * the building is finished
     */
    protected _buildStates() {
        this._states = {
            IDLE: 0,
            TRAVELING_TO_WAREHOUSE: 1,
            AT_WAREHOUSE: 2,
            TOOK_RESOURCE: 3,
            TRAVELING_TO_BUILDING: 4,
            AT_BUILDING: 5,

        }
        this._currentState = this._states.IDLE;
    }

    /**
     * 
     * TODO
     */
    public applyStrategy() {
        switch (this._currentState) {

            case this._states.IDLE:
                // Check if a building is waiting to be built
                let building: Building = this._minion.getNearestBuildingWaitingForMinion();

                if (building) {
                    // This building needs help !
                    this._workingOn = building;
                                        
                    // Go to warehouse to take resources
                    let nbOfHexToTravel = this._findAndGoToNearestWarehouse();
                    if (nbOfHexToTravel != -1) { // If a warehouse is found
                    
                        // Choose resource to carry on
                        this._createPackage();
                    
                        // Exit this state
                        if (nbOfHexToTravel === 0) {
                            // If the minion is already on the warehouse
                            this._currentState = this._states.AT_WAREHOUSE;
                            
                        } else {
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
                
                // Create 3D model of resource on minion and go to next state
                let resource : number = Number(Object.keys(this._package)[0]); 
                this._resourceModel = Resources.getModelForResource(this._minion.game, resource);
                this._resourceModel.position.y = 1;
                this._resourceModel.parent = this._minion;
                
                // Take resource
                this._takeNeededResource();
                
                // Go to building
                this._minion.moveTo(this._workingOn.workingSite);
                
                // Exit state
                this._currentState = this._states.TRAVELING_TO_BUILDING;
                break;
                
            case this._states.AT_BUILDING: 
                // Remove 3D model above the mlinion head
                // TODO
                
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
    }
    
    /**
     * Get the resource from the warehouse
     */
    private _takeNeededResource() {     
        
        let resource : number = Number(Object.keys(this._package)[0]); 
        let toBring = this._package[resource];
        
        this._warehouse.take(toBring, resource);
    }
    
    /**
     * Choose a resource to bring to the building. 
     * Register this resource and the amoung into the incomingResource of the building.
     */
    private _createPackage() {        
        this._package = [];
        
        let resourcesNeeded : ResourceMap<number> = this._workingOn.getNeededResources();
        let canCarryMax = 10;
        
        let resource : number = Number(Object.keys(resourcesNeeded)[0]); 
        let toBring = resourcesNeeded[resource];
        toBring = (toBring > canCarryMax)?canCarryMax:toBring;
        this._package[resource] = toBring;
        
        // Register as 'incomingResource' into the building
        this._workingOn.addIncomingMaterial(toBring, resource);
    }
    
    /**
     * Add the package to the building
     */
    private _addPackageToBuilding() {        
        let resource : number = Number(Object.keys(this._package)[0]); 
        let toBring = this._package[resource];        
        this._workingOn.addMaterial(toBring, resource);
    }

    /**
     * Reset the building this minion was working on
     */
    public dispose() {
        if (this._workingOn) {
            this._workingOn = null;
        } // else the minion was idle
        
        // Delete 3D model if any
        if (this._resourceModel) {
            this._resourceModel.dispose();
        }
    }

    /**
     * The minion arrived at the given resouceslot.
     * TODO
     */
    public finishedWalkingOn(data?: MapHexagon) {
        // If the minion was traveling...
        if (this._currentState == this._states.TRAVELING_TO_WAREHOUSE) {
            this._currentState = this._states.AT_WAREHOUSE;
        }
        else if (this._currentState == this._states.TRAVELING_TO_BUILDING) {
            this._currentState = this._states.AT_BUILDING;
        } 
        else {
            // Nothing happens
        }
    }

    /**
     * Find the nearest warehouse.
     * Returns -1 if no warehouse found
     */
    private _findAndGoToNearestWarehouse(): number {
        let warehouse: Warehouse = this._minion.getNearestWarehouse();
        if (warehouse) {
            // Save warehouse
            this._warehouse = warehouse;
            let nbHexToTravel = this._minion.moveTo(warehouse.workingSite);
            return nbHexToTravel;
        } else {
            console.warn('no warehouse found in base');
            return -1;
        }
    }
}