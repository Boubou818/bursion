var ResourceSlot = (function () {
    function ResourceSlot() {
        // The resource of this slot - empty by default
        this.resource = Resources.Empty;
        // True if a minion is being generating resources.
        this.isOccupied = false;
        // The number of material this resource can generate.
        this.amount = 100;
        // The amount of material this resource will generate every 10 seconds
        this.gain = 0;
    }
    /**
     * Is this slot available to host a minion ?
     * Returns true if the resource is not empy and this slot is not occupied
     */
    ResourceSlot.prototype.isAvailable = function () {
        return !this.isOccupied && this.amount > 0;
    };
    return ResourceSlot;
}());
//# sourceMappingURL=ResourceSlot.js.map