/// <reference path="Building.ts" />
/// <reference path="../babylon.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GeneratorBuilding = (function (_super) {
    __extends(GeneratorBuilding, _super);
    function GeneratorBuilding(scene, template) {
        _super.call(this, scene, template);
        // The subset of hexagons that can generate resources
        this._resourceSlots = [];
        // Add resources slots to the child model
        this._setResourcesSlots();
        this._addSlotsToModel();
    }
    /**
     * Generate resources slots for this generator
     */
    GeneratorBuilding.prototype._setResourcesSlots = function () {
        // Choose resources slots
        for (var _i = 0, _a = this.hexagons; _i < _a.length; _i++) {
            var hex = _a[_i];
            if (Math.random() < 0.5) {
                // set this hex as resource slot
                this._resourceSlots.push(new ResourceSlot(hex.center));
            }
        }
    };
    GeneratorBuilding.prototype._addSlotsToModel = function () {
        var models = [];
        // Create resources slots
        for (var _i = 0, _a = this._resourceSlots; _i < _a.length; _i++) {
            var slot = _a[_i];
            var b = BABYLON.Mesh.CreateBox('_slot_', 0.15, this.getScene());
            b.position.copyFrom(slot.position);
            b.position.y = 0.65;
            models.push(b);
        }
        ;
        models.push(this._child);
        this._child = BABYLON.Mesh.MergeMeshes(models, true);
        this._child.parent = this;
    };
    return GeneratorBuilding;
}(Building));
//# sourceMappingURL=GeneratorBuilding.js.map