/// <reference path="Hexagon.ts" />
/// <reference path="../babylon.d.ts" />
/// <reference path="../resources/Wood.ts" />
/// <reference path="../resources/Empty.ts" />
/// <reference path="../resources/Rock.ts" />
/**
 * The hexagonal grid, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource
 */
var HexagonGrid = (function () {
    function HexagonGrid(size) {
        // The Hexagon grid
        this._grid = [];
        this._resources = [];
        var grid = Hexagon.getDefaultGrid();
        this._resources = [new Wood(), new Empty(), new Rock()];
        var coordinates = grid.hexagon(0, 0, size, true);
        for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
            var c = coordinates_1[_i];
            var hex = new Hexagon(c.q, c.r, grid);
            var randomInt = Math.floor(Math.random() * this._resources.length); // random int between 0 and 1
            var randomProba = Math.random();
            if (randomProba < this._resources[randomInt].probability) {
                hex.resource = this._resources[randomInt];
            }
            this._grid.push(hex);
        }
    }
    /**
     * Returns the hexagon the nearest of the given position. Used to snap a building on the nearest hex.
     */
    HexagonGrid.prototype.getNearestHex = function (p) {
        var min = 99999, res = null;
        this._grid.forEach(function (hex) {
            var dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
            if (dist < min) {
                min = dist;
                res = hex;
            }
        });
        return res;
    };
    /**
     * Draw the hexagon grid in the given scene
     */
    HexagonGrid.prototype.draw = function (scene) {
        var ref = BABYLON.Mesh.CreateCylinder('', 0.1, 1.9, 1.9, 6, 1, scene);
        ref.rotation.y = Math.PI / 2;
        ref.isVisible = false;
        // Wood
        var woodRef = BABYLON.Mesh.CreateCylinder('_wood_', 1, 0.3, 0.3, 6, 1, scene);
        woodRef.isVisible = false;
        var woodMaterial = new BABYLON.StandardMaterial('', scene);
        woodMaterial.diffuseColor = BABYLON.Color3.FromInts(120, 216, 17);
        woodRef.material = woodMaterial;
        // Rock
        var rockRef = BABYLON.Mesh.CreateBox('_rock_', 0.4, scene);
        rockRef.isVisible = false;
        var rockMaterial = new BABYLON.StandardMaterial('', scene);
        rockMaterial.diffuseColor = BABYLON.Color3.FromInts(170, 170, 170);
        rockRef.material = rockMaterial;
        for (var _i = 0, _a = this._grid; _i < _a.length; _i++) {
            var h = _a[_i];
            var hex = ref.createInstance('' + h.q + ' ' + h.r);
            hex.isVisible = true;
            hex.position.copyFrom(h.center);
            // Resource
            if (h.resource) {
                if (h.resource instanceof Wood) {
                    var wood = woodRef.createInstance('wood');
                    wood.isVisible = true;
                    wood.position.copyFrom(h.center);
                }
                if (h.resource instanceof Rock) {
                    var rock = rockRef.createInstance('rock');
                    rock.isVisible = true;
                    rock.position.copyFrom(h.center);
                }
            }
        }
        ;
    };
    return HexagonGrid;
}());
//# sourceMappingURL=HexagonGrid.js.map