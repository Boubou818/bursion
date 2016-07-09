class ResourceSlot {

    // The resource of this slot - empty by default
    public resource : Resources = Resources.Empty;

    // True if a minion is being generating resources.
    public isOccupied : boolean = false;
    
    // The number of material this resource can generate.
    public amount : number = 100;    

    // The amount of material this resource will generate every 10 seconds
    public gain : number = 0;   
    
    constructor() {

    }

    /**
     * Is this slot available to host a minion ?
     * Returns true if the resource is not empy and this slot is not occupied
     */
    public isAvailable() : boolean {
        return !this.isOccupied && this.amount > 0;
    }

}