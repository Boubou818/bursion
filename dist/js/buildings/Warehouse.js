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
        this._cost[Resources.Wood] = 20;
        this._cost[Resources.Rock] = 20;
    };
    /**
     * Returns the amount of material for the given resource
     */
    Warehouse.prototype.getStockOf = function (res) {
        if (this._stock[res]) {
            return this._stock[res];
        }
        else {
            return 0;
        }
    };
    /**
     * Returns a 3D model corresponding to this shape
     */
    Warehouse.prototype._getBuildingModel = function () {
        var warehouseModel = this._game.createInstanceAsset('warehouse');
        warehouseModel.position.copyFrom(this._points[0].center);
        return warehouseModel;
    };
    /**
     * Create and set base extension material
     */
    Warehouse.prototype._setFinishedMaterial = function () {
        var mat = this._game.scene.getMaterialByName('base');
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
     */
    Warehouse.prototype.add = function (amount, res) {
        if (!this._stock[res]) {
            this._stock[res] = amount;
        }
        else {
            this._stock[res] += amount;
        }
        this._game.computeTotalStock();
        console.log(this.toString());
    };
    /**
     * Take from stock the given amount of resources, and returns the amount
     * effectiveley taken from the warehouse.
     * Returns 0 if the given resource is empty
     */
    Warehouse.prototype.take = function (amount, res) {
        var realAmount = 0;
        if (this._stock[res]) {
            // If the resource is present and not empty
            if (this._stock[res] >= amount) {
                // If there is plenty    
                this._stock[res] -= amount;
                realAmount = amount;
            }
            else {
                // If there is few
                realAmount = this._stock[res];
                this._stock[res] = 0;
            }
        }
        else {
            realAmount = 0;
        }
        this._game.computeTotalStock();
        return realAmount;
    };
    Warehouse.prototype.toString = function () {
        var str = '';
        for (var res in this._stock) {
            str += 'resource : ' + res + ' : ' + this._stock[res] + '\n';
        }
        return str;
    };
    return Warehouse;
}(Building));
var StarterWarehouse = (function (_super) {
    __extends(StarterWarehouse, _super);
    function StarterWarehouse() {
        _super.apply(this, arguments);
    }
    StarterWarehouse.prototype._initCost = function () {
        this._cost[Resources.Wood] = 0;
        this._cost[Resources.Rock] = 0;
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
        // Init stock
        this._stock[Resources.Wood] = 100;
        this._stock[Resources.Rock] = 100;
        this._stock[Resources.Meat] = 100;
    };
    // This building is finished
    StarterWarehouse.prototype.isNearlyFinished = function () {
        return true;
    };
    // Q and R coordinates of a starter platform
    StarterWarehouse.TEMPLATE = [
        -1, 1,
        0, 0,
        1, 0,
        0, 1
    ];
    return StarterWarehouse;
}(Warehouse));
//# sourceMappingURL=Warehouse.js.map