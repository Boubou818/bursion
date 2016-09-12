/**
 * Represent a worker : 
 * - can walk on the player base, 
 * - build
 * - defend the base
 */
class Minion extends BABYLON.Mesh {

    private _child : BABYLON.AbstractMesh;

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
        this._child = this._game.createCloneAsset('viking');
        this._child.getScene().beginAnimation(this._child, 0, 120, true);

        this._child.parent = this;
        this._controller = new MinionController(this);
        this._controller.speed = 0.1;
        
        let children = this._child.getDescendants();
        console.log(children);
        // this._controller.addAnimation('walk', 0, 120);
        // this._controller.addAnimation('idle', 0, 120);
        
        this.base = this._game.base;
        this.currentHexagon = this.base.getStarterHex();

        // Update minion position
        this.position.copyFrom(this.currentHexagon.center);

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