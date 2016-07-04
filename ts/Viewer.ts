/// <reference path="babylon.d.ts"/>
/// <reference path="shapes/HexagonSet.ts"/>
/// <reference path="shapes/HexagonGrid.ts"/>
/// <reference path="Base.ts" />


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

        
        let base = new Base();
        
        this.scene.onPointerDown = (evt, pr) => {
            if (canBuildHere(s)) {
                shapes.push(s);
                base.addBuilding(s);
                s = new HexagonSet(this.scene);
            }
        }

        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        let viewLink = (hex:Hexagon, neighbors) => {
            // center of the hexagon
            let b = BABYLON.Mesh.CreateBox('', 0.2, this.scene);
            b.position.copyFrom(hex.getWorldCenter());
            b.position.y = 0.75;

            console.log(neighbors);
            
            for(let n in neighbors) {
                // get hex by name
                let hexn = base.getHexByName(n);
                let pos = hexn.getWorldCenter();
                pos.y = 0.75;
                BABYLON.Mesh.CreateLines('', [b.position.clone(),pos], this.scene);
            }
        }
        let viewGraph = (graph) => {
            for(let vertex in graph.vertices) {
                // get hex by name
                let hex = base.getHexByName(vertex);
                viewLink(hex, graph.vertices[vertex]);
            }
        }
        window.addEventListener('keydown', () => {            
            viewGraph(base.graph);
        });
        // END DEBUG

    }
}
