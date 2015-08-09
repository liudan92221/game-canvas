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

    function merge(defaults) {
        var _obj = {};
        for(var key in defaults){
            if(module.exports.isObject(defaults[key])){
                _obj[key] = merge(defaults[key]);
            }else{
                _obj[key] = defaults[key];
            }
        }
        return _obj;
    }

    module.exports = {
        isObject: isType('Object'),
        isNumber: isType('Number'),
        isArray: Array.isArray ? Array.isArray : isType('Array'),

        merge: merge
    }
});
