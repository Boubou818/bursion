var ResourceSlot = (function () {
    function ResourceSlot() {
        // The resource of this slot - empty by default
        this.resource = new Empty();
        // True if a minion is being generating resources.
        this.isOccupied = false;
    }
    /**
     * Is this slot available to host a minion ?
     * Returns true if the resource is not empy and this slot is not occupied
     */
    ResourceSlot.prototype.isAvailable = function () {
        return !this.isOccupied && this.resource.amount > 0;
    };
    return ResourceSlot;
}());
//# sourceMappingURL=ResourceSlot.js.map