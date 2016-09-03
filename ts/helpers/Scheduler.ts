/**
 * This objects take some animations, and notify its owner when all animations are over
 */
class Scheduler {
    
    // The function called when all animations are finished
    public whenAllOver : () => void;
    
    // A set of timers to look after
    private _timers : Array<Timer> = [];
    
    // The number of finished animations. If this number is equals to the length of _animatable, the callback
    // function is called. 
    private _numberOfFinishedAnimations : number = 0;
    
    constructor(){
    }
    
    private _checkWhenOver() {
        this._numberOfFinishedAnimations++;
        
        if (this._numberOfFinishedAnimations === this._timers.length){
            // Finish !
            this.whenAllOver();
        }
    } 
    
    /**
     * Add a timer to the pool. The timer should not be started.
     */
    public add(obj:Timer) {
        
        obj.onFinish = this._checkWhenOver.bind(this);
        this._timers.push(obj);
    }
    
    public start() {
        for (let obj of this._timers) {
            obj.start();
        }
    }    
}