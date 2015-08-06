/**
 * Created by liudan on 15/7/27.
 */
'use strict';
define(function(require, exports, module) {
    var util = require('./util');
    var isObject = util.isObject;

    function extend(sub, _super) {
        if (!isObject(_super)) {
            return sub;
        }

        for (var key in _super) {
            if (hasOwnProperty.call(_super, key) && !sub[key]) {
                sub[key] = _super[key];
            }
        }
        return sub;
    }

    module.exports = extend;
});