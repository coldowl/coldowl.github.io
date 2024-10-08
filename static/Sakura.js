/*!
 * Sakura.js 1.1.1
 * Vanilla JS version of jQuery-Sakura: Make it rain sakura petals.
 * https://github.com/jhammann/sakura
 *
 * Copyright 2019-2022 Jeroen Hammann
 *
 * Released under the MIT License
 *
 * Released on: March 4, 2022
 */
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() { }; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Sakura = function Sakura(selector, options) {
  var _this = this;

  if (typeof selector === 'undefined') {
    throw new Error('No selector present. Define an element.');
  }

  this.el = document.querySelector(selector); // Defaults for the option object, which gets extended below.

  var defaults = {
    className: 'sakura',
    // Classname of the petal. This corresponds with the css.
    fallSpeed: 1,
    // Speed factor in which the petal falls (higher is slower).
    maxSize: 14,
    // The maximum size of the petal.
    minSize: 10,
    // The minimum size of the petal.
    delay: 300,
    // Delay between petals.
    colors: [{
      // You can add multiple colors (chosen randomly) by adding elements to the array.
      gradientColorStart: 'rgba(255, 183, 197, 0.9)',
      // Gradient color start (rgba).
      gradientColorEnd: 'rgba(255, 197, 208, 0.9)',
      // Gradient color end (rgba).
      gradientColorDegree: 120 // Gradient degree angle.

    }],
    lifeTime: 0 // Lifetime of the petal.

  }; // Merge defaults with user options.

  var extend = function extend(originalObj, newObj) {
    Object.keys(originalObj).forEach(function (key) {
      if (newObj && Object.prototype.hasOwnProperty.call(newObj, key)) {
        var origin = originalObj;
        origin[key] = newObj[key];
      }
    });
    return originalObj;
  };

  this.settings = extend(defaults, options); // Dictionary for remove the petals by timestamp + lifetime

  this.petalsWeak = new Map(); // Every sec check petals for remove (by lifeTime)

  setInterval(function () {
    if (!_this.settings.lifeTime) return;
    var keysForRemove = [];
    var stamp = Date.now();

    var _iterator = _createForOfIteratorHelper(_this.petalsWeak),
      _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
          _key = _step$value[0],
          value = _step$value[1];

        if (_key + _this.settings.lifeTime < stamp) {
          keysForRemove.push(_key);
          value.remove();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    for (var _i = 0, _keysForRemove = keysForRemove; _i < _keysForRemove.length; _i++) {
      var key = _keysForRemove[_i];

      _this.petalsWeak.delete(key);
    }
  }, 1000); // Hide horizontal scrollbars on the target element.

  this.el.style.overflowX = 'hidden'; // Random array element

  function randomArrayElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  } // Random integer


  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } // Check for animation events.


  var prefixes = ['webkit', 'moz', 'MS', 'o', ''];

  function PrefixedEvent(element, type, callback) {
    for (var p = 0; p < prefixes.length; p += 1) {
      var animType = type;

      if (!prefixes[p]) {
        animType = type.toLowerCase();
      }

      element.addEventListener(prefixes[p] + animType, callback, false);
    }
  } // Check if the element is in the viewport.


