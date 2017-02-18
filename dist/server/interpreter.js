"use strict";
var di = require("akala-core");
var $ = require("underscore");
var util = require("util");
var debug = require("debug");
var Sugar = require("sugar");
require("sugar/locales/fr");
var log = debug('domojs:chat:date');
Sugar.Date.setLocale('fr');
di.injectWithName(['interpreters'], function (interpreters) {
    interpreters.push(dateInterpreter);
})();
function dateInterpreter(cmd, next, callback) {
    var text = cmd.text;
    var timeStart = cmd.timeStart || 0;
    var relativeTimes = [];
    relativeTimes = relativeTimes.concat($.map($.filter(Sugar.Date.getLocale()['modifiers'], function (item) {
        return text.indexOf(item.src, timeStart) >= 0;
    }), function (item) { return item.src; }));
    relativeTimes = relativeTimes.concat($.filter(Sugar.Date.getLocale()['months'], function (item) {
        return text.indexOf(item, timeStart) >= 0;
    }));
    relativeTimes = relativeTimes.concat($.filter(Sugar.Date.getLocale()['units'], function (item) {
        return text.indexOf(item, timeStart) >= 0;
    }));
    relativeTimes = relativeTimes.concat($.filter(Sugar.Date.getLocale()['weekdays'], function (item) {
        return text.indexOf(item, timeStart) >= 0;
    }));
    relativeTimes = relativeTimes.concat($.filter(Sugar.Date.getLocale()['tokens'], function (item) {
        return text.indexOf(item, timeStart) >= 0;
    }));
    if (text.indexOf(Sugar.Date.getLocale()['timeMarker'], timeStart) > -1)
        relativeTimes = relativeTimes.concat(Sugar.Date.getLocale()['timeMarker']);
    log(util.inspect(relativeTimes));
    var relativeTime = Sugar.Array.unique($.filter($.map(relativeTimes, function (relativeTime) {
        return text.indexOf(relativeTime, timeStart);
    }), function (item) { return item >= timeStart; }).sort(function (a, b) { return a - b; }));
    if (relativeTime.length == 0)
        return next();
    log(util.inspect(relativeTime));
    var timeEnd = 1;
    while (!cmd.time || relativeTime.length >= 1) {
        timeEnd = relativeTime[relativeTime.length - 1];
        if (text.indexOf(Sugar.Date.getLocale()['timeMarker'], timeStart) == timeEnd)
            timeEnd = text.indexOf(' ', text.indexOf(' ', timeEnd) + 1) + 1;
        else
            timeEnd = text.indexOf(' ', timeEnd) + 1;
        if (relativeTime.length < 2 || timeEnd == 0)
            timeEnd = text.length + 1;
        timeStart = relativeTime[0];
        log(timeStart + ',' + timeEnd);
        var time = text.substring(timeStart, timeEnd - 1).trim();
        log(time);
        cmd.timeStart = timeStart;
        cmd.timeEnd = timeEnd;
        cmd.time = Sugar.Date.create(time.replace(/h([0-5][0-9])/, ':$1'));
        if (Sugar.Date.isValid(cmd.time))
            break;
        if (relativeTime.length == 1) {
            cmd.time = Sugar.Date.create('aujourd\'hui ' + time.replace(/h([0-5][0-9])/, ':$1'));
            if (Sugar.Date.isValid(cmd.time))
                break;
        }
        relativeTime.pop();
    }
    if (!Sugar.Date.isValid(cmd.time) && time != '' && typeof (time) != 'undefined') {
        log('new start');
        log(time);
        log('not understood');
        cmd.timeStart++;
        return dateInterpreter.apply(this, arguments);
    }
    cmd.text = text.substring(0, timeStart) + text.substring(timeEnd);
    log(cmd.time && cmd.time.toISOString());
    if (Sugar.Date.isPast(cmd.time)) {
        return next('je ne peux pas remonter le temps');
    }
    cmd.deferred = true;
    next();
    if (cmd.deferred) {
        console.log(cmd);
        cmd.deferred = false;
        var timer = setTimeout(next, Sugar.Date.millisecondsFromNow(cmd.time));
        callback("ok, je m'en charge " + Sugar.Date.relative(cmd.time));
    }
}

//# sourceMappingURL=interpreter.js.map
