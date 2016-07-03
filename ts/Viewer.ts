/// <reference path="babylon.d.ts"/>
/// <reference path="shapes/HexagonSet.ts"/>
/// <reference path="shapes/HexagonGrid.ts"/>

declare var Grid : any;

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
        let ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;
        
        let s = new HexagonSet(this.scene);
        let green = new BABYLON.StandardMaterial('', this.scene);
        green.diffuseColor = BABYLON.Color3.Green();
        let red = new BABYLON.StandardMaterial('', this.scene);
        red.diffuseColor = BABYLON.Color3.Red();
        
        let grid = new HexagonGrid(10);
        
        this.scene.pointerMovePredicate = (mesh) => {
            return mesh.name === 'ground';
        }        
        // grid.draw(this.scene);
        
        let shapes = [];
        
        this.scene.onPointerMove = (evt, pr) => {
            if (pr.hit) {
                let overlaps = false;
                // Update shape color
                if (canBuildHere(s)) {
                    s.material = green;
                } else {
                    s.material = red;
                }
                
                let p = pr.pickedPoint;
                p.y = 0;
                // get nearest hex
                let nearest = grid.getNearestHex(p);
                if (nearest) {
                    s.position.copyFrom(nearest.center);
                }
            }
        }
        
        /**
         * Retursn true if the given shape can be built here
         */
        let canBuildHere = (shape:HexagonSet) => {
            for (let s of shapes) {
                if (shape.overlaps(s)) {
                    return false;
                } 
            }
            return true;
        };
        
        this.scene.onPointerDown = (evt, pr) => {
            if (pr.hit && canBuildHere(s)) {
                console.log(s);
                shapes.push(s);
                s = new HexagonSet(this.scene);
            }
        }
    }
}
