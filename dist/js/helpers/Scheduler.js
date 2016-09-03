/**
 * This objects take some animations, and notify its owner when all animations are over
 */
var Scheduler = (function () {
    function Scheduler() {
        // A set of timers to look after
        this._timers = [];
        // The number of ms waited afdter running the final callback
        this.finishDelay = 0;
        // The number of finished animations. If this number is equals to the length of _animatable, the callback
        // function is called. 
        this._numberOfFinishedAnimations = 0;
    }
    Scheduler.prototype._checkWhenOver = function () {
        this._numberOfFinishedAnimations++;
        if (this._numberOfFinishedAnimations === this._timers.length) {
            // Finish !
            setTimeout(this.whenAllOver.bind(this), this.finishDelay);
        }
    };
    /**
     * Add a timer to the pool. The timer should not be started.
     */
    Scheduler.prototype.add = function (obj) {
        obj.onFinish = this._checkWhenOver.bind(this);
        this._timers.push(obj);
    };
    Scheduler.prototype.start = function () {
        for (var _i = 0, _a = this._timers; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.start();
        }
    };
    return Scheduler;
}());
//# sourceMappingURL=Scheduler.js.map