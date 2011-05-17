var utils = exports;

utils.extend = extend;

function extend(options, source) {
    for (var prop in source) {
        if (source[prop] !== void 0) options[prop] = source[prop];
    }

    return options;
}
