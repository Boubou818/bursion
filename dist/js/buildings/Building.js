var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A shape is a set of 3/4/5 hexagons.
 * Hexagon coordinates are relative to the shape.
 * The center of the shape is the first hexagon at (0,0).
 */
var Building = (function (_super) {
    __extends(Building, _super);
    function Building(scene, template) {
        _super.call(this, '_shape_', scene);
        // The set of hexagons. These hexagons does not contains any resources
        this.hexagons = [];
        this._initShape(template);
    }
    /**
     * Create the shape, which has a random size between 3 and 5 hexs.
     */
    Building.prototype._initShape = function (template) {
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
        // If a template is given in parameter, use template
        if (template) {
            for (var i = 0; i < template.length - 1; i += 2) {
                this.hexagons.push(new Hexagon(template[i], template[i + 1], grid, this));
            }
        }
        else {
            // Else start a random shape
            // Start with the center of the grid and iterate over neighbors
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
        }
        // Create 3D model        
        this._child = this._createModel();
        this._child.parent = this;
    };
    /**
     * Returns a 3D model corresponding to this shape
     */
    Building.prototype._createModel = function () {
        var _this = this;
        // Merge all cylinders
        var hexes = [];
        this.hexagons.forEach(function (hex) {
            var center = hex.getWorldCenter();
            var myhex = BABYLON.Mesh.CreateCylinder('', 1, 2, 2, 6, 1, _this.getScene());
            myhex.rotation.y = Math.PI / 2;
            myhex.position.copyFrom(center);
            hexes.push(myhex);
        });
        return BABYLON.Mesh.MergeMeshes(hexes, true);
    };
    /**
     * Returns -1 if the given hex is not in the shape
     */
    Building.prototype._isInShape = function (hex) {
        for (var i = 0; i < this.hexagons.length; i++) {
            if (this.hexagons[i].equals(hex)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Returns true if two buildings are overlapping.
     * There is an overlap if at least one hexagon is overlapping wioth another one
     */
    Building.prototype.overlaps = function (other) {
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
    Object.defineProperty(Building.prototype, "material", {
        set: function (value) {
            this._child.material = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Setup this building on the map, and retrieve the list of hexagon present on the map.
     */
    Building.prototype.getResourcesOnMap = function (map) {
        var resourcesHex = [];
        // For each hexagon, get the corresponding resource 
        for (var _i = 0, _a = this.hexagons; _i < _a.length; _i++) {
            var hex = _a[_i];
            resourcesHex.push(map.getResourceHex(hex));
        }
        return resourcesHex;
    };
    // Q and R coordinates of a starter platform
    Building.STARTER_TEMPLATE = [
        0, 0,
        1, 0,
        2, 0,
        3, 0,
        0, 1,
        1, 1,
        2, 1,
        3, 1];
    return Building;
}(BABYLON.Mesh));
//# sourceMappingURL=Building.js.map