/**
 * Created by liudan on 15/8/8.
 */
'use strict';
define(function(require, exports, module) {
    var util = require('./util');
    var isObject = util.isObject;
    var isArray = util.isArray;
    var isNumber = util.isNumber;
    var isFunction = util.isFunction;

    var Base = require('./base');

    var Draws = [];

    function Draw(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.base = new Base(this.context);

        this.draws = [];
        this.path = [];
        this.event = null;

        Draws.push(this);
    }

    Draw.getDraws = function() {
        return Draws;
    };

    Draw.getUUID = function() {
        var s = '';
        var hexDigits = "0123456789abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 36; i++) {
            s += hexDigits.charAt(Math.floor(Math.random() * 36));
        }
        return s;
    };

    Draw.prototype.clear = function() {
        this.draws = [];

        return this;
    };

    Draw.prototype.set = function(type, obj, path, uuid) {
        var draws = this.draws;
        if (uuid) {
            var item = null;
            for (var i = 0;i < draws.length;i++) {
                item = draws[i];
                if (item.id === uuid) {
                    item.type = type;
                    item.obj = obj;
                    item.path = path;
                    item.name = obj.name || null;
                    break;
                }
            }
        } else {
            uuid = Draw.getUUID();
            this.draws.push({
                id: uuid,
                type: type,
                obj: obj,
                path: path,
                name: obj.name || null
            });
        }
        return this;
    };

    //判断点是否在该对象上
    Draw.prototype.isPointInPath = function(x, y) {
        var context = this.context;
        var base = this.base;
        var draws = this.draws;
        var item = null;

        context.save();
        context.beginPath();

        for (var i = 0;i < draws.length;i++) {
            item = draws[i];
            base[item.type].apply(base, item.path);
        }

        context.closePath();
        context.restore();
        return context.isPointInPath(x, y);
    };

    //判断点是否在该对象上的一部分上
    Draw.prototype.isPointInPathByName = function(name, x, y) {
        var context = this.context;
        var base = this.base;
        var draws = this.draws;
        var item = null;

        context.save();
        context.beginPath();

        for (var i = 0;i < draws.length;i++) {
            item = draws[i];
            if (item.name === name) {
                base[item.type].apply(base, item.path);
            }
        }

        context.closePath();
        context.restore();
        return context.isPointInPath(x, y);
    };

    /**
     *  画圆
     *  @param position {object}
     *      - left: {number}  向左移动
     *      - right: {number}  向右移动
     *      - top: {number}  向上移动
     *      - bottom: {number}  向下移动
     */
    Draw.prototype.move = function(position) {
        if (!isObject(position)) {
            throw 'move param is error';
        }
        var draws = this.draws;
        var item = null;
        var point = null;

        var left = position.left || 0;
        var right = position.right || 0;
        var top = position.top || 0;
        var bottom = position.bottom || 0;
        var x = right - left;
        var y = bottom - top;

        if (!x && !y) {
            return this;
        }

        for (var i = 0;i < draws.length;i++) {
            item = draws[i].obj;
            point = item.point;
            if (isArray(point)) {
                for (var j = 0;j < point.length;i++) {
                    point[j].x += x;
                    point[j].y += y;
                }
            } else {
                point.x += x;
                point.y += y;
            }

            if (item.controlPoints && isArray(item.controlPoints)) {
                var controlPoints = item.controlPoints;
                for (var j = 0;j < controlPoints.length;i++) {
                    controlPoints[j].x += x;
                    controlPoints[j].y += y;
                }
            }
        }

        return this;
    };

    Draw.prototype.setDraw = function(name, obj) {
        var draws = this.draws;
        var item = null;

        for (var i = 0;i < draws.length;i++) {
            item = draws[i];
            if (item.name === name) {
                for (var key in obj) {
                    if (hasOwnProperty.call(obj, key)) {
                        item.obj[key] = obj[key];
                    }
                }
            }
        }

        return this;
    };

    //重绘
    Draw.prototype.resetDraw = function() {
        var draws = this.draws;
        for (var i = 0;i < draws.length;i++) {
            this[draws[i].type](draws[i].obj, draws[i].id);
        }

        return this;
    };

    /**
     *  画矩形
     *  @param obj {object}
     *      - point: {x: 0, y: 0} 必传
     *      - width: {number} 必传
     *      - height: {number} 必传
     *      - type: 'stroke|fill'
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.rect = function(obj, uuid) {
        if (!isObject(obj) || !isObject(obj.point) || !isNumber(obj.width) || !isNumber(obj.height)) {
            throw 'rect param is error';
        }
        var base = this.base;
        var context = this.context;
        var x = obj.point.x;
        var y = obj.point.y;
        var w = obj.width;
        var h = obj.height;
        var paramArr = [x, y, w, h, obj.transform];

        context.save();

//        this.clip('rect', paramArr);
        context.globalCompositeOperation = obj.globalCompositeOperation || 'source-over';
//        context.globalCompositeOperation = 'source-atop';
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);


        base.rect(x, y, w, h, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('rect', obj, paramArr, uuid);
        return this;
    };

    /**
     *  画圆
     *  @param obj {object}
     *      - point: {x: 0, y: 0} 必传
     *      - radius: {number} 必传
     *      - width: {number}
     *      - radian: {start: 0, end: Math.PI},
     *      - type: 'stroke|fill',
     *      - clockwise: {boolean} false顺时针，true逆时针
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.arc = function(obj, uuid) {
        if (!isObject(obj) || !isObject(obj.point) || !isNumber(obj.radius)) {
            throw 'arc param is error';
        }
        var base = this.base;
        var context = this.context;
        var x = obj.point.x;
        var y = obj.point.y;
        var r = obj.radius;
        var startPI = (obj.radian && obj.radian.start) ? obj.radian.start : 0;
        var endPI = (obj.radian && obj.radian.end) ? obj.radian.end : Math.PI*2;

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.arc(x, y, r, startPI, endPI, !!obj.clockwise, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('arc', obj, [x, y, r, startPI, endPI, !!obj.clockwise, obj.transform], uuid);
        return this;
    };

    /**
     *  画圆角矩形
     *  @param obj {object}
     *      - point: {x: 0, y: 0} 必传
     *      - width: {number} 必传
     *      - height: {number} 必传
     *      - radius: [0,0,0,0] | 0,
     *      - type: 'stroke|fill'
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.roundRect = function(obj, uuid) {
        if (!isObject(obj) || !isObject(obj.point) || !isNumber(obj.width) || !isNumber(obj.height)) {
            throw 'roundRect param is error';
        }
        var base = this.base;
        var context = this.context;
        var x = obj.point.x;
        var y = obj.point.y;
        var w = obj.width;
        var h = obj.height;
        var w2 = w/2;
        var h2 = h/2;
        var r = isNumber(obj.radius) ? [obj.radius
            ,obj.radius
            ,obj.radius
            ,obj.radius] : isArray(obj.radius) ? obj.radius : [0,0,0,0];

        for (var i = 0;i < 4;i++) {
            r[i] = Math.min(w2, h2, r[i]);
        }

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.roundRect(x, y, w, h, r, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('roundRect', obj, [x, y, w, h, r, obj.transform], uuid);
        return this;
    };

    /**
     *  画线框
     *  @param obj {object}
     *      - point: [    必传
     *          {x:0,y:0}
     *      ]
     *      - type: 'stroke|fill',
     *      - closePath: {boolean} 是否闭合路径
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.lineFrame = function(obj, uuid) {
        if (!isArray(obj.point) || !obj.point.length) {
            throw 'lineFrame param is error';
        }
        var base = this.base;
        var context = this.context;
        var point = obj.point;

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.lineFrame(point, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('lineFrame', obj, [point, obj.transform], uuid);
        return this;
    };

    /**
     *  画多边形
     *  @param obj {object}
     *      - point: {x: 0, y: 0} 必传
     *      - radius: {number} 必传
     *      - sides: {number}
     *      - startAngle: 0 | Math.PI
     *      - type: 'stroke|fill'
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.polygon = function(obj, uuid) {
        if (!isObject(obj) || !isObject(obj.point) || !isNumber(obj.radius)) {
            throw 'polygon param is error';
        }
        var base = this.base;
        var context = this.context;
        var centerX = obj.point.x;
        var centerY = obj.point.y;
        var radius = obj.radius;
        var points = [];
        var sides = (isNumber(obj.sides) && obj.sides > 2) ? obj.sides : 3;
        var angle = obj.startAngle || 0;
        var itemAngle = 2*Math.PI/sides;

        for(var i = 0;i < sides;i++) {
            points.push({
                x: centerX +radius * Math.sin(angle),
                y: centerY -radius * Math.cos(angle)
            });
            angle += itemAngle;
        }
        obj.closePath = true;

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.polygon(points, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('polygon', obj, [points, obj.transform], uuid);
        return this;
    };

    /**
     *  画线段
     *  @param obj {object}
     *      - point: [
     *          {x:0,y:0},
     *          {x:0,y:0}
     *      ]
     *
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.line = function(obj, uuid) {
        if (!isArray(obj.point) || obj.point.length < 2) {
            throw 'line param is error';
        }
        var base = this.base;
        var context = this.context;
        var point = [
            {x: obj.point[0].x, y: obj.point[0].y},
            {x: obj.point[1].x, y: obj.point[1].y}
        ];

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.line(point, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('line', obj, [point, obj.transform], uuid);
        return this;
    };

    /**
     *  画虚线
     *  @param obj {object}
     *      - point: [
     *          {x:0,y:0},
     *          {x:0,y:0}
     *      ]
     *      - gap: {number}
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.dashedLine = function(obj, uuid) {
        if (!isArray(obj.point) || obj.point.length < 2) {
            throw 'dashedLine param is error';
        }
        var base = this.base;
        var context = this.context;
        var gap = isNumber(obj.gap) ? obj.gap : 10;


        var startX = obj.point[0].x;
        var startY = obj.point[0].y;
        var endX = obj.point[1].x;
        var endY = obj.point[1].y;

        var deltaX = endX - startX;
        var deltaY = endY - startY;

        var dasheNum = Math.floor(Math.sqrt(deltaX*deltaX + deltaY*deltaY) / gap);
        var itemX = deltaX / dasheNum;
        var itemY = deltaY / dasheNum;

        var points = [];

        for (var i = 0; i < dasheNum; i++) {
            points.push({
                type: i % 2 === 0 ? 'moveTo' : 'lineTo',
                x: startX + itemX * i,
                y: startY + itemY * i
            });
        }
        points.push({
            type: 'lineTo',
            x: endX,
            y: endY
        });

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.dashedLine(points, obj.transform);

        context.stroke();
        context.restore();
        this.set('dashedLine', obj, [points, obj.transform], uuid);
        return this;
    };

    /**
     *  画贝塞尔曲线
     *  @param obj {object}
     *      - point: [
     *          {x:0,y:0},
     *          {x:0,y:0}
     *      ]
     *      - controlPoints: {array}, 必传
     *         [
     *           {x:0,y:0}
     *         ]
     *  @param uuid {string} 绘画id
     */
    Draw.prototype.bezier = function(obj, uuid) {
        if (!isArray(obj.point) || obj.point.length < 2
            || !isArray(obj.controlPoints) || !obj.controlPoints.length) {
            throw 'bezier param is error';
        }
        var base = this.base;
        var context = this.context;

        context.save();
        context.beginPath();

        base._setStyle(obj.style, obj.shadow);

        base.bezier(obj.point[0].x, obj.point[0].y, obj.point[1].x, obj.point[1].y,
            obj.controlPoints, obj.transform);

        base._draw(obj);

        context.restore();
        this.set('bezier', obj, [obj.point[0].x, obj.point[0].y, obj.point[1].x, obj.point[1].y,
            obj.controlPoints, obj.transform], uuid);
        return this;
    };

    /**
     *  裁减
     *  @param type {string}
     *  @param path {array}
     */
    Draw.prototype.clip = function(type, path) {
        var context = this.context;
        var base = this.base;

        if (isFunction(base[type])) {
//            context.save();
            context.beginPath();
            base[type].apply(base, path);

            context.closePath();
            context.clip();

//            context.restore();
        }
    };

    Draw.prototype.on = function(type, cb) {
        this.event = this.event ? this.event : {};

        if (this.event[type] && isArray(this.event[type])) {
            this.event[type].push(cb);
        } else {
            this.event[type] = [cb];
        }

        return this;
    };

    module.exports = Draw;
});