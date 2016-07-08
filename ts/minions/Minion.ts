/**
 * Represent a worker : 
 * - can walk on the player base, 
 * - build
 * - defend the base
 */
class Minion extends BABYLON.Mesh {

    private _child : BABYLON.Mesh;

    private _controller : MinionController;

    // The hexagon this minion currently is.
    // This attribute should be updated each time the minion walks on an hex.
    public currentHexagon : Hexagon;

    // The player base graph where the minion can walk on.
    public base : Base;

    constructor(name:string, base:Base, scene:BABYLON.Scene) {
        super(name, scene);


        // Give it a circular shape
        this._child = BABYLON.Mesh.CreateSphere('', 3, 0.5, scene);
        let mat = new BABYLON.StandardMaterial('', scene);
        mat.diffuseColor = BABYLON.Color3.FromInts(127, 0, 155);
        mat.specularColor = BABYLON.Color3.Black();
        this._child.material = mat;

        this._child.parent = this;

        this.position.y = 0.75;
        this._controller = new MinionController(this);
        this._controller.speed = 0.05;
        
        this.currentHexagon = base.getStarterHex();
        this.base = base;

        // Update minion position
        this.position.copyFrom(this.currentHexagon.getWorldCenter());
        this.position.y = 0.75;

        // At each destination, the current hexagon where the minion lives is updated.
        this._controller.atEachDestination = (hx:Hexagon) => {
            this.currentHexagon = hx;
        };

    }

    /**
     * Make the minion walk to the given hexagon: 
     * - Find shortest path to this hex
     * - Add a destination for each hex of the path
     * - make it moooove \o/
     */
    public moveTo(hex:Hexagon) : void {
        let path = this.base.getPathFromTo(this.currentHexagon, hex);
        for (let hex of path) {
            let tmp = hex.getWorldCenter();
            tmp.y = 0.75;
            this._controller.addDestination(tmp, hex);
        }
        this._controller.start();
    }

    /** 
     * Order given to the minion to gather wood.
     * The minion will : 
     * - find the nearest slot of wood present in the map, 
     * - walk with it and start to generate resources
     */
    public gatherWood() {
        let nearestWoodHexagon = this.base.getNearestWoodHexagon(this.currentHexagon);
        if (nearestWoodHexagon) {
            this.moveTo(nearestWoodHexagon);
        } else {
            console.warn('no wood found in base');
        }
    }

}