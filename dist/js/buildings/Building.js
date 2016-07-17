var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * A building is something that can be built in the player base.
 * There is several kind of building :
 * - Meat processing (meat ++)
 * - Hut (minion ++)
 * - base extension, that needs to be built above land
 */
var Building = (function (_super) {
    __extends(Building, _super);
    function Building(game) {
        _super.call(this, '_building_', game.scene);
        // The list of map hexagons this building takes
        this._hexagons = [];
        // The ressources needed to build this building. Each subclass will define this amount in the constructor
        this._resourcesNeeded = [];
        // Set to true when a minion is taking care of this building
        this.waitingToBeBuilt = false;
        this._game = game;
        // Init the cost of this building
        this._initCost();
    }
    Object.defineProperty(Building.prototype, "material", {
        get: function () {
            return this._child.material;
        },
        /**
         * Propagate the material of this node to the child mesh.
         */
        set: function (value) {
            if (this._child) {
                this._child.material = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Building.prototype, "workingSite", {
        get: function () {
            return this._workingSite;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns true if the building can be built (ressources are sufficient)
     */
    Building.prototype.canBuild = function () {
        // Browser resources needed and check if the game has enough
        var canBuild = true;
        for (var r in this._resourcesNeeded) {
            canBuild = canBuild && this._game.resources[r] >= this._resourcesNeeded[r];
        }
        return canBuild;
    };
    /**
     * Create the child mesh corresponding to the building,
     * and attach it to this node. In mode prebuild, the building is attached to
     * the mouse.
     */
    Building.prototype.preBuild = function () {
        // Init building
        this._initBuilding();
        // Create it      
        this._child = this._createBuildingMesh();
        this._child.parent = this;
        // Set prebuild material
        this._setPrebuildMaterial();
    };
    /**
     * The building is now attached to the player base and is ready to be built
     * by minions.
     * @param hexagons The list of hexagons the building will be built on
     * @param workingSite The hexagon where the minion should come to build this building
     */
    Building.prototype.prepareToBuildOn = function (hexagons, workingSite) {
        // Save the list of hexagons taken by this building
        this._hexagons = hexagons.slice();
        // Set the working site
        this._workingSite = workingSite;
        // Set 'waiting for build' material
        this._setWaitingForMinionMaterial();
        // Waiting for a minion to build this building
        this.waitingToBeBuilt = true;
    };
    /**
     * Method called when the building is finished to built on the player base
     */
    Building.prototype.finishBuild = function (base) {
        // No more waiting
        this.waitingToBeBuilt = false;
        // Set 'waiting for build' material
        this._setFinishedMaterial();
        // Notify the base this building is finished
        base.buildingFinished(this);
    };
    return Building;
}(BABYLON.Mesh));
//# sourceMappingURL=Building.js.map