var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Represent a worker :
 * - can walk on the player base,
 * - build
 * - defend the base
 */
var Minion = (function (_super) {
    __extends(Minion, _super);
    function Minion(name, game) {
        var _this = this;
        _super.call(this, name, game.scene);
        this._game = game;
        // Give it a circular shape
        this._child = BABYLON.Mesh.CreateSphere('', 3, 0.5, this.getScene());
        var mat = new BABYLON.StandardMaterial('', this.getScene());
        mat.diffuseColor = BABYLON.Color3.FromInts(127, 0, 155);
        mat.specularColor = BABYLON.Color3.Black();
        this._child.material = mat;
        this._child.parent = this;
        this.position.y = 0.75;
        this._controller = new MinionController(this);
        this._controller.speed = 0.05;
        this.base = this._game.base;
        this.currentHexagon = this.base.getStarterHex();
        // Update minion position
        this.position.copyFrom(this.currentHexagon.getWorldCenter());
        this.position.y = 0.75;
        // At each destination, the current hexagon where the minion lives is updated.
        this._controller.atEachDestination = function (hx) {
            _this.currentHexagon = hx;
        };
        // Notify the strategy when the final destination has been reached
        this._controller.atFinalDestination = function (data) {
            if (_this.strategy) {
                _this.strategy.finishedWalkingOn(data);
            }
        };
        this._strategyTimer = new Timer(Minion.STRATEGY_CLOCK, this.getScene(), { repeat: -1, autostart: true });
        this._strategyTimer.callback = function () {
            // If a strategy is available, apply it
            if (_this.strategy) {
                _this.strategy.applyStrategy();
            }
        };
    }
    /**
     * Make the minion walk to the given hexagon:
     * - Find shortest path to this hex
     * - Add a destination for each hex of the path
     * - make it moooove \o/
     */
    Minion.prototype.moveTo = function (hex) {
        var path = this.base.getPathFromTo(this.currentHexagon, hex);
        if (path.length != 0) {
            // If a path is found, reset destinations
            this._controller.stop();
        }
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var hex_1 = path_1[_i];
            var tmp = hex_1.getWorldCenter();
            tmp.y = 0.75;
            this._controller.addDestination(tmp, hex_1);
        }
        this._controller.start();
    };
    /**
     * Returns the nearest heaxgon containing the given resource.
     */
    Minion.prototype.getNearestResource = function (res) {
        return this.base.getNearestResource(this.currentHexagon, res);
    };
    /**
     * Returns the nearest building waiting to be built
     */
    Minion.prototype.getNearestBuilding = function () {
        return this.base.getNearestBuildingWaitingForMinion(this.currentHexagon);
    };
    Minion.prototype.setStrategy = function (strat) {
        // If the minion already had a strategy, delete it
        if (this.strategy) {
            this.strategy.dispose();
        }
        this.strategy = strat;
    };
    /**
     * Add the given number of material to the game
     */
    Minion.prototype.addResourceToGame = function (amount, type) {
        this._game.addResources(this, amount, type);
    };
    // The strategy is applied each 150ms
    Minion.STRATEGY_CLOCK = 150;
    return Minion;
}(BABYLON.Mesh));
//# sourceMappingURL=Minion.js.map