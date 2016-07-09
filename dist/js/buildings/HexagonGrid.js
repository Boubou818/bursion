/**
 * The hexagonal grid, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource
 */
var HexagonGrid = (function () {
    function HexagonGrid(size) {
        // The Hexagon grid
        this._grid = [];
        var grid = Hexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, size, true);
        for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
            var c = coordinates_1[_i];
            var hex = new Hexagon(c.q, c.r, grid);
            var randomInt = Math.floor(Math.random() * 2); // random int between 0 and 1, two resources : wood and rock
            var randomProba = Math.random();
            switch (randomInt) {
                case 0:
                    if (randomProba < Resources.getProbability(Resources.Wood)) {
                        hex.resourceSlot.resource = Resources.Wood;
                    } //else it's empty by default
                    break;
                case 1:
                    if (randomProba < Resources.getProbability(Resources.Rock)) {
                        hex.resourceSlot.resource = Resources.Rock;
                    } //else it's empty by default
                default:
                    break;
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
            var dist = BABYLON.Vector3.DistanceSquared(hex.getWorldCenter(), p);
            if (dist < min) {
                min = dist;
                res = hex;
            }
        });
        return res;
    };
    /**
     * Returns the hexagon present on the map corresponding to the given position
     */
    HexagonGrid.prototype.getResourceHex = function (hexagon) {
        for (var _i = 0, _a = this._grid; _i < _a.length; _i++) {
            var hex = _a[_i];
            var dist = Hexagon.distanceSquared(hexagon, hex);
            if (dist < BABYLON.Epsilon) {
                return hex;
            }
        }
        return null;
    };
    /**
     * Draw the hexagon grid in the given scene
     */
    HexagonGrid.prototype.draw = function (scene) {
        var ref = BABYLON.Mesh.CreateCylinder('', 0.1, 1.9, 1.9, 6, 1, scene);
        ref.rotation.y = Math.PI / 2;
        ref.isVisible = false;
        // Wood
        var woodRef = BABYLON.Mesh.CreateCylinder('_wood_', 2, 0.3, 0.3, 6, 1, scene);
        woodRef.isVisible = false;
        var woodMaterial = new BABYLON.StandardMaterial('', scene);
        woodMaterial.diffuseColor = BABYLON.Color3.FromInts(120, 216, 17);
        woodRef.material = woodMaterial;
        // Rock
        var rockRef = BABYLON.Mesh.CreateCylinder('_rock_', 2, 0.3, 0.3, 6, 1, scene);
        rockRef.isVisible = false;
        var rockMaterial = new BABYLON.StandardMaterial('', scene);
        rockMaterial.diffuseColor = BABYLON.Color3.FromInts(170, 170, 170);
        rockRef.material = rockMaterial;
        for (var _i = 0, _a = this._grid; _i < _a.length; _i++) {
            var h = _a[_i];
            var hex = ref.createInstance('' + h.q + ' ' + h.r);
            hex.isVisible = true;
            hex.position.copyFrom(h.getWorldCenter());
            // Resource
            if (h.resourceSlot.resource === Resources.Wood) {
                var wood = woodRef.createInstance('wood');
                wood.isVisible = true;
                wood.position.copyFrom(h.getWorldCenter());
            }
            if (h.resourceSlot.resource === Resources.Rock) {
                var rock = rockRef.createInstance('rock');
                rock.isVisible = true;
                rock.position.copyFrom(h.getWorldCenter());
            }
        }
        ;
    };
    return HexagonGrid;
}());
//# sourceMappingURL=HexagonGrid.js.map