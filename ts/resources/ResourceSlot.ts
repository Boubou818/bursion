class ResourceSlot {

    // The resource of this slot - empty by default
    public resource : Resources = Resources.Empty;
    
    // The number of material this resource can generate.
    public amount : number = 20;    

    // The amount of material this resource will generate every 10 seconds
    public gain : number = 0;  

    // The 3D mesh to displayed on the map
    public model : BABYLON.AbstractMesh; 
    
    constructor() {
    }

    /**
     * Is this slot available to host a minion ?
     * Returns true if the resource is not empy and this slot is not occupied
     */
    public isAvailable() : boolean {
        return this.amount > 0;
    }
    
    /**
     * Extract the given amount of material of this resource
     */
    public extract(value:number){
        this.amount -= value;
        if (this.amount <= 0) {
            // destroy the 3D model
            this.dispose();
        }
    }
    
    public dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        
        this.resource = Resources.Empty;
        this.amount = 0;
        
    }

}