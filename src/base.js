/**
 * Created by liudan on 15/7/26.
 */
define(function(require, exports, module) {
    var util = require('./util');
    var isObject = util.isObject;
    var isArray = util.isArray;
    var isNumber = util.isNumber;

    function Base(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.w = canvas.width;
        this.h = canvas.height;

        var client = canvas.getBoundingClientRect();
        this.client = {
            x: client.left * (canvas.width/client.width),
            y: client.top * (canvas.height/client.height)
        };

        this.data = null;
    }

    Base.prototype.clear = function() {
        this.context.clearRect(0, 0, this.w, this.h);
        return this;
    };

    Base.prototype.putData = function(imageData) {
        this.context.putImageData(imageData, 0, 0);
        return this;
    };

    Base.prototype.getData = function() {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };

    Base.prototype.saveData = function() {
        this.data = this.getData();
        return this;
    };

    Base.prototype.restoreData = function() {
        if (this.data) {
            this.putData(this.data);
        }
        return this;
    };

    /**
     *  画矩形
     *  @param obj {object}
     *      - point: {x: 0, y: 0} 必传
     *      - width: {number} 必传
     *      - height: {number} 必传
     *      - type: 'stroke|fill',
     *      - style: {
     *          color: '', '#00000'
     *          gradient: {
     *
     *          }
     *      }
     *      - shadow: {
     *          - color: {string}
     *          - offsetX: {number}
     *          - offsetY: {number}
     *          - blur: {number}
     *      }
     */
    Base.prototype.rect = function(obj) {
        if (!isObject(obj) || !isObject(obj.point) || !isNumber(obj.width) || !isNumber(obj.height)) {
            throw 'rect param is error';
        }
        var context = this.context;
        var x = obj.point.x;
        var y = obj.point.y;
        var w = obj.width;
        var h = obj.height;
        var style = isObject(obj.style) ? obj.style : {};

        context.save();
        context.beginPath();
        context.strokeStyle = style.color ? style.color : '';
        context.fillStyle = style.color ? style.color : '';

        if (isObject(obj.shadow)) {
            this._shadow(obj.shadow);
        }

        context.rect(x, y, w, h);
        if (obj.type === 'fill') {
            context.fill();
        } else {
            context.stroke();
        }

        context.restore();

        return this;
    };

    /**
     *  画圆
     *  @param obj {object}
     *      - point: {x: 0, y: 0} 必传
     *      - width: {number} 必传
     *      - height: {number} 必传
     *      - type: 'stroke|fill',
     *      - style: {
     *          color: '', '#00000'
     *          gradient: {
     *
     *          }
     *      }
     *      - shadow: {
     *          - color: {string}
     *          - offsetX: {number}
     *          - offsetY: {number}
     *          - blur: {number}
     *      }
     */
    Base.prototype.arc = function(obj) {

    };

    /**
     *  画线框
     *  @param obj {object}
     *      - points: [    必传
     *          [x, y]
     *      ]
     *      - type: 'stroke|fill',
     *      - closePath: {boolean} 是否闭合路径
     *      - width: {number}
     *      - style: {
     *          color: '', '#00000'
     *          gradient: {
     *
     *          }
     *      }
     *      - shadow: {
     *          - color: {string}
     *          - offsetX: {number}
     *          - offsetY: {number}
     *          - blur: {number}
     *      }
     */
    Base.prototype.lineFrame = function(obj) {
        if (!isArray(obj.points) || !obj.points.length) {
            throw 'lineFrame param is error';
        }

        var context = this.context;
        var points = obj.points;
        var style = isObject(obj.style) ? obj.style : {};
        var lineWidth = obj.width || 0.5;

        context.save();
        context.beginPath();

        context.lineWidth = lineWidth;
        context.strokeStyle = style.color ? style.color : '';
        context.fillStyle = style.color ? style.color : '';

        if (isObject(obj.shadow)) {
            this._shadow(obj.shadow);
        }

        context.moveTo(points[0][0], points[0][1]);
        for (var i = 1;i < points.length;i++) {
            context.lineTo(points[i][0], points[i][1]);
        }

        if (obj.type === 'fill') {
            context.closePath();
            context.fill();
        } else if (obj.type === 'all') {
            context.closePath();
            context.fill();
            context.stroke();
        } else {
            if (obj.closePath) context.closePath();
            context.stroke();
        }

        context.restore();
        return this;
    };

    /**
     *  画线段
     *  @param obj {object}
     *      - points: [    必传
     *          [x, y]
     *      ]
     *      - width: {number}
     *      - style: {
     *          color: '', '#00000'
     *          gradient: {
     *
     *          }
     *      }
     *      - shadow: {
     *          - color: {string}
     *          - offsetX: {number}
     *          - offsetY: {number}
     *          - blur: {number}
     *      }
     */
    Base.prototype.line = function(obj) {
        if (!isArray(obj.points) || obj.points.length <= 1) {
            throw 'line param is error';
        }

        obj.points = obj.points.slice(0, 2);

        this.lineFrame(obj);
        return this;
    };

    /**
     *  画虚线
     *  @param obj {object}
     *      - points: [    必传
     *          [x, y]
     *      ]
     *      - width: {number}
     *      - gap: {number}
     *      - style: {
     *          color: '', '#00000'
     *          gradient: {
     *
     *          }
     *      }
     *      - shadow: {
     *          - color: {string}
     *          - offsetX: {number}
     *          - offsetY: {number}
     *          - blur: {number}
     *      }
     */
    Base.prototype.dashedLine = function(obj) {
        if (!isArray(obj.points) || obj.points.length <= 1) {
            throw 'dashedLine param is error';
        }

        var gap = isNumber(obj.gap) ? obj.gap : 10;
        var context = this.context;

        var lineWidth = obj.width;
        var style = isObject(obj.style) ? obj.style : {};

        var startX = obj.points[0][0];
        var startY = obj.points[0][1];
        var endX = obj.points[1][0];
        var endY = obj.points[1][1];

        var deltaX = endX - startX;
        var deltaY = endY - startY;

        var dasheNum = Math.floor(Math.sqrt(deltaX*deltaX + deltaY*deltaY) / gap);
        var itemX = deltaX / dasheNum;
        var itemY = deltaY / dasheNum;

        context.save();
        context.beginPath();

        context.lineWidth = lineWidth;
        context.strokeStyle = style.color ? style.color : '';

        for (var i = 0; i < dasheNum; i++) {
            context[i % 2 === 0 ? 'moveTo' : 'lineTo'](startX + itemX * i, startY + itemY * i);
        }
        context.lineTo(endX, endY);
        context.stroke();
        context.restore();
        return this;
    };

    /**
     *  画阴影
     *  @param shadow {object}
     *      - color: {string}
     *      - offsetX: {number}
     *      - offsetY: {number}
     *      - blur: {number}
     */
    Base.prototype._shadow = function(shadow) {
        var context = this.context;
        context.shadowColor = shadow.color;
        context.shadowOffsetX = shadow.offsetX || 0;
        context.shadowOffsetY = shadow.offsetY || 0;
        context.shadowBlur = shadow.blur || 0;
    };

    Base.prototype.on = function(type, cb) {
        var _this = this;
        this.canvas.addEventListener(type, function(e) {
            e.preventDefault();
            cb.call(_this, e);
        }, false);
    };

    module.exports = Base;
});
