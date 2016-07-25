var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A base extension is a set of 3/4/5 hexagons, used to expand the player base.
 * Minion can only walk on base extension, and buildings can only be built on base extension.
 * Resource can only be harvested on base extension.
 * When a base extension is setup, all hexagon of the map below are disposed.
 * Hexagon coordinates are relative to the shape.
 * The center of the shape is the first hexagon at (0,0).
 */
var BaseExtension = (function (_super) {
    __extends(BaseExtension, _super);
    function BaseExtension(game, base) {
        _super.call(this, game, base);
        // The set of hexagons. These hexagons does not contains any resources
        this.hexagons = [];
    }
    /**
     * 10 Wood - 20 Rock
     */
    BaseExtension.prototype._initCost = function () {
        // Init cost
        this._cost[Resources.Wood] = 10;
        this._cost[Resources.Rock] = 20;
    };
    /**
     * Create and set the base extension material
     */
    BaseExtension.prototype._setWaitingForMinionMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_baseExtensionMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_baseExtensionMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(255, 152, 0);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    };
    /**
     * Create and set the prebuild base extension material
     */
    BaseExtension.prototype._setPrebuildMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_baseExtensionWaitingMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_baseExtensionWaitingMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.Green();
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    };
    /**
     * Create and set base extension material
     */
    BaseExtension.prototype._setFinishedMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_baseExtensionFinishedMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_baseExtensionFinishedMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(126, 138, 162);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    };
    /**
     * Returns a 3D model corresponding to this shape
     */
    BaseExtension.prototype._getBuildingModel = function () {
        var b = BABYLON.Mesh.CreateBox('_baseExtension_', 0.7, this._game.scene);
        b.position.copyFrom(this._points[0].center);
        b.position.y = 1;
        return b;
    };
    return BaseExtension;
}(Building));
//# sourceMappingURL=BaseExtension.js.map