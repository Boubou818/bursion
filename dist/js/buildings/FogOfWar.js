var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * The fog of war is a plane with a texture/color as diffuse and a dynamic texture as opacity texture.
 * For each hexagon that belongs to the player base, an opening will be drawn on the opacity texture.
 */
var FogOfWar = (function (_super) {
    __extends(FogOfWar, _super);
    function FogOfWar(size, scene) {
        _super.call(this, '_fogOfWar_', scene);
        // Create plane
        this._plane = BABYLON.Mesh.CreateGround('_fogOfWar_', size, size, 1, scene);
        this._plane.computeWorldMatrix(true);
        this._plane.parent = this;
        // Update pick predicate
        this._pickPredicate = function (mesh) {
            return mesh.name === '_fogOfWar_';
        };
        var materialFog = new BABYLON.StandardMaterial('fogMaterial', scene);
        this._plane.material = materialFog;
        // Create fog material - opacity texture
        this._opacityTexture = new BABYLON.DynamicTexture("fogOpacityTexture", 2048, scene, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
        this._opacityTexture.getAlphaFromRGB = true;
        this._createFog();
        // Diffuse color
        materialFog.diffuseColor = BABYLON.Color3.Black();
        // Specular        
        materialFog.specularColor = BABYLON.Color3.Black();
        // opacity texture
        materialFog.opacityTexture = this._opacityTexture;
    }
    /**
     * Clear the canvas 2D and set it in white
     */
    FogOfWar.prototype._createFog = function () {
        var textSize = this._opacityTexture.getSize();
        var context = this._opacityTexture.getContext();
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(0, 0, textSize.width, textSize.height);
        this._opacityTexture.update();
    };
    /**
     * Draw a circle in the opacity texture
     */
    FogOfWar.prototype._drawCircle = function (centerX, centerY, radius, fillStyle) {
        var context = this._opacityTexture.getContext();
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = fillStyle;
        context.closePath();
        context.fill();
        // context.lineWidth = 1;
        // context.strokeStyle = "#FF0000";
        // context.stroke();
        // Opacity texture should be updated after this
    };
    FogOfWar.prototype._drawPolygon = function (x, y, radius, fillStyle) {
        var ctx = this._opacityTexture.getContext();
        var a = ((Math.PI * 2) / 6);
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.moveTo(radius, 0);
        for (var i = 1; i < 6; i++) {
            ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
        }
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
        // Opacity texture should be updated after this
    };
    FogOfWar.prototype._setFogForHex = function (hex, options) {
        var ray = new BABYLON.Ray(hex.center, BABYLON.Vector3.Up());
        var pr = this.getScene().pickWithRay(ray, this._pickPredicate.bind(this));
        var texcoords = pr.getTextureCoordinates();
        var textSize = this._opacityTexture.getSize();
        var centerX = texcoords.x * textSize.width;
        var centerY = textSize.height - texcoords.y * textSize.height;
        var fillStyle = null;
        if (options.color2) {
            // style gradient
            var ctx = this._opacityTexture.getContext();
            fillStyle = ctx.createRadialGradient(centerX, centerY, options.radius / 2, centerX, centerY, 0);
            fillStyle.addColorStop(0, options.color1);
            fillStyle.addColorStop(1, options.color2);
        }
        else {
            fillStyle = options.color1;
        }
        if (options.shape) {
            this._drawCircle(centerX, centerY, options.radius, fillStyle);
        }
        else {
            this._drawPolygon(centerX, centerY, options.radius, fillStyle);
        }
    };
    /**
     * Draw a circle in the opacity text for the given hex
     */
    FogOfWar.prototype.dissipateFog = function (array) {
        // Clear the whole context
        this._createFog();
        // For each hex of the base, draw two shapes : one in greyish, the other one (smaller) in black
        // First loop : greyish
        var ctx = this._opacityTexture.getContext();
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var hex = array_1[_i];
            this._setFogForHex(hex, { radius: 200, color1: 'rgb(200,200, 200)', shape: 'circle' });
        }
        // Second time in black
        for (var _a = 0, array_2 = array; _a < array_2.length; _a++) {
            var hex = array_2[_a];
            this._setFogForHex(hex, { radius: 90, color1: "rgb(0, 0, 0)", shape: 'circle' });
        }
        this._opacityTexture.update();
    };
    return FogOfWar;
}(BABYLON.Mesh));
//# sourceMappingURL=FogOfWar.js.map