var _ = require('lodash');

function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

function errorHandler(step, error) {
    console.dir(error);
    console.log(error.stack);
}

_.extend(module.exports, {
    'toArray': toArray,
    'errorHandler': errorHandler
});
