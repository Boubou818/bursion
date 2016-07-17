/** 
 * A Map Hexagon is an hexagon composed of a type (land, water, beach...) 
 * and a resource slot.
*/
class MapHexagon extends Hexagon {
    
    // The resource slot this hexagon contains
    public resourceSlot : ResourceSlot = new ResourceSlot();
    
    // The type of this hexagon: land, water, deepwater
    public type : HexagonType;
    
    constructor(q, r, grid) {
        super(q, r, grid);
    }
    
    
}