// 修改 elementInViewport 函数，加入 footer 的判断，避免花瓣堆积在 footer 上
function elementInViewport(el) {
  var rect = el.getBoundingClientRect();
  
  // 尝试获取 footer 或 div#footer 元素
  var footer = document.querySelector('footer') || document.getElementById('footer');
  
  if (footer) {
      var footerRect = footer.getBoundingClientRect();
      if (rect.bottom > footerRect.top) {
          // 花瓣接触到 footer 顶部时移除花瓣
          return false;
      }
  }
  
  return rect.top >= 0 &&
         rect.left >= 0 &&
         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
         rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}


  this.createPetal = function () {
    if (_this.el.dataset.sakuraAnimId) {
      setTimeout(function () {
        window.requestAnimationFrame(_this.createPetal);
      }, _this.settings.delay);
    } // Name the animations. These have to match the animations in the CSS file.


    var animationNames = {
      blowAnimations: ['blow-soft-left', 'blow-medium-left', 'blow-soft-right', 'blow-medium-right'],
      swayAnimations: ['sway-0', 'sway-1', 'sway-2', 'sway-3', 'sway-4', 'sway-5', 'sway-6', 'sway-7', 'sway-8']
    }; // Get one random animation of each type and randomize fall time of the petals

    var blowAnimation = randomArrayElem(animationNames.blowAnimations);
    var swayAnimation = randomArrayElem(animationNames.swayAnimations);

    var fallTime = (document.documentElement.clientHeight * 0.007 + Math.round(Math.random() * 5)) * _this.settings.fallSpeed; // Create animations


    var animationsArr = ["fall ".concat(fallTime, "s linear 0s 1"), "".concat(blowAnimation, " ").concat((fallTime > 30 ? fallTime : 30) - 20 + randomInt(0, 20), "s linear 0s infinite"), "".concat(swayAnimation, " ").concat(randomInt(2, 4), "s linear 0s infinite")];
    var animations = animationsArr.join(', '); // Create petal and give it a random size.

    var petal = document.createElement('div');
    petal.classList.add(_this.settings.className);
    var height = randomInt(_this.settings.minSize, _this.settings.maxSize);
    var width = height - Math.floor(randomInt(0, _this.settings.minSize) / 3); // Get a random color.

    var color = randomArrayElem(_this.settings.colors);
    petal.style.background = "linear-gradient(".concat(color.gradientColorDegree, "deg, ").concat(color.gradientColorStart, ", ").concat(color.gradientColorEnd, ")");
    petal.style.webkitAnimation = animations;
    petal.style.animation = animations;
    petal.style.borderRadius = "".concat(randomInt(_this.settings.maxSize, _this.settings.maxSize + Math.floor(Math.random() * 10)), "px ").concat(randomInt(1, Math.floor(width / 4)), "px");
    petal.style.height = "".concat(height, "px");
    // 修改 createPetal 函数中花瓣的生成范围，避免 left 值溢出导致抖动
    petal.style.left = Math.random() * (document.documentElement.clientWidth - _this.settings.maxSize) + "px"; 
    petal.style.marginTop = "".concat(-(Math.floor(Math.random() * 20) + 15), "px");
    petal.style.width = "".concat(width, "px"); // Remove petals of which the animation ended.

    PrefixedEvent(petal, 'AnimationEnd', function () {
      if (!elementInViewport(petal)) {
        petal.remove();
      }
    }); // Remove petals that float out of the viewport.

    PrefixedEvent(petal, 'AnimationIteration', function () {
      if (!elementInViewport(petal)) {
        petal.remove();
      }
    }); // Added petals in weakMap by stamp

    _this.petalsWeak.set(Date.now(), petal); // Add the petal to the target element.


    _this.el.appendChild(petal);
  };

  this.el.setAttribute('data-sakura-anim-id', window.requestAnimationFrame(this.createPetal));
};

Sakura.prototype.start = function () {
  var animId = this.el.dataset.sakuraAnimId;

  if (!animId) {
    this.el.setAttribute('data-sakura-anim-id', window.requestAnimationFrame(this.createPetal));
  } else {
    throw new Error('Sakura is already running.');
  }
};

Sakura.prototype.stop = function () {
  var _this2 = this;

  var graceful = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var animId = this.el.dataset.sakuraAnimId;

  if (animId) {
    window.cancelAnimationFrame(animId);
    this.el.setAttribute('data-sakura-anim-id', '');
  } // Remove all current blossoms at once.
  // You can also set 'graceful' to true to stop new petals from being created.
  // This way the petals won't be removed abruptly.


  if (!graceful) {
    setTimeout(function () {
      var petals = document.getElementsByClassName(_this2.settings.className);

      while (petals.length > 0) {
        petals[0].parentNode.removeChild(petals[0]);
      }
    }, this.settings.delay + 50);
  }
};

