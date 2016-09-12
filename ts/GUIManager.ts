/**
 * This class will handle all the GUI display
 */
class GUIManager {
    
    private _scene : BABYLON.Scene;
    
    private _game : Game;
    
    // The gui canvas where all data will be displayed
    private _canvas2D : BABYLON.ScreenSpaceCanvas2D;
    
    // All text displaying resources
    private _resourcesText : ResourceMap<BABYLON.Text2D> = [];

    private _height : number = 0;
    
    
    constructor(game:Game){
        
        this._game = game;
        this._scene = game.scene;
        
        this._canvas2D = new BABYLON.ScreenSpaceCanvas2D(this._scene, {id: "game_screencanvas"});

        this._height = this._scene.getEngine().getRenderHeight();
    }
    
    /**
     * Create a group2D for each resources. Each group is composed of a sprite and a text2D
     */
    private _initResourcesTexts() {
        // Wood
        let textureWood = new BABYLON.Texture("img/gui/wood.png", this._scene, true, true);
        let spriteWood = new BABYLON.Sprite2D(textureWood,{x:0, y:0, spriteSize: new BABYLON.Size(60,60)}); 
        let text2DWood = new BABYLON.Text2D('0', { x:50, marginAlignment: "h: center, v: center", fontName: "30pt kingthings_italiqueregular"});        
        let groupWood = new BABYLON.Group2D({x:60, y:this._height - 100, parent: this._canvas2D, children: [spriteWood, text2DWood]});
        
        // Rock
        let textureRock = new BABYLON.Texture("img/gui/rock.png", this._scene, true, true);
        let spriteRock = new BABYLON.Sprite2D(textureRock,{x:0, y:0, spriteSize: new BABYLON.Size(60,60)}); 
        let text2DRock = new BABYLON.Text2D('0', { x:50, marginAlignment: "h: center, v: center", fontName: "30pt kingthings_italiqueregular" });        
        let groupRock = new BABYLON.Group2D({x:200, y:this._height - 100, parent: this._canvas2D, children: [spriteRock, text2DRock]});
        
        // Meat
        let textureMeat = new BABYLON.Texture("img/gui/meat.png", this._scene, true, true);
        let spriteMeat = new BABYLON.Sprite2D(textureMeat,{x:0, y:0, spriteSize: new BABYLON.Size(60,60)}); 
        let text2DMeat = new BABYLON.Text2D('0', { x:50, marginAlignment: "h: center, v: center", fontName: "30pt kingthings_italiqueregular" });        
        let groupMeat = new BABYLON.Group2D({x:340, y:this._height - 100, parent: this._canvas2D, children: [spriteMeat, text2DMeat]});
        
        this._resourcesText[Resources.Wood] = text2DWood;
        this._resourcesText[Resources.Rock] = text2DRock;
        this._resourcesText[Resources.Meat] = text2DMeat; 
    } 
    
    /**
     * Update the resource value displayed in the GUI
     */
    public updateResourcesText() {
        for (let res in this._game.resources) {
            this._resourcesText[res].text = this._game.resources[res].toString()+" ";
        }
    }
    
