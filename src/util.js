/**
 * Created by liudan on 15/7/26.
 */
'use strict';
define(function(require, exports, module) {
    function isType(type) {
        return function(value) {
            return Object.prototype.toString.call(value) === '[object '+type+']';
        }
    }

    module.exports = {
        isObject: isType('Object'),
        isNumber: isType('Number'),
        isArray: Array.isArray ? Array.isArray : isType('Array')
    }
});
