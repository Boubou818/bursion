/// <reference path="babylon.d.ts"/>
/// <reference path="buildings/Building.ts"/>
/// <reference path="buildings/HexagonGrid.ts"/>
/// <reference path="Base.ts" />
/// <reference path="minions/Minion.ts" />
var Viewer = (function () {
    function Viewer(canvasId) {
        var _this = this;
        var canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.assets = [];
        this.scene = null;
        // On resize le jeu en fonction de la taille de la fenetre
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this.initScene();
        this.run();
    }
    Viewer.prototype.initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        var camera = new BABYLON.ArcRotateCamera('', -1.5, 1, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        var light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 1;
    };
    Viewer.prototype.run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        });
        // Load first level
        this._initGame();
        this._initGui();
        this.scene.debugLayer.show();
    };
    Viewer.prototype._initGui = function () {
        var _this = this;
        var gui = new BABYLON.ScreenSpaceCanvas2D(this.scene, { id: "ScreenCanvas" });
        var buttonBuild = new BABYLON.Rectangle2D({ parent: gui, id: "button", x: 60, y: 100, width: 100, height: 40,
            fill: "#40C040FF",
            children: [
                new BABYLON.Text2D("Build", { marginAlignment: "h: center, v: center" })
            ]
        });
        buttonBuild.pointerEventObservable.add(function () {
            if (!_this._currentShape) {
                _this._currentShape = new Building(_this.scene);
            }
        }, BABYLON.PrimitivePointerInfo.PointerUp);
    };
    Viewer.prototype._initGame = function () {
        var _this = this;
        var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;
        var green = new BABYLON.StandardMaterial('', this.scene);
        green.diffuseColor = BABYLON.Color3.Green();
        var red = new BABYLON.StandardMaterial('', this.scene);
        red.diffuseColor = BABYLON.Color3.Red();
        var grid = new HexagonGrid(20);
        grid.draw(this.scene);
        this.scene.pointerMovePredicate = function (mesh) {
            return mesh.name === 'ground';
        };
        var base = new Base(this.scene);
        this.scene.onPointerMove = function (evt, pr) {
            if (_this._currentShape) {
                if (pr.hit) {
                    var overlaps = false;
                    // Update shape color
                    if (base.canBuildHere(_this._currentShape)) {
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
                        _this._currentShape.position.copyFrom(nearest.center);
                    }
                }
            }
        };
        this.scene.onPointerDown = function (evt, pr) {
            if (_this._currentShape) {
                if (base.canBuildHere(_this._currentShape)) {
                    base.addBuilding(_this._currentShape);
                    _this._currentShape = null;
                }
            }
        };
        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        // let viewLink = (hex:Hexagon, neighbors) => {
        //     // center of the hexagon
        //     let b = BABYLON.Mesh.CreateBox('', 0.2, this.scene);
        //     b.position.copyFrom(hex.getWorldCenter());
        //     b.position.y = 0.75;
        //     for(let n in neighbors) {
        //         // get hex by name
        //         let hexn = base.getHexByName(n);
        //         let pos = hexn.getWorldCenter();
        //         pos.y = 0.75;
        //         BABYLON.Mesh.CreateLines('', [b.position.clone(),pos], this.scene);
        //     }
        // }
        // let viewGraph = (graph) => {
        //     for(let vertex in graph.vertices) {
        //         // get hex by name
        //         let hex = base.getHexByName(vertex);
        //         viewLink(hex, graph.vertices[vertex]);
        //     }
        // }
        // window.addEventListener('keydown', () => {            
        //     viewGraph(base.graph);
        // });
        // END DEBUG
        var bobby = new Minion('bobby', base, this.scene);
    };
    return Viewer;
}());
//# sourceMappingURL=Viewer.js.map