/// <reference path="babylon.d.ts"/>
/// <reference path="shapes/HexagonSet.ts"/>
/// <reference path="shapes/HexagonGrid.ts"/>
/// <reference path="Base.ts" />
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
        this.scene.debugLayer.show();
    };
    Viewer.prototype._initGame = function () {
        var _this = this;
        var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;
        var s = new HexagonSet(this.scene);
        var green = new BABYLON.StandardMaterial('', this.scene);
        green.diffuseColor = BABYLON.Color3.Green();
        var red = new BABYLON.StandardMaterial('', this.scene);
        red.diffuseColor = BABYLON.Color3.Red();
        var grid = new HexagonGrid(10);
        this.scene.pointerMovePredicate = function (mesh) {
            return mesh.name === 'ground';
        };
        // grid.draw(this.scene);
        var shapes = [];
        this.scene.onPointerMove = function (evt, pr) {
            if (pr.hit) {
                var overlaps = false;
                // Update shape color
                if (canBuildHere(s)) {
                    s.material = green;
                }
                else {
                    s.material = red;
                }
                var p = pr.pickedPoint;
                p.y = 0;
                // get nearest hex
                var nearest = grid.getNearestHex(p);
                if (nearest) {
                    s.position.copyFrom(nearest.center);
                }
            }
        };
        /**
         * Retursn true if the given shape can be built here
         */
        var canBuildHere = function (shape) {
            for (var _i = 0, shapes_1 = shapes; _i < shapes_1.length; _i++) {
                var s_1 = shapes_1[_i];
                if (shape.overlaps(s_1)) {
                    return false;
                }
            }
            return true;
        };
        var base = new Base();
        this.scene.onPointerDown = function (evt, pr) {
            if (canBuildHere(s)) {
                shapes.push(s);
                base.addBuilding(s);
                s = new HexagonSet(_this.scene);
            }
        };
        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        var viewLink = function (hex, neighbors) {
            // center of the hexagon
            var b = BABYLON.Mesh.CreateBox('', 0.2, _this.scene);
            b.position.copyFrom(hex.getWorldCenter());
            b.position.y = 0.75;
            console.log(neighbors);
            for (var n in neighbors) {
                // get hex by name
                var hexn = base.getHexByName(n);
                var pos = hexn.getWorldCenter();
                pos.y = 0.75;
                BABYLON.Mesh.CreateLines('', [b.position.clone(), pos], _this.scene);
            }
        };
        var viewGraph = function (graph) {
            for (var vertex in graph.vertices) {
                // get hex by name
                var hex = base.getHexByName(vertex);
                viewLink(hex, graph.vertices[vertex]);
            }
        };
        window.addEventListener('keydown', function () {
            viewGraph(base.graph);
        });
        // END DEBUG
    };
    return Viewer;
}());
//# sourceMappingURL=Viewer.js.map