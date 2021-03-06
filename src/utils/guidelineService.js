'use strict';

const $ = require('jquery');
const _ = require('lodash');

class GuidelineService {
  constructor(opts) {
    this.root = opts.root;
    this.canvas = opts.canvas;
    this.dom = null;
    this.cxt = null;

    this.isActive = false;

    this.limitNum = opts.limitNum;
    this.theme = {
      lineColor: '#9fd1ff',
      lineWidth: 1
    };
  }
  create(options) {
    this.theme = _.merge(this.theme, options.theme || {});

    this.canvasHeight = $(this.root).height();
    this.canvasWidth = $(this.root).width();

    this.dom = $('<div class="butterfly-gird-canvas-wrapper"></div>');

    this.guideLineCanvas = $('<canvas class="butterfly-guideline-canvas"></canvas>')[0];
    $(this.guideLineCanvas).attr('width', this.canvasWidth);
    $(this.guideLineCanvas).attr('height', this.canvasHeight);
    $(this.guideLineCanvas).appendTo(this.dom);

    $(this.dom).appendTo(this.root);

    this.cxt = this.guideLineCanvas.getContext('2d');
    this.cxt.strokeStyle = this.theme.lineColor || '#000';
    this.cxt.lineWidth = this.theme.lineWidth || 1;
    this.isActive = true;
  }

  draw(item, type) {

    this.cxt.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    let _left = item.left;
    let _right = item.left + item.getWidth();
    let _top = item.top;
    let _bottom = item.top + item.getHeight();
    let _leftDis = Infinity;
    let _rightDis = Infinity;
    let _topDis = Infinity;
    let _bottomDis = Infinity;

    let _leftItem = null;
    let _rightItem = null;
    let _topItem = null;
    let _bottomItem = null;

    let groups = this.canvas.groups;
    let nodes = this.canvas.nodes;
    groups.forEach((_group) => {
      if (type === 'group' && item.id === _group.id) {
        return;
      }

      let _groupLeft = _group.left;
      let _groupRight = _group.left + _group.getWidth();
      let _groupTop = _group.top;
      let _groupBottom = _group.top + _group.getHeight();

      // 向左对齐的元素
      if (_left === _groupLeft) {
        if (Math.abs(_groupTop - _top) < _topDis) {
          _topDis = Math.abs(_groupTop - _top);
          _leftItem = _group;
        }
      }

      // 向右对齐的元素
      if (_right === _groupRight) {
        if (Math.abs(_groupBottom - _bottom) < _bottomDis) {
          _bottomDis = Math.abs(_groupBottom - _bottom);
          _rightItem = _group;
        }
      }

      // 向上对齐的元素
      if (_top === _groupTop) {
        if (Math.abs(_groupLeft - _left) < _leftDis) {
          _leftDis = Math.abs(_groupLeft - _left);
          _topItem = _group;
        }
      }

      // 向下对齐的元素
      if (_bottom === _groupBottom) {
        if (Math.abs(_groupRight - _right) < _rightDis) {
          _rightDis = Math.abs(_groupRight - _right);
          _bottomItem = _group;
        }
      }
    });

    nodes.forEach((_node) => {
      if (type === 'node' && item.id === _node.id) {
        return;
      }

      let _nodeLeft = _node.left;
      let _nodeRight = _node.left + _node.getWidth();
      let _nodeTop = _node.top;
      let _nodeBottom = _node.top + _node.getHeight();

      if (_node._group) {
        _nodeLeft += _node._group.left;
        _nodeRight += _node._group.left;
        _nodeTop += _node._group.top;
        _nodeBottom += _node._group.top;
      }

      // 向左对齐的元素
      if (_left === _nodeLeft) {
        if (Math.abs(_nodeTop - _top) < _topDis) {
          _topDis = Math.abs(_nodeTop - _top);
          _leftItem = _node;
        }
      }

      // 向右对齐的元素
      if (_right === _nodeRight) {
        if (Math.abs(_nodeBottom - _bottom) < _bottomDis) {
          _bottomDis = Math.abs(_nodeBottom - _bottom);
          _rightItem = _node;
        }
      }

      // 向上对齐的元素
      if (_top === _nodeTop) {
        if (Math.abs(_nodeLeft - _left) < _leftDis) {
          _leftDis = Math.abs(_nodeLeft - _left);
          _topItem = _node;
        }
      }

      // 向下对齐的元素
      if (_bottom === _nodeBottom) {
        if (Math.abs(_nodeRight - _right) < _rightDis) {
          _rightDis = Math.abs(_nodeRight - _right);
          _bottomItem = _node;
        }
      }
    });

    if (_leftItem) {
      let startY = _top > _leftItem.top ? _leftItem.top : _top;
      let endY = _top > _leftItem.top ? _bottom : _leftItem.top + _leftItem.getHeight();
      this.cxt.beginPath();
      this.cxt.moveTo(_left, startY);
      this.cxt.lineTo(_left, endY);
      this.cxt.stroke();
      this.cxt.closePath();
    }

    if (_rightItem) {
      let startY = _top > _rightItem.top ? _rightItem.top : _top;
      let endY = _top > _rightItem.top ? _bottom : _rightItem.top + _rightItem.getHeight();
      this.cxt.beginPath();
      this.cxt.moveTo(_right, startY);
      this.cxt.lineTo(_right, endY);
      this.cxt.stroke();
      this.cxt.closePath();
    }

    if (_topItem) {
      let startX = _left > _topItem.left ? _topItem.left : _left;
      let endX = _left > _topItem.left ? _right : _topItem.left + _topItem.getWidth();
      this.cxt.beginPath();
      this.cxt.moveTo(startX, _top);
      this.cxt.lineTo(endX, _top);
      this.cxt.stroke();
      this.cxt.closePath();
    }

    if (_bottomItem) {
      let startX = _left > _bottomItem.left ? _bottomItem.left : _left;
      let endX = _left > _bottomItem.left ? _right : _bottomItem.left + _bottomItem.getWidth();
      this.cxt.beginPath();
      this.cxt.moveTo(startX, _bottom);
      this.cxt.lineTo(endX, _bottom);
      this.cxt.stroke();
      this.cxt.closePath();
    }
  }
  zoom(scale) {
    $(this.dom).css({
      transform: `scale(${scale})`
    });
    this.clearCanvas();
  }
  move(x, y) {
    $(this.dom)
      .css('left', x)
      .css('top', y);
    this.clearCanvas();
  }
  clearCanvas() {
    this.cxt && this.cxt.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }
  destroy() {
    $(this.dom).destroy();
    this.isActive = false;
  }
}

module.exports = GuidelineService;
