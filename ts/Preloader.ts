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
        this._loader.useDefaultLoadingScreen = false;
        this._loader.onFinish = this.onFinish.bind(this);
              
    }
    
    public loadAssets() {
        this._addMesh('collectibles/wood', 'wood');
        this._addMesh('collectibles/meat', 'meat');
        this._addMesh('collectibles/leg', 'leg');
        
        this._addMesh('resources/wood', 'trees');
        this._addMesh('resources/rock','rock');
        this._addMesh('resources/boar','boar');
        
        this._addMesh('hexas', 'hexa-empty');
        this._addMesh('hexas', 'hexa-selected');
        this._addMesh('hexas', 'hexa-water1');
        this._addMesh('hexas', 'hexa-water2');
        this._addMesh('hexas', 'hexa-beach'); 
        this._addMesh('hexas', 'hexa-meat'); 
        
        this._addMesh('environment', 'whale');
        this._addMesh('drakkar');
        this._addMesh('viking');
        this._addMesh('buildings', 'warehouse'); 
        
        this._loader.load();
    }
    
    public onFinish() {
        this.callback();
    }
    
    private _addMesh(folder :string, name?:string ) {
        if (name) {
            var task = this._loader.addMeshTask(name, '', `assets/3d/${folder}/`, `${name}.babylon`);
        } else {
            var task = this._loader.addMeshTask(folder, '', `assets/3d/${folder}/`, `${folder}.babylon`);
        }
        task.onSuccess = this._addMeshAssetToGame.bind(this);
    }
    
    private _addMeshAssetToGame(t: BABYLON.MeshAssetTask) {
        let parent = new BABYLON.Mesh('', this._scene);
        console.group();
        console.log(`%c Loading : ${t.name}`, 'background: #333; color: #bada55');
        
        for (let m of t.loadedMeshes) {
            m.setEnabled(false);
            m.getScene().stopAnimation(m);
            m.parent = parent;
        }
        parent.setEnabled(false);
                
        
        console.groupEnd();
        this._game.assets[t.name] = parent;
    }
    
    
}