/**
 * Created by liudan on 15/8/8.
 */
'use strict';
define(function(require, exports, module) {
    var events = require('./event');
    var Draw = require('./draw');

    function Canvas(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');

        this.Draw = Draw;

        this.context.globalAlpha = 1;

        this.w = canvas.width;
        this.h = canvas.height;

        var client = canvas.getBoundingClientRect();
        this.client = {
            x: client.left * (canvas.width/client.width),
            y: client.top * (canvas.height/client.height)
        };

        this.data = null;
        this.init();
    }

    Canvas.prototype.init = function() {
        this.addEvent();
    };

    Canvas.prototype.addEvent = function() {
        var _this = this;
        events.forEach(function(event) {
            _this.on(event.type, function(e) {
                event.cb.call(_this, e);
            });
        });
    };

    Canvas.prototype.getPosition = function() {
        var canvas = this.canvas;
        var client = canvas.getBoundingClientRect();
        return {
            x: client.left * (canvas.width/client.width),
            y: client.top * (canvas.height/client.height)
        };
    };

    Canvas.prototype.clientX = function() {
        return this.getPosition().x;
    };

    Canvas.prototype.clientY = function() {
        return this.getPosition().y;
    };

    Canvas.prototype.createDraw = function() {
        return new this.Draw(this.canvas, this.context);
    };

    Canvas.prototype.clear = function() {
        this.context.clearRect(0, 0, this.w, this.h);
        return this;
    };

    Canvas.prototype.resetDraw = function() {
        var Draws = this.Draw.getDraws();

        this.clear();
        for (var i = 0;i < Draws.length;i++) {
            Draws[i].resetDraw();
        }
    };

    Canvas.prototype.putData = function(imageData) {
        this.context.putImageData(imageData, 0, 0);
        return this;
    };

    Canvas.prototype.getData = function() {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };

    Canvas.prototype.saveData = function() {
        this.data = this.getData();
        return this;
    };

    Canvas.prototype.restoreData = function() {
        if (this.data) {
            this.putData(this.data);
        }
        return this;
    };

    Canvas.prototype.on = function(type, cb) {
        var _this = this;
        this.canvas.addEventListener(type, function(e) {
            e.preventDefault();
            cb.call(_this, e);
        }, false);
    };

    module.exports = Canvas;
});