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

        this.assets = [];
        this.scene = null;

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this.initScene();

        this.run();
    }

    private initScene() {

        this.scene = new BABYLON.Scene(this.engine);
        let camera = new BABYLON.ArcRotateCamera('', -1.5, 1, 100, new BABYLON.Vector3(0, 0, 0), this.scene);
        camera.attachControl(this.engine.getRenderingCanvas());
        let light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);
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

        this._gui.initHUD();

        this.scene.debugLayer.show();
    }

    /**
     * Build a new shape
     */
    public createNewExtension() {
        if (!this._currentShape) {
            this._currentShape = new BaseExtension(this, this.base);
            if (this._currentShape.canBuild()) {
                this._currentShape.preBuild();
            } else {
                console.warn('Cannot build a new base extension !');
                this._currentShape.dispose();
                this._currentShape = null;
            }
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
            m.setStrategy(new BuildStrategy(m));
        }
    }

    /**
     * Add the given amount of material of the given resource.
     * Generates a gui element
     */ 
    public addResources(node:BABYLON.Node, amount:number, type:Resources) {
        // Increment resources
        this.resources[type] += amount;
        // Display sprite
        this._gui.displayResourceCounter(node);
        // Update text value
        this._gui.updateResourceText(this.resources[type], type);
    }


    private _initGame() {
        
        // Init GUI 
        this._gui = new GUIManager(this);
        
        // Init resource map
        this.resources[Resources.Wood] = 100;
        this.resources[Resources.Rock] = 100;
        this.resources[Resources.Meat] = 100;
        
        let ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, this.scene);
        ground.isVisible = false;

        let grid = new HexagonMap(15);
        grid.draw(this.scene);

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
        let viewLink = (hex: MapHexagon, neighbors) => {
            // center of the hexagon
            let b = BABYLON.Mesh.CreateBox('', 0.2, this.scene);
            b.position.copyFrom(hex.center);
            b.position.y = 1.5;

            for (let n in neighbors) {
                // get hex by name
                let hexn = this.base.getHexByName(n);
                let pos = hexn.center;
                pos.y = 1.5;
                BABYLON.Mesh.CreateLines('', [b.position.clone(), pos], this.scene);
            }
        }
        let viewGraph = (graph) => {
            for (let vertex in graph.vertices) {
                // get hex by name
                let hex = this.base.getHexByName(vertex);
                viewLink(hex, graph.vertices[vertex]);
            }
        }
        window.addEventListener('keydown', () => {
            viewGraph(this.base.graph);
        });
        // END DEBUG

        let bobby = new Minion('bobby', this);
        this._hoard.push(bobby);
        // let bobby2 = new Minion('bobby2', this);
        // this._hoard.push(bobby2);      

    }
}
