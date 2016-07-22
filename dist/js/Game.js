var Game = (function () {
    function Game(canvasId) {
        var _this = this;
        this._hoard = [];
        // The resource map of the player (links resources - amount)
        this.resources = [];
        var canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.assets = [];
        this.scene = null;
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.initScene();
        this.run();
    }
    Game.prototype.initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        var camera = new BABYLON.ArcRotateCamera('', -1.5, 1, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        var light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 1;
    };
    Game.prototype.run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        });
        // Load first level
        this._initGame();
        this._gui.initHUD();
        this.scene.debugLayer.show();
    };
    /**
     * Build a new shape
     */
    Game.prototype.createNewExtension = function () {
        if (!this._currentShape) {
            this._currentShape = new BaseExtension(this, this.base);
            if (this._currentShape.canBuild()) {
                this._currentShape.preBuild();
            }
            else {
                console.warn('Cannot build a new base extension !');
                this._currentShape.dispose();
                this._currentShape = null;
            }
        }
    };
    /**
     * Order to all minions to gather wood
     */
    Game.prototype.gatherWood = function () {
        for (var _i = 0, _a = this._hoard; _i < _a.length; _i++) {
            var m = _a[_i];
            m.setStrategy(new ResourceStrategy(m, Resources.Wood));
        }
    };
    /**
     * Order to all minions to gather wood
     */
    Game.prototype.gatherRock = function () {
        for (var _i = 0, _a = this._hoard; _i < _a.length; _i++) {
            var m = _a[_i];
            m.setStrategy(new ResourceStrategy(m, Resources.Rock));
        }
    };
    /**
     * Order to all minions to build the nearest building
     */
    Game.prototype.build = function () {
        for (var _i = 0, _a = this._hoard; _i < _a.length; _i++) {
            var m = _a[_i];
            m.setStrategy(new BuildStrategy(m));
        }
    };
    /**
     * Add the given amount of material of the given resource.
     * Generates a gui element
     */
    Game.prototype.addResources = function (node, amount, type) {
        // Increment resources
        this.resources[type] += amount;
        // Display sprite
        this._gui.displayResourceCounter(node);
        // Update text value
        this._gui.updateResourceText(this.resources[type], type);
    };
    /**
     * Wake up all builders. Called when a new building is created
     */
    Game.prototype.wakeUpBuilders = function () {
        for (var _i = 0, _a = this._hoard; _i < _a.length; _i++) {
            var m = _a[_i];
            if (m.strategy && m.strategy instanceof BuildStrategy && m.strategy.isIdle()) {
                m.setStrategy(new BuildStrategy(m));
            }
        }
    };
    Game.prototype._initGame = function () {
        var _this = this;
        // Init GUI 
        this._gui = new GUIManager(this);
        // Init resource map
        this.resources[Resources.Wood] = 100;
        this.resources[Resources.Rock] = 100;
        this.resources[Resources.Meat] = 100;
        var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;
        var grid = new HexagonMap(15);
        this.scene.pointerMovePredicate = function (mesh) {
            return mesh.name === 'ground';
        };
        this.base = new Base(this, grid);
        this.scene.onPointerMove = function (evt, pr) {
            if (_this._currentShape) {
                if (pr.hit) {
                    var overlaps = false;
                    // Update shape color
                    var mat = _this._currentShape.material;
                    if (_this.base.canBuildHere(_this._currentShape)) {
                        mat.diffuseColor = BABYLON.Color3.Green();
                    }
                    else {
                        mat.diffuseColor = BABYLON.Color3.Red();
                    }
                    var p = pr.pickedPoint;
                    p.y = 0;
                    // get nearest hex
                    var nearest = grid.getNearestHex(p);
                    if (nearest) {
                        _this._currentShape.position.copyFrom(nearest.center);
                    }
                }
            }
        };
        this.scene.onPointerDown = function (evt, pr) {
            if (_this._currentShape) {
                if (_this.base.canBuildHere(_this._currentShape)) {
                    _this.base.addBuilding(_this._currentShape);
                    _this._currentShape = null;
                }
            }
        };
        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        var viewLink = function (hex, neighbors) {
            // center of the hexagon
            var b = BABYLON.Mesh.CreateBox('', 0.2, _this.scene);
            b.position.copyFrom(hex.center);
            b.position.y = 1.5;
            for (var n in neighbors) {
                // get hex by name
                var hexn = _this.base.getHexByName(n);
                var pos = hexn.center;
                pos.y = 1.5;
                BABYLON.Mesh.CreateLines('', [b.position.clone(), pos], _this.scene);
            }
        };
        var viewGraph = function (graph) {
            for (var vertex in graph.vertices) {
                // get hex by name
                var hex = _this.base.getHexByName(vertex);
                viewLink(hex, graph.vertices[vertex]);
            }
        };
        window.addEventListener('keydown', function () {
            viewGraph(_this.base.graph);
        });
        // END DEBUG
        var bobby = new Minion('bobby', this);
        this._hoard.push(bobby);
        // let bobby2 = new Minion('bobby2', this);
        // this._hoard.push(bobby2);  
        grid.draw(this.scene);
    };
    return Game;
}());
//# sourceMappingURL=Game.js.map