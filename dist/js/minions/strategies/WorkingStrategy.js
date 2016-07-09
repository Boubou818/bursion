/**
 * Represent the strategy of a minion. A minion can :
 * - gather wood
 * - gather rock
 * - gather meat
 * - build
 * - Fix the drakkar (use resources to build the ship)
 * A strategy is given by the player.
 */
var WorkingStrategy = (function () {
    /**
     * Each subclass will define this state machine in their constructor
     */
    function WorkingStrategy(minion) {
        // True if the minion has been given an order, false if the minion is waiting for orders.
        // protected _isBusy : boolean = false;
        // Each strategy is a state machine, each state is a number 
        this._states = {};
        this._minion = minion;
        this._buildStates();
    }
    return WorkingStrategy;
}());
//# sourceMappingURL=WorkingStrategy.js.map