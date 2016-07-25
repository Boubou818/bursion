class Preloader {
    
    private _game : Game;
    private _scene : BABYLON.Scene;
    private _loader : BABYLON.AssetsManager = null;
    
    // Function called when the loader is over
    public callback : () => void;
    
    constructor(game:Game) {
        this._game = game;
        this._scene = this._game.scene;
        
        this._loader = new BABYLON.AssetsManager(this._scene);
        this._loader.onFinish = this.onFinish.bind(this);
              
    }
    
    public loadAssets() {
        this._addMesh('wood');
        
        this._loader.load();
    }
    
    public onFinish() {
        this.callback();
    }
    
    private _addMesh(name :string) {
        let task = this._loader.addMeshTask(name, '', `assets/3d/${name}/`, `${name}.babylon`);
        task.onSuccess = this._addMeshAssetToGame.bind(this);
    }
    
    private _addMeshAssetToGame(t: BABYLON.MeshAssetTask) {
        let parent = new BABYLON.Mesh('', this._scene);
        
        for (let m of t.loadedMeshes) {
            // m.setEnabled(false);
            m.getScene().stopAnimation(m);
            m.parent = parent;
        }
        // parent.setEnabled(false);
                
        this._game.assets[t.name] = parent;
    }
    
    
}