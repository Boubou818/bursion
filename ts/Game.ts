declare var Grid: any;

class Game {

    private engine: BABYLON.Engine;
    public assets: Array<any>;
    public scene: BABYLON.Scene;

    private _currentShape: Building;
    private _hoard: Array<Minion> = [];

    private _gui: GUIManager;

    // The player base
    public base: Base;
    
    // The resource map of the player (links resources - amount)
    public resources : ResourceMap<number> = []

    constructor(canvasId: string) {

        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;

        this.assets = [];
        this.scene = null;

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        // Load fonts
        var font = new FontFaceObserver("kingthings_italiqueregular");		
		font.load().then(() => {
            this.initScene();
		});

    }

    private initScene() {

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.Black(); 

        let camera = new BABYLON.ArcRotateCamera('', -1.5, 1, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.wheelPrecision *= 2;
        camera.attachControl(this.engine.getRenderingCanvas());
        let light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.5;
        
        let dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-0.5, -1, 0.5), this.scene);
        dir.intensity = 0.7;

        // Background
        new BABYLON.Layer('back', 'img/background/bg.jpg', this.scene, true);
                
        // Load assets
        let loader = new Preloader(this);
        loader.callback = this.run.bind(this);
        
        loader.loadAssets();
    }

    private run() {

        this.scene.executeWhenReady(() => {
            
            // Remove loader
            var loader = <HTMLElement> document.querySelector("#loader");
            loader.style.display = "none";

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });

        // Load first level
        this._initGame();

        this.scene.debugLayer.show();
    }

    /**
     * Build a new shape
     */
    public createNewExtension() {
        if (!this._currentShape) {
            this._currentShape = new BaseExtension(this, this.base);
            // if (this._currentShape.canBuild()) {
                this._currentShape.preBuild();
            // } else {
            //     console.warn('Cannot build a new base extension !');
            //     this._currentShape.dispose();
            //     this._currentShape = null;
            // }
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
    
    /**
     * Order to all minions to build the nearest building
     */
    public build() {
        for (let m of this._hoard) {
            if (m.strategy && m.strategy instanceof BuildStrategy){
                // Nothing to do if the minion is already building
            }else {
                m.setStrategy(new BuildStrategy(m));
            }
        }
    }

    /**
     * Wake up all builders. Called when a new building is created
     */
    public wakeUpBuilders() {
        for (let m of this._hoard) {
            if (m.strategy && m.strategy instanceof BuildStrategy && m.strategy.isIdle()) {
                m.setStrategy(new BuildStrategy(m)); // TODO find better than that
            }
        }
    }

    /**
     * Creates an instance of the given resource name.
     */
    public createInstanceAsset(name:string, newname?:string, newscale?:number) : BABYLON.AbstractMesh {
        var model : BABYLON.Mesh = this.assets[name];
        var childrens = model.getDescendants();
        if (!newname) {
            newname = name+'_instance';
        }
        var mesh = model.createInstance(newname);
 
        for (let c of childrens) {
            var child = <BABYLON.Mesh> c;
            var inst = child.createInstance('');
            inst.parent = mesh;
        }
        if (newscale) {
            mesh.scaling.scaleInPlace(newscale);
        }
        return mesh;
    }


    private _initGame() {
        // Init resources
        this.resources[Resources.Wood] = 0;
        this.resources[Resources.Rock] = 0;
        this.resources[Resources.Meat] = 0;
                
        let ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;

        let grid = new HexagonMap(10);   

        grid.draw(this);  

        this.scene.pointerMovePredicate = (mesh) => {
            return mesh.name === 'ground';
        }

        this.base = new Base(this, grid);

        this.scene.onPointerMove = (evt, pr) => {
            if (this._currentShape) {
                if (pr.hit) {
                    let overlaps = false;
                    // Update shape color
                    let mat = <BABYLON.StandardMaterial>this._currentShape.material;
                    if (this.base.canBuildHere(this._currentShape)) {
                        mat.diffuseColor = BABYLON.Color3.Green();
                    } else {
                        mat.diffuseColor = BABYLON.Color3.Red();
                    }

                    let p = pr.pickedPoint;
                    p.y = 0;
                    // get nearest hex
                    let nearest = grid.getNearestHex(p);
                    if (nearest) {
                        this._currentShape.position.copyFrom(nearest.center);
                    }
                }
            }
        }

        this.scene.onPointerDown = (evt, pr) => {
            if (this._currentShape) {
                if (this.base.canBuildHere(this._currentShape)) {
                    this.base.addBuilding(this._currentShape);
                    this._currentShape = null;
                }
            }
        }

        // DEBUG : VIEW GRAPH BETWEEN HEXAGONS
        // let viewLink = (hex: MapHexagon, neighbors) => {
        //     // center of the hexagon
        //     let b = BABYLON.Mesh.CreateBox('', 0.2, this.scene);
        //     b.position.copyFrom(hex.center);
        //     b.position.y = 1.5;

        //     for (let n in neighbors) {
        //         // get hex by name
        //         let hexn = this.base.getHexByName(n);
        //         let pos = hexn.center;
        //         pos.y = 1.5;
        //         BABYLON.Mesh.CreateLines('', [b.position.clone(), pos], this.scene);
        //     }
        // }
        // let viewGraph = (graph) => {
        //     for (let vertex in graph.vertices) {
        //         // get hex by name
        //         let hex = this.base.getHexByName(vertex);
        //         viewLink(hex, graph.vertices[vertex]);
        //     }
        // }
        // window.addEventListener('keydown', () => {
        //     viewGraph(this.base.graph);
        // });
        // END DEBUG

        let bobby = new Minion('bobby', this);
        this._hoard.push(bobby);
        
        // let bobby2 = new Minion('bobby2', this);
        // this._hoard.push(bobby2);  
        
        // let bobb32 = new Minion('bobby2', this);
        // this._hoard.push(bobb32);  
        
        // let bobby42 = new Minion('bobby2', this);
        // this._hoard.push(bobby42);  
        
        // let bobby52 = new Minion('bobby2', this);
        // this._hoard.push(bobby52);

        // Init GUI 
        this._gui = new GUIManager(this); 
        this._gui.initHUD();
        
        // Compute stock
        this.computeTotalStock();
        
    }
    
    /**
     * Sum all resources from all warehouse
     */
    public computeTotalStock() : void {        
        this.resources[Resources.Wood] = 0;
        this.resources[Resources.Rock] = 0;
        this.resources[Resources.Meat] = 0;

        for (let b of this.base.buildings) {
            if (b instanceof Warehouse) {
                let warehouse = <Warehouse> b;
                this.resources[Resources.Wood] += warehouse.getStockOf(Resources.Wood);
                this.resources[Resources.Rock] += warehouse.getStockOf(Resources.Rock);
                this.resources[Resources.Meat] += warehouse.getStockOf(Resources.Meat);
            }
        }
        this._gui.updateResourcesText();
    }
}
