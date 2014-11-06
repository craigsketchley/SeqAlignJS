var defined = require('./defined.js');

/**
 * Returns the parameter if defined, else uses the fallback.
 * 
 * @param  {[type]} param    [description]
 * @param  {[type]} fallback [description]
 * @return {[type]}          [description]
 */
var defaultVal = function(param, fallback) {
    return defined(param) ? param : fallback;
};

module.exports = defaultVal;