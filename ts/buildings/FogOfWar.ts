/**
 * The fog of war is a plane with a texture/color as diffuse and a dynamic texture as opacity texture.
 * For each hexagon that belongs to the player base, an opening will be drawn on the opacity texture.
 */
class FogOfWar extends BABYLON.Mesh { 
    
    // The plane composing the fog, as a child of this mesh.
    private _plane : BABYLON.Mesh;
    
    // When dissipating the fog, the mesh to pick is only the fog plane
    private _pickPredicate : (mesh:BABYLON.Mesh) => boolean;
    
    // The opacity texture of the fog.
    private _opacityTexture : BABYLON.DynamicTexture; 
    
    constructor(size, scene) {
        super('_fogOfWar_', scene);
                
        // Create plane
        this._plane = BABYLON.Mesh.CreateGround('_fogOfWar_', size, size, 1, scene);
        this._plane.computeWorldMatrix(true);
        this._plane.parent = this;
        
        // Update pick predicate
        this._pickPredicate = (mesh:BABYLON.Mesh) : boolean => {
            return mesh.name === '_fogOfWar_';
        };
        
        let materialFog = new BABYLON.StandardMaterial('fogMaterial', scene);
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
    private _createFog () {             
        let textSize = this._opacityTexture.getSize();   
        let context = this._opacityTexture.getContext();     
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(0, 0, textSize.width, textSize.height);
        this._opacityTexture.update();
    }
    
    /**
     * Draw a circle in the opacity texture
     */
    private _drawCircle(centerX, centerY, radius, fillStyle:string|CanvasGradient) {  
        let context = this._opacityTexture.getContext();
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = fillStyle;
        context.closePath();
        context.fill();
        // context.lineWidth = 1;
        // context.strokeStyle = "#FF0000";
        // context.stroke();
        // Opacity texture should be updated after this
    }
    
    private _drawPolygon(x, y, radius, fillStyle:string|CanvasGradient) {
        let ctx = this._opacityTexture.getContext();
        var a = ((Math.PI * 2)/6);
        ctx.save();
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.moveTo(radius,0);
        for (var i = 1; i < 6; i++) {
            ctx.lineTo(radius*Math.cos(a*i),radius*Math.sin(a*i));
        }
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
        // Opacity texture should be updated after this
    }
    
    private _setFogForHex (hex:Hexagon, options:{radius:number, color1:string, color2?:string, shape?:string}) {
                       
        let ray = new BABYLON.Ray(hex.getWorldCenter(), BABYLON.Vector3.Up());
        let pr = this.getScene().pickWithRay(ray, this._pickPredicate.bind(this));        
        let texcoords = pr.getTextureCoordinates();         
        let textSize = this._opacityTexture.getSize();                 
        let centerX = texcoords.x * textSize.width;
        let centerY = textSize.height - texcoords.y * textSize.height;
        
        let fillStyle = null;
        if (options.color2) {
            // style gradient
            let ctx = this._opacityTexture.getContext();
            fillStyle = ctx.createRadialGradient(centerX, centerY, options.radius/2, centerX, centerY,0);
            fillStyle.addColorStop(0,options.color1);
            fillStyle.addColorStop(1,options.color2);
        } else {
            fillStyle = options.color1;
        }
        
        if (options.shape) {
            this._drawCircle(centerX, centerY, options.radius, fillStyle ); 
        } else {
            this._drawPolygon(centerX, centerY, options.radius, fillStyle );   
        }
    }
    
    /**
     * Draw a circle in the opacity text for the given hex 
     */
    public dissipateFog(array: Array<Hexagon>) {    
        
        // Clear the whole context
        this._createFog();
        
        // For each hex of the base, draw two shapes : one in greyish, the other one (smaller) in black
        // First loop : greyish
        let ctx = this._opacityTexture.getContext();
        
        for (let hex of array) { 
            this._setFogForHex(hex, {radius:200, color1:'rgb(200,200, 200)', shape:'circle'});   
        }
        // Second time in black
        for (let hex of array) {
            this._setFogForHex(hex, {radius:90, color1:"rgb(0, 0, 0)", shape:'circle'});        
        }
        
        this._opacityTexture.update(); 
    }
}