var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A building point is a node in a building.
 * It's used to check the distance between two building :
 * - overlapping
 * - neighbors
 */
var BuildingPoint = (function () {
    function BuildingPoint(center, building) {
        this._center = center;
        this._building = building;
    }
    Object.defineProperty(BuildingPoint.prototype, "center", {
        /**
         * Returns the center of this hexagon in world coordinates (relative to the building);
         */
        get: function () {
            if (this._building) {
                return this._center.add(this._building.position);
            }
            else {
                return this._center.clone();
            }
        },
        enumerable: true,
        configurable: true
    });
    BuildingPoint.prototype.equals = function (other) {
        return this.center.subtract(other.center).length() < BABYLON.Epsilon;
    };
    /**
     * Returns true if the two points are neighbors : their distance is lower than the distance bewteen two neighbors
     */
    BuildingPoint.AreNeighbors = function (bp1, bp2) {
        return BABYLON.Vector3.Distance(bp1.center, bp2.center) < BuildingPoint.DISTANCE_BETWEEN_TWO_NEIGHBORS;
    };
    // The distance between two neighbors
    BuildingPoint.DISTANCE_BETWEEN_TWO_NEIGHBORS = 1.75;
    return BuildingPoint;
}());
/**
 * A building is something that can be built on the map (only on land).
 * Every building is composed of a set of hexagon + 1 hexagon that will contain the 3D
 * model (depending on the building)
 * Two building cannot overlap.
 *
 */
var Building = (function (_super) {
    __extends(Building, _super);
    function Building(game) {
        _super.call(this, '_building_', game.scene);
        // The ressources needed to build this building. Each subclass will define this amount in the constructor
        this._resourcesNeeded = [];
        // The list of points composing this building
        this._points = [];
        // Set to true when a minion is taking care of this building
        this.waitingToBeBuilt = false;
        this._game = game;
        // Init the cost of this building
        this._initCost();
    }
    /**
     * Create the shape of the building: a set of 5 hexagons, setup randomly.
     */
    Building.prototype._initBuilding = function () {
        var _this = this;
        // Get a grid of hexgons composed of 3 rings (enough for 5 hexagons)
        var grid = MapHexagon.getDefaultGrid();
        var coordinates = grid.hexagon(0, 0, 3, true);
        var size = 5; //Math.floor(((Math.random() * (6 - 3)) + 3)); // random [3;6[
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
        // Returns true if the building point is already in the building
        var isInBuilding = function (bp) {
            for (var _i = 0, _a = _this._points; _i < _a.length; _i++) {
                var p = _a[_i];
                if (p.equals(bp)) {
                    return true;
                }
            }
            return false;
        };
        // returns a random neighbor of the given hex
        var getNext = function (q, r) {
            var neighbors = grid.neighbors(q, r);
            shuffle(neighbors);
            for (var i = 0; i < neighbors.length; i++) {
                var center_1 = grid.getCenterXY(neighbors[i].q, neighbors[i].r);
                var bp = new BuildingPoint(new BABYLON.Vector3(center_1.x, 0, center_1.y), _this);
                if (!isInBuilding(bp)) {
                    return {
                        point: bp,
                        q: neighbors[i].q,
                        r: neighbors[i].r
                    };
                }
            }
            return null;
        };
        // Start a random shape with the center of the grid and iterate over neighbors
        var currentHex = coordinates[0];
        var center = grid.getCenterXY(currentHex.q, currentHex.r);
        var first = new BuildingPoint(new BABYLON.Vector3(center.x, 0, center.y), this);
        this._points.push(first);
        for (var i = 0; i < size; i++) {
            var next = getNext(currentHex.q, currentHex.r);
            if (!next)
                break;
            this._points.push(next.point);
            currentHex.q = next.q, currentHex.r = next.r;
        }
    };
    Object.defineProperty(Building.prototype, "material", {
        get: function () {
            return this._child.material;
        },
        /**
         * Propagate the material of this node to the child mesh.
         */
        set: function (value) {
            if (this._child) {
                this._child.material = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Building.prototype, "workingSite", {
        get: function () {
            return this._workingSite;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Building.prototype, "points", {
        get: function () {
            return this._points;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns true if the building can be built (ressources are sufficient)
     */
    Building.prototype.canBuild = function () {
        // Browser resources needed and check if the game has enough
        var canBuild = true;
        for (var r in this._resourcesNeeded) {
            canBuild = canBuild && this._game.resources[r] >= this._resourcesNeeded[r];
        }
        return canBuild;
    };
    /**
     * Create the shape of the building.
     */
    Building.prototype._createBuildingMesh = function () {
        // Merge all cylinders
        var hexes = [];
        for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
            var p = _a[_i];
            var center = p.center;
            var myhex = BABYLON.Mesh.CreateCylinder('', 0.5, 2, 2, 6, 1, this.getScene());
            myhex.rotation.y = Math.PI / 2;
            myhex.position.copyFrom(center);
            myhex.position.y = 0.65;
            hexes.push(myhex);
        }
        // Add the building and merge it with hexagons
        hexes.push(this._getBuildingModel());
        return BABYLON.Mesh.MergeMeshes(hexes, true);
    };
    /**
     * Returns true if this building overlap with the one given as a parameter
     */
    Building.prototype.overlaps = function (building) {
        for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
            var p = _a[_i];
            for (var _b = 0, _c = building.points; _b < _c.length; _b++) {
                var otherP = _c[_b];
                if (p.overlaps(otherP)) {
                    console.log("overlap");
                    return true;
                }
            }
        }
        return false;
    };
    /**
     * Create the child mesh corresponding to the building,
     * and attach it to this node. In mode prebuild, the building is attached to
     * the mouse.
     */
    Building.prototype.preBuild = function () {
        // Init building
        this._initBuilding();
        // Create it      
        this._child = this._createBuildingMesh();
        this._child.parent = this;
        // Set prebuild material
        this._setPrebuildMaterial();
    };
    /**
     * The building is now attached to the player base and is ready to be built
     * by minions.
     * @param hexagons The list of hexagons the building will be built on
     * @param workingSite The hexagon where the minion should come to build this building
     */
    Building.prototype.prepareToBuildOn = function (workingSite) {
        // Set the working site
        this._workingSite = workingSite;
        // Set 'waiting for build' material
        this._setWaitingForMinionMaterial();
        // Waiting for a minion to build this building
        this.waitingToBeBuilt = true;
    };
    /**
     * Method called when the building is finished to built on the player base
     */
    Building.prototype.finishBuild = function (base) {
        // No more waiting
        this.waitingToBeBuilt = false;
        // Set 'waiting for build' material
        this._setFinishedMaterial();
        // Notify the base this building is finished
        base.buildingFinished(this);
    };
    return Building;
}(BABYLON.Mesh));
//# sourceMappingURL=Building.js.map