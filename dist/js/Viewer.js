/// <reference path="babylon.d.ts"/>
/// <reference path="shapes/HexagonSet.ts"/>
/// <reference path="shapes/HexagonGrid.ts"/>
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
        this.scene.onPointerDown = function (evt, pr) {
            if (pr.hit && canBuildHere(s)) {
                console.log(s);
                shapes.push(s);
                s = new HexagonSet(_this.scene);
            }
        };
    };
    return Viewer;
}());
//# sourceMappingURL=Viewer.js.map