function loadResource(type, attributes) {
  if (type === 'style') {
    const style = document.createElement('style');
    style.textContent = attributes.css;
    document.head.appendChild(style);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const css = `@-webkit-keyframes fall {
  0% {
    opacity: 0.9;
    top: 0; }
  100% {
    opacity: 0.2;
    top: 100%; } }

@keyframes fall {
  0% {
    opacity: 0.9;
    top: 0; }
  100% {
    opacity: 0.2;
    top: 100%; } }

@-webkit-keyframes blow-soft-left {
  0% {
    margin-left: 0; }
  100% {
    margin-left: -50%; } }

@keyframes blow-soft-left {
  0% {
    margin-left: 0; }
  100% {
    margin-left: -50%; } }

@-webkit-keyframes blow-medium-left {
  0% {
    margin-left: 0; }
  100% {
    margin-left: -100%; } }

@keyframes blow-medium-left {
  0% {
    margin-left: 0; }
  100% {
    margin-left: -100%; } }

@-webkit-keyframes blow-soft-right {
  0% {
    margin-left: 0; }
  100% {
    margin-left: 50%; } }

@keyframes blow-soft-right {
  0% {
    margin-left: 0; }
  100% {
    margin-left: 50%; } }

@-webkit-keyframes blow-medium-right {
  0% {
    margin-left: 0; }
  100% {
    margin-left: 100%; } }

@keyframes blow-medium-right {
  0% {
    margin-left: 0; }
  100% {
    margin-left: 100%; } }

@-webkit-keyframes sway-0 {
  0% {
    -webkit-transform: rotate(-5deg);
    transform: rotate(-5deg); }
  40% {
    -webkit-transform: rotate(28deg);
    transform: rotate(28deg); }
  100% {
    -webkit-transform: rotate(3deg);
    transform: rotate(3deg); } }

@keyframes sway-0 {
  0% {
    -webkit-transform: rotate(-5deg);
    transform: rotate(-5deg); }
  40% {
    -webkit-transform: rotate(28deg);
    transform: rotate(28deg); }
  100% {
    -webkit-transform: rotate(3deg);
    transform: rotate(3deg); } }

@-webkit-keyframes sway-1 {
  0% {
    -webkit-transform: rotate(10deg);
    transform: rotate(10deg); }
  40% {
    -webkit-transform: rotate(43deg);
    transform: rotate(43deg); }
  100% {
    -webkit-transform: rotate(15deg);
    transform: rotate(15deg); } }

@keyframes sway-1 {
  0% {
    -webkit-transform: rotate(10deg);
    transform: rotate(10deg); }
  40% {
    -webkit-transform: rotate(43deg);
    transform: rotate(43deg); }
  100% {
    -webkit-transform: rotate(15deg);
    transform: rotate(15deg); } }

@-webkit-keyframes sway-2 {
  0% {
    -webkit-transform: rotate(15deg);
    transform: rotate(15deg); }
  40% {
    -webkit-transform: rotate(56deg);
    transform: rotate(56deg); }
  100% {
    -webkit-transform: rotate(22deg);
    transform: rotate(22deg); } }

@keyframes sway-2 {
  0% {
    -webkit-transform: rotate(15deg);
    transform: rotate(15deg); }
  40% {
    -webkit-transform: rotate(56deg);
    transform: rotate(56deg); }
  100% {
    -webkit-transform: rotate(22deg);
    transform: rotate(22deg); } }

@-webkit-keyframes sway-3 {
  0% {
    -webkit-transform: rotate(25deg);
    transform: rotate(25deg); }
  40% {
    -webkit-transform: rotate(74deg);
    transform: rotate(74deg); }
  100% {
    -webkit-transform: rotate(37deg);
    transform: rotate(37deg); } }

@keyframes sway-3 {
  0% {
    -webkit-transform: rotate(25deg);
    transform: rotate(25deg); }
  40% {
    -webkit-transform: rotate(74deg);
    transform: rotate(74deg); }
  100% {
    -webkit-transform: rotate(37deg);
    transform: rotate(37deg); } }

@-webkit-keyframes sway-4 {
  0% {
    -webkit-transform: rotate(40deg);
    transform: rotate(40deg); }
  40% {
    -webkit-transform: rotate(68deg);
    transform: rotate(68deg); }
  100% {
    -webkit-transform: rotate(25deg);
    transform: rotate(25deg); } }

@keyframes sway-4 {
  0% {
    -webkit-transform: rotate(40deg);
    transform: rotate(40deg); }
  40% {
    -webkit-transform: rotate(68deg);
    transform: rotate(68deg); }
  100% {
    -webkit-transform: rotate(25deg);
    transform: rotate(25deg); } }

@-webkit-keyframes sway-5 {
  0% {
    -webkit-transform: rotate(50deg);
    transform: rotate(50deg); }
  40% {
    -webkit-transform: rotate(78deg);
    transform: rotate(78deg); }
  100% {
    -webkit-transform: rotate(40deg);
    transform: rotate(40deg); } }

@keyframes sway-5 {
  0% {
    -webkit-transform: rotate(50deg);
    transform: rotate(50deg); }
  40% {
    -webkit-transform: rotate(78deg);
    transform: rotate(78deg); }
  100% {
    -webkit-transform: rotate(40deg);
    transform: rotate(40deg); } }

@-webkit-keyframes sway-6 {
  0% {
    -webkit-transform: rotate(65deg);
    transform: rotate(65deg); }
  40% {
    -webkit-transform: rotate(92deg);
    transform: rotate(92deg); }
  100% {
    -webkit-transform: rotate(58deg);
    transform: rotate(58deg); } }

@keyframes sway-6 {
  0% {
    -webkit-transform: rotate(65deg);
    transform: rotate(65deg); }
  40% {
    -webkit-transform: rotate(92deg);
    transform: rotate(92deg); }
  100% {
    -webkit-transform: rotate(58deg);
    transform: rotate(58deg); } }

@-webkit-keyframes sway-7 {
  0% {
    -webkit-transform: rotate(72deg);
    transform: rotate(72deg); }
  40% {
    -webkit-transform: rotate(118deg);
    transform: rotate(118deg); }
  100% {
    -webkit-transform: rotate(68deg);
    transform: rotate(68deg); } }

@keyframes sway-7 {
  0% {
    -webkit-transform: rotate(72deg);
    transform: rotate(72deg); }
  40% {
    -webkit-transform: rotate(118deg);
    transform: rotate(118deg); }
  100% {
    -webkit-transform: rotate(68deg);
    transform: rotate(68deg); } }

@-webkit-keyframes sway-8 {
  0% {
    -webkit-transform: rotate(94deg);
    transform: rotate(94deg); }
  40% {
    -webkit-transform: rotate(136deg);
    transform: rotate(136deg); }
  100% {
    -webkit-transform: rotate(82deg);
    transform: rotate(82deg); } }

@keyframes sway-8 {
  0% {
    -webkit-transform: rotate(94deg);
    transform: rotate(94deg); }
  40% {
    -webkit-transform: rotate(136deg);
    transform: rotate(136deg); }
  100% {
    -webkit-transform: rotate(82deg);
    transform: rotate(82deg); } }

.sakura {
  pointer-events: none;
  position: absolute; }
`;
  loadResource('style', { css: css });
  var sakura = new Sakura('body', {
    colors: [
      {
        gradientColorStart: 'rgba(255, 183, 197, 0.9)',
        gradientColorEnd: 'rgba(255, 197, 208, 0.9)',
        gradientColorDegree: 120,
      },
      {
        gradientColorStart: 'rgba(255,189,255)',
        gradientColorEnd: 'rgba(227,170,181)',
        gradientColorDegree: 120,
      },
      {
        gradientColorStart: 'rgba(2,152,163)',
        gradientColorEnd: 'rgba(200,185,196)',
        gradientColorDegree: 120,
      },
    ],
    maxSize: 20,
  });
});
