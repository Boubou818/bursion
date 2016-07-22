var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Warehouse = (function (_super) {
    __extends(Warehouse, _super);
    function Warehouse(game, base) {
        _super.call(this, game, base);
        // The stock of this warehouse
        this._stock = [];
    }
    Warehouse.prototype._initCost = function () {
        this._resourcesNeeded[Resources.Wood] = 20;
        this._resourcesNeeded[Resources.Rock] = 20;
    };
    /**
     * Returns a 3D model corresponding to this shape
     */
    Warehouse.prototype._getBuildingModel = function () {
        var b = BABYLON.Mesh.CreateBox('_warehouse_', 0.5, this._game.scene);
        b.position.copyFrom(this._points[this._points.length - 1].center);
        return b;
    };
    /**
     * Create and set base extension material
     */
    Warehouse.prototype._setFinishedMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_warehouseFinishedMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_warehouseFinishedMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.FromInts(255, 0, 0);
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    };
    /**
     * Create and set the prebuild base extension material
     */
    Warehouse.prototype._setPrebuildMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_warehouseWaitingMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_warehouseWaitingMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.Blue();
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    };
    /**
     * Create and set the base extension material
     */
    Warehouse.prototype._setWaitingForMinionMaterial = function () {
        var mat = this._game.scene.getMaterialByName('_warehouseMaterial_');
        if (!mat) {
            var mymat = new BABYLON.StandardMaterial('_warehouseMaterial_', this._game.scene);
            mymat.diffuseColor = BABYLON.Color3.Yellow();
            mymat.specularColor = BABYLON.Color3.Black();
            mat = mymat;
        }
        this.material = mat;
    };
    /**
     * Add the given stock to the warehouse
     * TODO
     */
    Warehouse.prototype.add = function (amount, res) {
        this._stock[res] += amount;
    };
    /**
     * Take from stock the given amount of resources
     * TODO
     */
    Warehouse.prototype.take = function (amount, res) {
    };
    return Warehouse;
}(Building));
var StarterWarehouse = (function (_super) {
    __extends(StarterWarehouse, _super);
    function StarterWarehouse() {
        _super.apply(this, arguments);
    }
    StarterWarehouse.prototype._initCost = function () {
        this._resourcesNeeded[Resources.Wood] = 0;
        this._resourcesNeeded[Resources.Rock] = 0;
    };
    /**
     * The starter extension
     */
    StarterWarehouse.prototype._initBuilding = function () {
        var grid = MapHexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, 3, true);
        // Use template
        for (var i = 0; i < StarterWarehouse.TEMPLATE.length - 1; i += 2) {
            var center = grid.getCenterXY(StarterWarehouse.TEMPLATE[i], StarterWarehouse.TEMPLATE[i + 1]);
            this._points.push(new BuildingPoint(new BABYLON.Vector3(center.x, 0, center.y), this));
        }
    };
    // Q and R coordinates of a starter platform
    StarterWarehouse.TEMPLATE = [
        -1, 1,
        0, 0,
        1, 0,
        2, 0,
        0, 1,
        1, 1,
        2, 1
    ];
    return StarterWarehouse;
}(Warehouse));
//# sourceMappingURL=Warehouse.js.map