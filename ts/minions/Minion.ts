/**
 * Represent a worker : 
 * - can walk on the player base, 
 * - build
 * - defend the base
 */
class Minion extends BABYLON.Mesh {

    private _child : BABYLON.Mesh;

    private _controller : MinionController;

    // The hexagon this minion currently is.
    // This attribute should be updated each time the minion walks on an hex.
    public currentHexagon : MapHexagon;
    
    // The instance of the game
    private _game : Game;

    // The player base graph where the minion can walk on.
    public base : Base;
    
    // Will manage the 'strategy clock'. At each callback, the minion will apply its strategy.
    private _strategyTimer : Timer;
    
    // The strategy is applied each 150ms
    private static STRATEGY_CLOCK = 150;
    
    // The working schedule of this minion.
    public strategy : WorkingStrategy;

    constructor(name:string, game:Game) {
        super(name, game.scene);

        this._game = game;

        // Give it a circular shape
        this._child = BABYLON.Mesh.CreateSphere('', 3, 0.5, this.getScene());
        let mat = new BABYLON.StandardMaterial('', this.getScene());
        mat.diffuseColor = BABYLON.Color3.FromInts(127, 0, 155);
        mat.specularColor = BABYLON.Color3.Black();
        this._child.material = mat;

        this._child.parent = this;
        this._controller = new MinionController(this);
        this._controller.speed = 0.1;
        
        this.base = this._game.base;
        this.currentHexagon = this.base.getStarterHex();

        // Update minion position
        this.position.copyFrom(this.currentHexagon.center);
        this.position.y = 0.25;

        // At each destination, the current hexagon where the minion lives is updated.
        this._controller.atEachDestination = (hx:MapHexagon) => {
            this.currentHexagon = hx;
        };        
        
        // Notify the strategy when the final destination has been reached
        this._controller.atFinalDestination = (data : MapHexagon) => {
            if (this.strategy) {
                this.strategy.finishedWalkingOn(data);
            }
        }
        
        this._strategyTimer = new Timer(Minion.STRATEGY_CLOCK, this.getScene(), {repeat:-1, autostart:true});
        this._strategyTimer.callback = () => {
            // If a strategy is available, apply it
            if (this.strategy) {
                this.strategy.applyStrategy();
            }
        }

    }
    
    get game() : Game {
        return this._game;
    } 

    /**
     * Make the minion walk to the given hexagon: 
     * - Find shortest path to this hex
     * - Add a destination for each hex of the path
     * - make it moooove \o/
     * Returns the number of hexagon this minion has to browse
     */
    public moveTo(hex:MapHexagon) : number {
        
        let path = this.base.getPathFromTo(this.currentHexagon, hex);
        if (!path || path.length === 0) {
            // If a path is found, reset destinations
            this._controller.stop();
            return 0;
        } else {
            for (let hex of path) {
                let tmp = hex.center;
                tmp.y = 0.25;
                this._controller.addDestination(tmp, hex);
            }
            this._controller.start();
            return path.length;
        }
    }

    /** 
     * Returns the nearest heaxgon containing the given resource.
     */
    public getNearestResource(res : number) : MapHexagon {
        return this.base.getNearestResource(this.currentHexagon, res);
    }
    /** 
     * Returns the nearest building waiting to be built
     */
    public getNearestBuildingWaitingForMinion() : Building {
        return this.base.getNearestBuildingWaitingForMinion(this.currentHexagon);
    }
    /**
     * Returns the nearest warehouse
     */
    public getNearestWarehouse() : Warehouse {
        return this.base.getNearestWarehouse(this.currentHexagon);
    }
    
    public setStrategy(strat:WorkingStrategy) {
        // If the minion already had a strategy, delete it
        if (this.strategy) {
            this.strategy.dispose();
        }
        this.strategy = strat;
    }

}