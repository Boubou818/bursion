/**
 * The hexagonal map, whre the player will be able to build. Used to track mouse movement and snap the current shape on hexagons.
 * Each hexagon of the grid can contains a specific resource, and is a specific type : land, water, beach, deepawater...
 */
var HexagonMap = (function () {
    function HexagonMap(size) {
        // The Hexagon grid containing land, water and deepwater hexagons, indexed by hexagon name
        this._map = {};
        // The starting position on the map
        this._basePosition = null;
        // The starting position of the drakkar on the map
        this._drakkarPosition = null;
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
            this._map[hex.name] = hex;
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
        for (var name_1 in this._map) {
            var hex = this._map[name_1];
            if (hex) {
                var dist = BABYLON.Vector3.DistanceSquared(hex.center, p);
                if (dist < min) {
                    min = dist;
                    res = hex;
                }
            }
        }
        ;
        return res;
    };
    /**
     * Returns the hexagon present on the map corresponding to the given position
     */
    HexagonMap.prototype.getResourceHex = function (p) {
        for (var name_2 in this._map) {
            var hex = this._map[name_2];
            if (hex) {
                var dist = hex.distanceToPoint(p);
                if (dist < BABYLON.Epsilon) {
                    return hex;
                }
            }
        }
        return null;
    };
    /**
     * Returns the hexagon of the map corresponding to the given coordinates.
     * Returns null if not found
     */
    HexagonMap.prototype._getHexagonByHexCoordinates = function (q, r) {
        for (var name_3 in this._map) {
            var hex = this._map[name_3];
            if (hex) {
                if (hex.q == q && hex.r == r) {
                    return hex;
                }
            }
        }
        return null;
    };
    /**
     * Remove the given hex from the map
     */
    HexagonMap.prototype.removeMapHex = function (hexagon, disposeResource) {
        if (hexagon) {
            var mapHex = this._map[hexagon.name];
            if (mapHex) {
                mapHex.dispose(disposeResource);
                this._map[hexagon.name] = null;
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
    HexagonMap.prototype._randomInt = function (min, max) {
        var random = Math.random();
        return Math.floor(((random * (max - min)) + min));
    };
    HexagonMap.prototype._assignResourceModel = function (h, game) {
        var timer = new Timer(0, game.scene, { autostart: false, autodestroy: true });
        if (h.resourceSlot.resource === Resources.Wood) {
            timer.callback = function () {
                var wood = game.createInstanceAsset('trees');
                wood.setEnabled(true);
                wood.position.copyFrom(h.center);
                wood.rotation.y = Math.random() - 0.5;
                h.resourceSlot.model = wood;
            };
        }
        if (h.resourceSlot.resource === Resources.Rock) {
            timer.callback = function () {
                var rock = game.createInstanceAsset('rock');
                rock.setEnabled(true);
                rock.position.copyFrom(h.center);
                h.resourceSlot.model = rock;
            };
        }
        if (h.type === HexagonType.DeepWater) {
            timer.callback = function () {
                // Whale
                if (Math.random() < 0.005) {
                    var whale = game.createInstanceAsset('whale', '__whale__');
                    whale.position.copyFrom(h.center);
                    whale.scaling.scaleInPlace(2);
                }
            };
        }
        // if (h.resourceSlot.resource === Resources.Meat) {
        //     let boar = game.createInstanceAsset('boar');             
        //     boar.setEnabled(true);
        //     boar.position.copyFrom(h.center);
        //     boar.position.y = 0.75;
        //     boar.rotation.y = Math.random()-0.5;
        //     h.resourceSlot.model = boar;
        // }
        // if (h.resourceSlot.resource === Resources.Empty && h.type === HexagonType.Land) {
        //     let grass = game.createInstanceAsset('grass');               
        //     grass.setEnabled(true);
        //     grass.position.copyFrom(h.center);
        //     grass.position.y = 0.75;
        //     grass.scaling.scaleInPlace(this._random(0.7, 1));
        //     // grass.freezeWorldMatrix();
        //     h.resourceSlot.model = grass;
        // }   
        return timer;
    };
    /**
     * Draw the hexagon grid in the given scene.
     * Hexagons and resources are two different models.
     * @param game The game instance
     * @param callback The function called when the map is finished to be drawn (after all animations are finished)
     */
    HexagonMap.prototype.draw = function (game, callback) {
        var scene = game.scene;
        var delay = 0;
        // Hexa scheduler
        var schedulerResources = new Scheduler();
        schedulerResources.whenAllOver = function () {
            console.log("ALL OVER");
            callback();
        };
        // Ressources scheduler
        var schedulerHexa = new Scheduler();
        schedulerHexa.whenAllOver = function () {
            console.log("Building resources");
            schedulerResources.start();
        };
        var _loop_1 = function(name_4) {
            var h = this_1._map[name_4];
            timer = new Timer(delay, scene, { autostart: false, autodestroy: true });
            delay += 1.5;
            var hex = null;
            var ressourceTimer = null;
            switch (h.type) {
                case HexagonType.DeepWater:
                    hex = game.createInstanceAsset('hexa-water2', '__water2__');
                    break;
                case HexagonType.Water:
                    hex = game.createInstanceAsset('hexa-water1', '__water1__');
                    break;
                case HexagonType.Beach:
                    hex = game.createInstanceAsset('hexa-beach', '__beach__');
                    break;
                case HexagonType.Land:
                default:
                    hex = game.createInstanceAsset('hexa-empty', '__land__');
                    break;
            }
            hex.rotation.y += this_1._randomInt(-6, 6) * Math.PI / 3;
            hex.isVisible = true;
            // h.center.y = 10;
            hex.position.copyFrom(h.center);
            hex.position.y = 100;
            // Add the mesh instance to the meshes list
            h.model = hex;
            ease = new BABYLON.QuarticEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
            ressourceTimer = this_1._assignResourceModel(h, game);
            schedulerResources.add(ressourceTimer);
            timer.callback = function () {
                BABYLON.Animation.CreateAndStartAnimation('pos', hex, 'position.y', 60, 60, hex.position.y, h.center.y, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, ease);
            };
            schedulerHexa.add(timer);
        };
        var this_1 = this;
        var timer, ease;
        for (var name_4 in this._map) {
            _loop_1(name_4);
        }
        schedulerHexa.start();
    };
    return HexagonMap;
}());
//# sourceMappingURL=HexagonMap.js.map