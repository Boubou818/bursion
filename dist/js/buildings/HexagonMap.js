/**
 * The hexagonal map, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource, and is a specific type : land, water, beach, deepawater...
 */
var HexagonMap = (function () {
    function HexagonMap(size) {
        // The Hexagon grid containing land, water and deepwater hexagons
        this._map = [];
        // The starting position on the map
        this._basePosition = null;
        // The starting position of the drakkar on the map
        this._drakkarPosition = null;
        // The list of all hexagons meshes on the map, indexed by hexagon name
        this._meshes = {};
        this._size = size;
        var grid = MapHexagon.getDefaultGrid();
        var mapCoords = grid.hexagon(0, 0, size + 10, true);
        // Build the land part of the map
        for (var _i = 0, mapCoords_1 = mapCoords; _i < mapCoords_1.length; _i++) {
            var c = mapCoords_1[_i];
            var hex = new MapHexagon(c.q, c.r, grid);
            var axialDistance = Grid.axialDistance(c.q, c.r, 0, 0);
            if (axialDistance <= this._size) {
                hex.type = HexagonType.Land;
            }
            else if (axialDistance <= this._size + 1) {
                hex.type = HexagonType.Beach;
            }
            else if (axialDistance <= this._size + 3) {
                hex.type = HexagonType.Water;
            }
            else if (axialDistance <= this._size + 4) {
                if (Math.random() < 0.45) {
                    hex.type = HexagonType.Water;
                }
                else {
                    hex.type = HexagonType.DeepWater;
                }
            }
            else {
                hex.type = HexagonType.DeepWater;
            }
            // Generate resources on land only
            if (hex.type === HexagonType.Land) {
                var randomInt = Math.floor(Math.random() * 3); // random int between 0 and 2, two resources : wood, meat and rock
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
                    case 2:
                        if (randomProba < Resources.getProbability(Resources.Meat)) {
                            hex.resourceSlot.resource = Resources.Meat;
                        } //else it's empty by default
                    default:
                        break;
                }
            }
            this._map.push(hex);
        }
        // get starters position
        // Base position
        var starterQ = -Math.floor(this._size / 2), starterR = this._size - 1;
        this._basePosition = this._getHexagonByHexCoordinates(starterQ, starterR);
        // Drakkar position
        starterQ = -Math.floor(this._size / 2) + 1;
        starterR = this._size + 1;
        this._drakkarPosition = this._getHexagonByHexCoordinates(starterQ, starterR);
    }
    Object.defineProperty(HexagonMap.prototype, "size", {
        /**
         * Get map size - read only attribute
         */
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HexagonMap.prototype, "basePosition", {
        /**
         * Returns the very first position of the base (near the beach, on the land)
         */
        get: function () {
            return this._basePosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HexagonMap.prototype, "drakkarPosition", {
        /**
         * Returns the drakkar position (in water, near the starting base)
         */
        get: function () {
            return this._drakkarPosition;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the hexagon the nearest of the given position. Used to snap a building on the nearest hex.
     */
    HexagonMap.prototype.getNearestHex = function (p) {
        var min = 99999, res = null;
        this._map.forEach(function (hex) {
            var dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
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
    HexagonMap.prototype.getResourceHex = function (p) {
        for (var _i = 0, _a = this._map; _i < _a.length; _i++) {
            var hex = _a[_i];
            var dist = hex.distanceToPoint(p);
            if (dist < BABYLON.Epsilon) {
                return hex;
            }
        }
        return null;
    };
    /**
     * Returns the hexagon of the map corresponding to the given coordinates.
     * Returns null if not found
     */
    HexagonMap.prototype._getHexagonByHexCoordinates = function (q, r) {
        for (var _i = 0, _a = this._map; _i < _a.length; _i++) {
            var hex = _a[_i];
            if (hex.q == q && hex.r == r) {
                return hex;
            }
        }
        return null;
    };
    /**
     * Remove the given hex from the map
     */
    HexagonMap.prototype.removeMapHex = function (hexagon) {
        if (hexagon) {
            var mapHex = this._meshes[hexagon.name];
            if (mapHex) {
                mapHex.dispose();
                this._meshes[hexagon.name] = null;
            }
        }
    };
    /**
     * Returns true if the extension can be build.
     * The extension can only be built on land.
     */
    HexagonMap.prototype.canBuild = function (building) {
        var canBuild = true;
        for (var _i = 0, _a = building.points; _i < _a.length; _i++) {
            var h = _a[_i];
            var mapHex = this.getResourceHex(h);
            canBuild = canBuild && (mapHex.type === HexagonType.Land);
        }
        return canBuild;
    };
    HexagonMap.prototype._random = function (min, max) {
        var random = Math.random();
        return ((random * (max - min)) + min);
    };
    /**
     * Draw the hexagon grid in the given scene.
     * Hexagons and resources are two different models.
     */
    HexagonMap.prototype.draw = function (game) {
        var scene = game.scene;
        // land
        var land = BABYLON.Mesh.CreateCylinder('', 1.5, 1.9, 1.9, 6, 1, scene);
        land.rotation.y = Math.PI / 2;
        land.isVisible = false;
        land.convertToUnIndexedMesh();
        var landMaterial = new BABYLON.StandardMaterial('grass', scene);
        landMaterial.diffuseColor = BABYLON.Color3.FromInts(161, 176, 51);
        landMaterial.specularColor = BABYLON.Color3.Black();
        land.material = landMaterial;
        // beach
        var beachRef = BABYLON.Mesh.CreateCylinder('', 1, 1.95, 1.95, 6, 1, scene);
        beachRef.rotation.y = Math.PI / 2;
        beachRef.isVisible = false;
        beachRef.convertToUnIndexedMesh();
        var beachMaterial = new BABYLON.StandardMaterial('beach', scene);
        beachMaterial.diffuseColor = BABYLON.Color3.FromInts(255, 232, 204);
        beachMaterial.specularColor = BABYLON.Color3.Black();
        beachRef.material = beachMaterial;
        // water1
        var water1Ref = BABYLON.Mesh.CreateCylinder('', 0.8, 1.95, 1.95, 6, 1, scene);
        water1Ref.rotation.y = Math.PI / 2;
        water1Ref.isVisible = false;
        water1Ref.convertToUnIndexedMesh();
        var water1Material = new BABYLON.StandardMaterial('grass', scene);
        water1Material.diffuseColor = BABYLON.Color3.FromInts(77, 119, 99);
        water1Material.specularColor = BABYLON.Color3.Black();
        water1Ref.material = water1Material;
        // water2 - deeper  
        var water2Ref = BABYLON.Mesh.CreateCylinder('', 0.6, 1.97, 1.97, 6, 1, scene);
        water2Ref.rotation.y = Math.PI / 2;
        water2Ref.isVisible = false;
        water2Ref.convertToUnIndexedMesh();
        var water2Material = new BABYLON.StandardMaterial('grass', scene);
        water2Material.diffuseColor = BABYLON.Color3.FromInts(38, 62, 66);
        water2Material.specularColor = BABYLON.Color3.Black();
        water2Ref.material = water2Material;
        for (var _i = 0, _a = this._map; _i < _a.length; _i++) {
            var h = _a[_i];
            var hex = null;
            switch (h.type) {
                case HexagonType.DeepWater:
                    hex = water2Ref.createInstance('' + h.q + ' ' + h.r);
                    break;
                case HexagonType.Water:
                    hex = water1Ref.createInstance('' + h.q + ' ' + h.r);
                    break;
                case HexagonType.Beach:
                    hex = beachRef.createInstance('' + h.q + ' ' + h.r);
                    break;
                case HexagonType.Land:
                default:
                    hex = land.createInstance('' + h.q + ' ' + h.r);
                    break;
            }
            hex.isVisible = true;
            hex.position.copyFrom(h.center);
            hex.freezeWorldMatrix();
            // Add the mesh instance to the meshes list
            this._meshes[h.name] = hex;
            if (h.resourceSlot.resource === Resources.Wood) {
                var wood = void 0;
                // if (Math.random() > 0.5) {
                wood = game.assets['tree2'].clone();
                // } else {                    
                //     wood = game.assets['tree2'].clone();
                // }
                wood.setEnabled(true);
                wood.position.copyFrom(h.center);
                wood.position.y = 0.75;
                wood.rotation.y = Math.random() - 0.5;
                wood.scaling.scaleInPlace(this._random(0.3, 0.8));
                h.resourceSlot.model = wood;
            }
            if (h.resourceSlot.resource === Resources.Rock) {
                var rock = game.assets['rock'].clone(); //Resources.getModelForResource(game, h.resourceSlot.resource);
                // let wood = basemesh.clone('_resource_');                
                rock.setEnabled(true);
                rock.position.copyFrom(h.center);
                rock.position.y = 0.75;
                // wood.rotation.y = Math.random()-0.5;
                // rock.scaling.scaleInPlace(this._random(0.3,0.8));
                h.resourceSlot.model = rock;
            }
            if (h.resourceSlot.resource === Resources.Meat) {
                var boar = game.assets['boar'].clone(); //Resources.getModelForResource(game, h.resourceSlot.resource);
                // let wood = basemesh.clone('_resource_');                
                boar.setEnabled(true);
                boar.position.copyFrom(h.center);
                boar.position.y = 0.75;
                boar.rotation.y = Math.random() - 0.5;
                // boar.scaling.scaleInPlace(10);
                h.resourceSlot.model = boar;
            }
        }
    };
    return HexagonMap;
}());
//# sourceMappingURL=HexagonMap.js.map