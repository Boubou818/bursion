/// <reference path="../babylon.d.ts" />
/**
 * A resource slot is a simple structure used to represent a place where a minion can be set to
 * generate the corresponding resource.
 * A slot is always associated to a building.
 */
var ResourceSlot = (function () {
    function ResourceSlot(position) {
        // The slot is working if a minion is present
        this.isWorking = false;
        // This parameter is set to true if a minion is headed to this resource.
        // It is set back to false when the minion is doing something else.
        this.isWaitingForMinion = false;
        this.position = position;
    }
    return ResourceSlot;
}());
//# sourceMappingURL=ResourceSlot.js.map