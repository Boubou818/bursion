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
    function BaseExtension(game) {
        _super.call(this, game);
        // The set of hexagons. These hexagons does not contains any resources
        this.hexagons = [];
    }
    /**
     * 10 Wood - 20 Rock
     */
    BaseExtension.prototype._initCost = function () {
        // Init cost
        this._resourcesNeeded[Resources.Wood] = 10;
        this._resourcesNeeded[Resources.Rock] = 20;
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
     * Create the shape, which has a random size between 3 and 5 hexs.
     */
    BaseExtension.prototype._initBuilding = function () {
        var _this = this;
        var grid = Hexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, 3, true);
        var size = Math.floor(((Math.random() * (6 - 3)) + 3)); // random [3;6[
        // Shuffle an array
        var shuffle = function (a) {
            var j, x, i;
            for (i = a.length; i; i -= 1) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x;
            }
        };
        // returns a random neighbor of the given hex
        var getNext = function (q, r) {
            var neighbors = grid.neighbors(q, r);
            shuffle(neighbors);
            for (var i = 0; i < neighbors.length; i++) {
                var hex = new Hexagon(neighbors[i].q, neighbors[i].r, grid, _this);
                if (!_this._isInShape(hex)) {
                    return hex;
                }
            }
            return null;
        };
        // Start a random shape with the center of the grid and iterate over neighbors
        var currentHex = coordinates[0];
        var first = new Hexagon(currentHex.q, currentHex.r, grid, this);
        this.hexagons.push(first);
        for (var i = 0; i < size; i++) {
            var next = getNext(currentHex.q, currentHex.r);
            if (!next)
                break;
            this.hexagons.push(next);
            currentHex.q = next.q, currentHex.r = next.r;
        }
    };
    /**
     * Returns a 3D model corresponding to this shape
     */
    BaseExtension.prototype._createBuildingMesh = function () {
        var _this = this;
        // Merge all cylinders
        var hexes = [];
        this.hexagons.forEach(function (hex) {
            var center = hex.getWorldCenter();
            var myhex = BABYLON.Mesh.CreateCylinder('', 0.5, 2, 2, 6, 1, _this.getScene());
            myhex.rotation.y = Math.PI / 2;
            myhex.position.copyFrom(center);
            myhex.position.y = 0.65;
            hexes.push(myhex);
        });
        return BABYLON.Mesh.MergeMeshes(hexes, true);
    };
    /**
     * Returns -1 if the given hex is not in the shape
     */
    BaseExtension.prototype._isInShape = function (hex) {
        for (var i = 0; i < this.hexagons.length; i++) {
            if (this.hexagons[i].equals(hex)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Returns true if two extensions are overlapping.
     * There is an overlap if at least one hexagon is overlapping wioth another one
     */
    BaseExtension.prototype.overlaps = function (other) {
        for (var _i = 0, _a = this.hexagons; _i < _a.length; _i++) {
            var hex = _a[_i];
            for (var _b = 0, _c = other.hexagons; _b < _c.length; _b++) {
                var otherHex = _c[_b];
                if (hex.overlaps(otherHex)) {
                    return true;
                }
            }
        }
        return false;
    };
    return BaseExtension;
}(Building));
var StarterExtension = (function (_super) {
    __extends(StarterExtension, _super);
    function StarterExtension(game) {
        _super.call(this, game);
    }
    StarterExtension.prototype._initCost = function () {
        this._resourcesNeeded[Resources.Wood] = 0;
        this._resourcesNeeded[Resources.Rock] = 0;
    };
    /**
     * The starter extension
     */
    StarterExtension.prototype._initBuilding = function (data) {
        var grid = Hexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, 3, true);
        // Use template
        for (var i = 0; i < StarterExtension.TEMPLATE.length - 1; i += 2) {
            this.hexagons.push(new Hexagon(StarterExtension.TEMPLATE[i], StarterExtension.TEMPLATE[i + 1], grid, this));
        }
        // No resources slots for template
    };
    // Q and R coordinates of a starter platform
    StarterExtension.TEMPLATE = [
        -1, 1,
        0, 0,
        1, 0,
        2, 0,
        0, 1,
        1, 1,
        2, 1
    ];
    return StarterExtension;
}(BaseExtension));
//# sourceMappingURL=BaseExtension.js.map