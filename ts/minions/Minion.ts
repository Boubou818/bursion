/// <reference path="../babylon.d.ts"/>
/// <reference path="MinionController.ts" />


/**
 * Represent a worker : 
 * - can walk on the player base, 
 * - build
 * - defend the base
 */
class Minion extends BABYLON.Mesh {

    private _child : BABYLON.Mesh;

    private _controller : MinionController;

    constructor(name:string, scene:BABYLON.Scene) {
        super(name, scene);

        // Give it a circular shape
        this._child = BABYLON.Mesh.CreateSphere('', 3, 0.5, scene);
        let mat = new BABYLON.StandardMaterial('', scene);
        mat.diffuseColor = BABYLON.Color3.FromInts(127, 0, 155);
        mat.specularColor = BABYLON.Color3.Black();
        this._child.material = mat;

        this._child.parent = this;

        this.position.y = 0.75;
        this._controller = new MinionController(this);
        this._controller.speed = 0.025;
    }

}