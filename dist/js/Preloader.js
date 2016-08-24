var Preloader = (function () {
    function Preloader(game) {
        this._loader = null;
        this._game = game;
        this._scene = this._game.scene;
        this._loader = new BABYLON.AssetsManager(this._scene);
        this._loader.useDefaultLoadingScreen = false;
        this._loader.onFinish = this.onFinish.bind(this);
    }
    Preloader.prototype.loadAssets = function () {
        this._addMesh('wood');
        this._addMesh('wood', 'trees');
        // this._addMesh('tree');
        // this._addMesh('tree', 'tree2'); 
        this._addMesh('rock');
        this._addMesh('grass');
        this._addMesh('boar');
        // this._addMesh('hexa-land');
        this._addMesh('hexas', 'hexa-empty');
        this._addMesh('drakkar');
        this._addMesh('hexas', 'hexa-land');
        this._loader.load();
    };
    Preloader.prototype.onFinish = function () {
        this.callback();
    };
    Preloader.prototype._addMesh = function (folder, name) {
        if (name) {
            var task = this._loader.addMeshTask(name, '', "assets/3d/" + folder + "/", name + ".babylon");
        }
        else {
            var task = this._loader.addMeshTask(folder, '', "assets/3d/" + folder + "/", folder + ".babylon");
        }
        task.onSuccess = this._addMeshAssetToGame.bind(this);
    };
    Preloader.prototype._addMeshAssetToGame = function (t) {
        var parent = new BABYLON.Mesh('', this._scene);
        for (var _i = 0, _a = t.loadedMeshes; _i < _a.length; _i++) {
            var m = _a[_i];
            m.setEnabled(false);
            m.getScene().stopAnimation(m);
            m.parent = parent;
        }
        // parent.setEnabled(false);
        console.log(t.name);
        this._game.assets[t.name] = parent;
    };
    return Preloader;
}());
//# sourceMappingURL=Preloader.js.map