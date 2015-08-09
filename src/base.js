/**
 * Created by liudan on 15/7/26.
 */
'use strict';
define(function(require, exports, module) {
    var util = require('./util');
    var isObject = util.isObject;
//    var isArray = util.isArray;
//    var isNumber = util.isNumber;

//    var Graphical = require('./graphical');

    function Base(context) {
        this.context = context;
    }

    /**
     *  画矩形
     */
    Base.prototype.rect = function(x, y, w, h) {
        this.context.rect(x, y, w, h);
    };

    /**
     *  画圆
     */
    Base.prototype.arc = function(x, y, r, startPI, endPI, clockwise) {
        this.context.arc(x, y, r, startPI, endPI, clockwise);
    };

    /**
     *  画圆角矩形
     */
    Base.prototype.roundRect = function(x, y, w, h, r) {
        var context = this.context;

        context.moveTo(x, y+r[0]);
        context.arcTo(x, y, x+r[0], y, r[0]);
        context.arcTo(x+w, y, x+w, y+r[1], r[1]);
        context.arcTo(x+w, y+h, x+w-r[2], y+h, r[2]);
        context.arcTo(x, y+h, x, y+h-r[3], r[3]);
        context.lineTo(x, y+r[0]);
    };

    /**
     *  画线框
     */
    Base.prototype.lineFrame = function(points) {
        var context = this.context;

        context.moveTo(points[0].x, points[0].y);
        for (var i = 1;i < points.length;i++) {
            context.lineTo(points[i].x, points[i].y);
        }
    };

    /**
     *  画多边形
     */
    Base.prototype.polygon = function(points) {
        this.lineFrame(points);
    };

    /**
     *  画线段
     */
    Base.prototype.line = function(points) {
        this.lineFrame(points);
    };

    /**
     *  画虚线
     */
    Base.prototype.dashedLine = function(points) {
        var context = this.context;
        for (var i = 0; i < points.length; i++) {
            context[points[i].type](points[i].x, points[i].y);
        }
    };

    /**
     *  画贝塞尔曲线
     */
    Base.prototype.bezier = function(startX, startY, endX, endY, controlPoints) {
        var context = this.context;

        context.moveTo(startX, startY);
        if (controlPoints.length === 1) {
            context.quadraticCurveTo(controlPoints[0].x, controlPoints[0].y,
                endX, endY);
        } else {
            context.bezierCurveTo(controlPoints[0].x, controlPoints[0].y,
                controlPoints[1].x, controlPoints[1].y,
                endX, endY);
        }
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
        if (isObject(shadow)) {
            var context = this.context;
            context.shadowColor = shadow.color;
            context.shadowOffsetX = shadow.offsetX || 0;
            context.shadowOffsetY = shadow.offsetY || 0;
            context.shadowBlur = shadow.blur || 0;
        }
    };

    /**
     *  设置样式
     *  @param style {object}
     *      - color: '', '#00000',
     *      - lineWidth: {number}
     *      - gradient: {}
     *  @param shadow {object}
     */
    Base.prototype._setStyle = function(style, shadow) {
        var context = this.context;
        style = isObject(style) ? style : {};

        context.lineWidth = style.lineWidth || 0.5;
        context.strokeStyle = style.color ? style.color : '';
        context.fillStyle = style.color ? style.color : '';

        this._shadow(shadow);
    };

    Base.prototype._draw = function(obj) {
        var context = this.context;
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
