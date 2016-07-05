/// <reference path="../babylon.d.ts"/>
/// <reference path="MinionController.ts" />
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
    function Minion(name, scene) {
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
        this._controller.speed = 0.025;
    }
    return Minion;
}(BABYLON.Mesh));
//# sourceMappingURL=Minion.js.map