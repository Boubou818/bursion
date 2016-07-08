var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Represent a worker :
 * - can walk on the player base,
 * - build
 * - defend the base
 */
var Minion = (function (_super) {
    __extends(Minion, _super);
    function Minion(name, base, scene) {
        var _this = this;
        _super.call(this, name, scene);
        // Give it a circular shape
        this._child = BABYLON.Mesh.CreateSphere('', 3, 0.5, scene);
        var mat = new BABYLON.StandardMaterial('', scene);
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
        this._controller.atEachDestination = function (hx) {
            _this.currentHexagon = hx;
        };
    }
    /**
     * Make the minion walk to the given hexagon:
     * - Find shortest path to this hex
     * - Add a destination for each hex of the path
     * - make it moooove \o/
     */
    Minion.prototype.moveTo = function (hex) {
        var path = this.base.getPathFromTo(this.currentHexagon, hex);
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var hex_1 = path_1[_i];
            var tmp = hex_1.getWorldCenter();
            tmp.y = 0.75;
            this._controller.addDestination(tmp, hex_1);
        }
        this._controller.start();
    };
    /**
     * Order given to the minion to gather wood.
     * The minion will :
     * - find the nearest slot of wood present in the map,
     * - walk with it and start to generate resources
     */
    Minion.prototype.gatherWood = function () {
        var nearestWoodHexagon = this.base.getNearestWoodHexagon(this.currentHexagon);
        if (nearestWoodHexagon) {
            this.moveTo(nearestWoodHexagon);
        }
        else {
            console.warn('no wood found in base');
        }
    };
    return Minion;
}(BABYLON.Mesh));
//# sourceMappingURL=Minion.js.map