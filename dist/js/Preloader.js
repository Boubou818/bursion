var Preloader = (function () {
    function Preloader(game) {
        this._loader = null;
        this._game = game;
        this._scene = this._game.scene;
        this._loader = new BABYLON.AssetsManager(this._scene);
        this._loader.onFinish = this.onFinish.bind(this);
    }
    Preloader.prototype.loadAssets = function () {
        this._addMesh('wood');
        this._loader.load();
    };
    Preloader.prototype.onFinish = function () {
        this.callback();
    };
    Preloader.prototype._addMesh = function (name) {
        var task = this._loader.addMeshTask(name, '', "assets/3d/" + name + "/", name + ".babylon");
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
        this._game.assets[t.name] = parent;
    };
    return Preloader;
}());
//# sourceMappingURL=Preloader.js.map