declare var Grid : any;

class Viewer {

    private engine  : BABYLON.Engine;
    public assets   : Array<any>;
    public scene    : BABYLON.Scene;

    private _currentShape : Building;
    private _hoard : Array<Minion> = [];
    
    private _gui : GUIManager;

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
        
        
        this._gui = new GUIManager(this);
    }

    private run() {
        

        this.scene.executeWhenReady(() => {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });

        // Load first level
        this._initGame();

        this._gui.initHUD();

        this.scene.debugLayer.show(); 
    }

    /**
     * Build a new shape
     */
    public build() {
        if (!this._currentShape){
            this._currentShape = new Building(this.scene);
        }
    }
    
    /**
     * Order to all minions to gather wood
     */
    public gatherWood() {
        for (let m of this._hoard) {
            m.setStrategy(new ResourceStrategy(m, Resources.Wood));
        }
    }
    /**
     * Order to all minions to gather wood
     */
    public gatherRock() {
        for (let m of this._hoard) {
            m.setStrategy(new ResourceStrategy(m, Resources.Rock));
        }
    }

     private _initGame() {     
        let ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;
        
        let green = new BABYLON.StandardMaterial('', this.scene);
        green.diffuseColor = BABYLON.Color3.Green();
        let red = new BABYLON.StandardMaterial('', this.scene);
        red.diffuseColor = BABYLON.Color3.Red();
        
        let grid = new HexagonGrid(15);
        grid.draw(this.scene); 
        
        this.scene.pointerMovePredicate = (mesh) => {
            return mesh.name === 'ground';
        }        
                
        let base = new Base(this.scene, grid);
        
        this.scene.onPointerMove = (evt, pr) => {
            if (this._currentShape) {
                if (pr.hit) {
                    let overlaps = false;
                    // Update shape color
                    if (base.canBuildHere(this._currentShape)) {
                        this._currentShape.material = green;
                    } else {
                        this._currentShape.material = red;
                    }
                    
                    let p = pr.pickedPoint;
                    p.y = 0;
                    // get nearest hex
                    let nearest = grid.getNearestHex(p);
                    if (nearest) {
                        this._currentShape.position.copyFrom(nearest.getWorldCenter());
                    }
                }
            }
        }
        
        this.scene.onPointerDown = (evt, pr) => {
            if (this._currentShape) {
                if (base.canBuildHere(this._currentShape)) {
                    base.addBuilding(this._currentShape);
                    this._currentShape = null;
                }
            }
        }

        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        let viewLink = (hex:Hexagon, neighbors) => {
            // center of the hexagon
            let b = BABYLON.Mesh.CreateBox('', 0.2, this.scene);
            b.position.copyFrom(hex.getWorldCenter());
            b.position.y = 0.75;
            
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

        let bobby = new Minion('bobby', base, this.scene);
        let bobby2 = new Minion('bobby2', base, this.scene);
        this._hoard.push(bobby);
        this._hoard.push(bobby2);        
    }
}
