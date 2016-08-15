var ResourceSlot = (function () {
    function ResourceSlot() {
        // The resource of this slot - empty by default
        this.resource = Resources.Empty;
        // The number of material this resource can generate.
        this.amount = 20;
        // The amount of material this resource will generate every 10 seconds
        this.gain = 0;
    }
    /**
     * Is this slot available to host a minion ?
     * Returns true if the resource is not empy and this slot is not occupied
     */
    ResourceSlot.prototype.isAvailable = function () {
        return this.amount > 0;
    };
    /**
     * Extract the given amount of material of this resource
     */
    ResourceSlot.prototype.extract = function (value) {
        this.amount -= value;
        if (this.amount <= 0) {
            // destroy the 3D model
            this.dispose();
        }
    };
    ResourceSlot.prototype.dispose = function () {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        this.resource = Resources.Empty;
        this.amount = 0;
    };
    return ResourceSlot;
}());
//# sourceMappingURL=ResourceSlot.js.map