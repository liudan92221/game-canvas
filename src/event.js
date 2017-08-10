/**
 * Created by liudan on 15/7/27.
 */
'use strict';
define(function(require, exports, module) {
    var fns = [
        {
            type: 'mousedown',
            cb: function(e) {
                var _this = this;
                var Draws = this.Draw.getDraws();
                Draws.forEach(function(item) {
                    if (item.event && item.event['mousedown'] && item.event['mousedown'].length) {
                        var client = _this.getPosition();
                        var x = e.clientX - client.x;
                        var y = e.clientY - client.y;

                        if (item.isPointInPath(x, y)) {
                            item.event['mousedown'].forEach(function(cb) {
                                cb.call(item, e);
                            });
                        }
                    }
                });
            }
        },
        {
            type:'mouseup',
            cb: function() {

            }
        },
        {
            type: 'mousemove',
            cb: function() {

            }
        },
        {
            type: 'mouseover',
            cb: function() {

            }
        },
        {
            type: 'mouseenter',
            cb: function() {

            }
        }
    ];

    module.exports = fns;
});
