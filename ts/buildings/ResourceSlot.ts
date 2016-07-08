class ResourceSlot {

    // The resource of this slot - empty by default
    public resource : Resource = new Empty();

    // True if a minion is being generating resources.
    public isOccupied : boolean = false;
    
    constructor() {

    }

    /**
     * Is this slot available to host a minion ?
     * Returns true if the resource is not empy and this slot is not occupied
     */
    public isAvailable() : boolean {
        return !this.isOccupied && this.resource.amount > 0;
    }

}