'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var animateView = require('framer-motion/animate-view');



Object.keys(animateView).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return animateView[k]; }
	});
});
