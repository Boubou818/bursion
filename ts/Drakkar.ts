/**
 * The drakkar is the game objective.
 * The player can build it by adding materials to it. Each time a material
 * is added, the mesh shader is updated.
 */
class Drakkar {
    
    // The list of needed materials to build the drakkar
    private _neededMaterials : ResourceMap<number>;
    
    // The 3D model
    private _model : BABYLON.AbstractMesh;
    
    // The shader applied to the drakkar
    private _shader : BABYLON.ShaderMaterial;
    
    private _game : Game;
    
    private _completedPercentage : number = 0.65; //%
    
    /**
     * The 3D model will be set at the given position
     */
    constructor(game:Game, position:BABYLON.Vector3) {
        this._game = game;
        
        // 3D model creation
        this._model = game.createInstanceAsset('drakkar');        
        this._model.position.copyFrom(position);
        this._model.position.y = 1.25;
        this._model.rotation.y = -Math.PI/2;
        this._model.scaling.scaleInPlace(0.25);
        
        // Vertex shader - standard
        BABYLON.Effect.ShadersStore['drakkarVertexShader'] = "attribute vec3 position;attribute vec2 uv;uniform mat4 worldViewProjection;varying vec2 vUV;varying vec3 pos;void main(){gl_Position=worldViewProjection*vec4(position,1.),vUV=uv;pos = normalize(vec3(position));}";        
        
        // Fragment shader - TODO changer ca en fonction de la hauteur du pixel
        BABYLON.Effect.ShadersStore['drakkarFragmentShader'] = "varying vec2 vUV;uniform sampler2D textureSampler;uniform float percentage;varying vec3 pos;void main(){vec4 color=texture2D(textureSampler,vUV);if(pos.y>percentage)color.a=0.5;gl_FragColor=color;}";
                
        this._shader = new BABYLON.ShaderMaterial('drakkarShader', this._game.scene, 'drakkar', {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "textureSampler", "percentage"],
                needAlphaBlending : true
            });
        var texture = new BABYLON.Texture('assets/drakkar.jpg', this._game.scene);
        this._shader.setTexture('textureSampler', texture);
        
        this._updateShader();
            
        this._model.material = this._shader;
    }
    
    private _updateShader () {
        this._shader.setFloat('percentage', this._completedPercentage);
    }
    
}