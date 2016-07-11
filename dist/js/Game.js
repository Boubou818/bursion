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
    Game.prototype.build = function () {
        if (!this._currentShape) {
            this._currentShape = new BaseExtension(this.scene);
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
    Game.prototype._initGame = function () {
        // Init costs
        var _this = this;
        // Init GUI 
        this._gui = new GUIManager(this);
        // Init resource map
        this.resources[Resources.Wood] = 0;
        this.resources[Resources.Rock] = 0;
        this.resources[Resources.Meat] = 0;
        var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;
        var green = new BABYLON.StandardMaterial('', this.scene);
        green.diffuseColor = BABYLON.Color3.Green();
        var red = new BABYLON.StandardMaterial('', this.scene);
        red.diffuseColor = BABYLON.Color3.Red();
        var grid = new HexagonGrid(15);
        grid.draw(this.scene);
        this.scene.pointerMovePredicate = function (mesh) {
            return mesh.name === 'ground';
        };
        this.base = new Base(this, grid);
        this.scene.onPointerMove = function (evt, pr) {
            if (_this._currentShape) {
                if (pr.hit) {
                    var overlaps = false;
                    // Update shape color
                    if (_this.base.canBuildHere(_this._currentShape)) {
                        _this._currentShape.material = green;
                    }
                    else {
                        _this._currentShape.material = red;
                    }
                    var p = pr.pickedPoint;
                    p.y = 0;
                    // get nearest hex
                    var nearest = grid.getNearestHex(p);
                    if (nearest) {
                        _this._currentShape.position.copyFrom(nearest.getWorldCenter());
                    }
                }
            }
        };
        this.scene.onPointerDown = function (evt, pr) {
            if (_this._currentShape) {
                if (_this.base.canBuildHere(_this._currentShape)) {
                    _this.base.addExtension(_this._currentShape);
                    _this._currentShape = null;
                }
            }
        };
        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        // let viewLink = (hex: Hexagon, neighbors) => {
        //     // center of the hexagon
        //     let b = BABYLON.Mesh.CreateBox('', 0.2, this.scene);
        //     b.position.copyFrom(hex.getWorldCenter());
        //     b.position.y = 0.75;
        //     for (let n in neighbors) {
        //         // get hex by name
        //         let hexn = this.base.getHexByName(n);
        //         let pos = hexn.getWorldCenter();
        //         pos.y = 0.75;
        //         BABYLON.Mesh.CreateLines('', [b.position.clone(), pos], this.scene);
        //     }
        // }
        // let viewGraph = (graph) => {
        //     for (let vertex in graph.vertices) {
        //         // get hex by name
        //         let hex = this.base.getHexByName(vertex);
        //         viewLink(hex, graph.vertices[vertex]);
        //     }
        // }
        // window.addEventListener('keydown', () => {
        //     viewGraph(this.base.graph);
        // });
        // END DEBUG
        var bobby = new Minion('bobby', this);
        this._hoard.push(bobby);
        // let bobby2 = new Minion('bobby2', this);
        // this._hoard.push(bobby2);      
    };
    return Game;
}());
//# sourceMappingURL=Game.js.map