class Viewer {

    private engine  : BABYLON.Engine;
    public assets   : Array<any>;
    public scene    : BABYLON.Scene;

    constructor(canvasId:string) {
        
        let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById(canvasId);
        this.engine         = new BABYLON.Engine(canvas, true);
        
        this.assets         = [];
        this.scene          = null;
        
        // On resize le jeu en fonction de la taille de la fenetre
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
        
        this.initScene(); 
            
        this.run();
    }

     private initScene() {

        this.scene = new BABYLON.Scene(this.engine);
        let camera = new BABYLON.ArcRotateCamera('', -1.5,1,100, new BABYLON.Vector3(0,0,0), this.scene);       
        camera.attachControl(this.engine.getRenderingCanvas()); 
        let light  = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0,1,0), this.scene);
        light.intensity = 1;
    }

    private run() {
        

        this.scene.executeWhenReady(() => {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });

        // Load first level
        this._initGame();

        this.scene.debugLayer.show();
    }

     private _initGame() {     
        let ground = BABYLON.Mesh.CreateGround("ground1", 100, 100, 2, this.scene);
        
    }
}
