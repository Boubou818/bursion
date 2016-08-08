/**
 * Represent the strategy of a minion. A minion can : 
 * - gather wood
 * - gather rock
 * - gather meat
 * - build
 * - Fix the drakkar (use resources to build the ship)
 * A strategy is given by the player.
 */
abstract class WorkingStrategy {
    
    // The minion affected to this strategy
    protected _minion : Minion;
    
    // True if the minion has been given an order, false if the minion is waiting for orders.
    // protected _isBusy : boolean = false;
    
    // Each strategy is a state machine, each state is a number 
    protected _states : any = {};
    
    // The current state of the minon
    protected _currentState : number;
    
    /**
     * Each subclass will define this state machine in their constructor
     */
    constructor(minion : Minion) {
        this._minion = minion;
        this._buildStates();
    }
    
    /**
     * Build the state machine of this strategy
     */
    protected abstract _buildStates ();
    
    /**
     * Method that will be called at each tick.
     * The strategy is applied only if the minion is waiting for orders
     */
    public abstract applyStrategy();
    
    /**
     * Used to notify the strategy the minion finished to reach the final destination
     */
    public abstract finishedWalkingOn(data?:MapHexagon);
    
    /**
     * Dispose the strategy : clean any data left by minions on the map (if any)
     */
    public abstract dispose();

    /**
     * Returns true if the current state of the minion is idle.
     * If 'idle' doesn't exist, return false
     */
    public isIdle () {
        if (this._states.IDLE !== undefined) {
            console.log('is idle : ', this._currentState === this._states.IDLE); 
            return this._currentState === this._states.IDLE;
            
        }
        return false;
    }
}