    /**
     * Create the 'static' button : 
     * - Build
     * - Gather wood
     * - 
     * ...
     */
    public initHUD() {
        
        this._initResourcesTexts();
        
        let buttonCreateExt = new BABYLON.Rectangle2D(
		{ 	parent: this._canvas2D, id: "new_ext", x: 60, y: 50, width: 120, height: 40, 
			fill: "#40C040FF",
			children: 
			[
				new BABYLON.Text2D("New extension", { marginAlignment: "h: center, v: center"/*, fontName: "20pt kingthings_italiqueregular"*/ })
			]
		});
        // Add action to the build button
        buttonCreateExt.pointerEventObservable.add(this._game.createNewExtension.bind(this._game), BABYLON.PrimitivePointerInfo.PointerUp); 

        // Gather wood
        let buttonWood = new BABYLON.Rectangle2D(
		{ 	parent: this._canvas2D, id: "gatherWood", x: 200, y: 50, width: 120, height: 40, 
			fill: "#40C040FF",
			children: 
			[
				new BABYLON.Text2D("Gather Wood", { marginAlignment: "h: center, v: center"/*, fontName: "20pt kingthings_italiqueregular"*/ })
			]
		});
        // Add action to the button
        buttonWood.pointerEventObservable.add(this._game.gatherWood.bind(this._game), BABYLON.PrimitivePointerInfo.PointerUp);
        
        // Gather wood
        let buttonRock = new BABYLON.Rectangle2D(
		{ 	parent: this._canvas2D, id: "gatherRock", x: 340, y: 50, width: 120, height: 40, 
			fill: "#40C040FF",
			children: 
			[
				new BABYLON.Text2D("Gather Rock", { marginAlignment: "h: center, v: center"/*, fontName: "20pt kingthings_italiqueregular"*/ })
			]
		});
        // Add action to the button
        buttonRock.pointerEventObservable.add(this._game.gatherRock.bind(this._game), BABYLON.PrimitivePointerInfo.PointerUp);
        
        // Gather food
        let buttonFood = new BABYLON.Rectangle2D(
		{ 	parent: this._canvas2D, id: "gatherFood", x: 480, y: 50, width: 120, height: 40, 
			fill: "#40C040FF",
			children: 
			[
				new BABYLON.Text2D("Gather Food", { marginAlignment: "h: center, v: center"/*, fontName: "20pt kingthings_italiqueregular"*/ })
			]
		});
        // Add action to the button
        buttonFood.pointerEventObservable.add(this._game.gatherFood.bind(this._game), BABYLON.PrimitivePointerInfo.PointerUp);
        
        // Gather wood
        let buttonBuild = new BABYLON.Rectangle2D(
		{ 	parent: this._canvas2D, id: "build", x: 620, y: 50, width: 120, height: 40, 
			fill: "#40C040FF",
			children: 
			[
				new BABYLON.Text2D("Build", { marginAlignment: "h: center, v: center"/*, fontName: "20pt kingthings_italiqueregular"*/ })
			]
		});
        // Add action to the button
        buttonBuild.pointerEventObservable.add(this._game.build.bind(this._game), BABYLON.PrimitivePointerInfo.PointerUp);
    }
    
    /**
     * Display the number of resource generated above the given node
     */
    public displayResourceCounter(node:BABYLON.Node){        
        
        var texture = new BABYLON.Texture("img/gui/increment.png", this._scene, true, true);
        let sprite = new BABYLON.Sprite2D(texture,
		{
			x:-17, y:0, spriteSize: new BABYLON.Size(35, 59)
		}); 
        
        let groupNode = new BABYLON.Group2D({parent: this._canvas2D, width:1 /* BUG IN CANVAS2D */, trackNode: node,children: [sprite]});
                
        this._createAndStartCounterAnimation(sprite, 1500, () => {
            sprite.dispose();
            groupNode.dispose();
        });
    }
    
    /**
     * Create a simple animation
     * @param p The sprite position in pixels
     * @param duration The animation duration in milliseconds 
     */
    private _createAndStartCounterAnimation = function(obj:BABYLON.RenderablePrim2D, duration : number, callback?: () => void) : void {
        var quarter = duration*60*0.001/4;

        // Position animation
        var position = new BABYLON.Animation("position", "y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        position.setKeys([
            { frame: 0, value: obj.y },
            { frame: quarter*4, value: obj.y + 75 }
        ]); 
        var e = new BABYLON.ExponentialEase();
        e.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        position.setEasingFunction(e);
        obj.animations.push(position);
        
        // Scale
        var scale = new BABYLON.Animation("scale", "scale", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        scale.setKeys([
            { frame: 0, value: 0 },
            { frame: quarter*4, value: 1 }
        ]); 
        var f = new BABYLON.ElasticEase();
        f.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);
        scale.setEasingFunction(f);
        obj.animations.push(scale);
        
        // Opacity animation
        var opacity = new BABYLON.Animation("opacity", "opacity", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        opacity.setKeys([
            { frame: 0, value: 1 },
            { frame: quarter*2, value: 1 },
            { frame: quarter*4, value: 0.0  } 
        ]); 
        obj.animations.push(opacity);

        this._scene.beginAnimation(obj, 0, quarter*4, false, 1, callback);
    }
}