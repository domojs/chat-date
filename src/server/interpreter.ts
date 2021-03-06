import * as akala from "@akala/server";
import * as util from "util";
import * as debug from "debug";
import * as Sugar from "sugar";
import "sugar/locales/fr";

import { Context as BaseContext } from '@domojs/chat';
export interface Context extends BaseContext
{
    timeStart?: number;
    time?: Date;
    timeEnd?: number;
}

const log = akala.log('domojs:chat:date');
Sugar.Date.setLocale('fr');
akala.injectWithName(['interpreters'], function (interpreters)
{
    interpreters.push(dateInterpreter);
})();

function dateInterpreter(cmd, next, callback)
{
    var text = cmd.text;
    var timeStart = cmd.timeStart || 0;
    var relativeTimes: string[];
    relativeTimes = relativeTimes.concat(akala.map(akala.grep(Sugar.Date.getLocale()['modifiers'], function (item)
    {
        return text.indexOf(item.src, timeStart) >= 0;
    }, true), function (item) { return item.src; }));
    relativeTimes = relativeTimes.concat(akala.grep(Sugar.Date.getLocale()['months'] as string[], function (item)
    {
        return text.indexOf(item, timeStart) >= 0;
    }));
    relativeTimes = relativeTimes.concat(akala.grep(Sugar.Date.getLocale()['units'] as string[], function (item)
    {
        return text.indexOf(item, timeStart) >= 0;
    }));
    relativeTimes = relativeTimes.concat(akala.grep(Sugar.Date.getLocale()['weekdays'] as string[], function (item)
    {
        return text.indexOf(item, timeStart) >= 0;
    }));
    relativeTimes = relativeTimes.concat(akala.grep(Sugar.Date.getLocale()['tokens'] as string[], function (item)
    {
        return text.indexOf(item, timeStart) >= 0;
    }));
    if (text.indexOf(Sugar.Date.getLocale()['timeMarker'], timeStart) > -1)
        relativeTimes = relativeTimes.concat(Sugar.Date.getLocale()['timeMarker']);
    log(util.inspect(relativeTimes));
    var relativeTime = Sugar.Array.unique(akala.grep(akala.map(relativeTimes, function (relativeTime)
    {
        return text.indexOf(relativeTime, timeStart);
    }), function (item) { return item >= timeStart; }).sort(function (a, b) { return a - b; }));
    if (relativeTime.length == 0)
        return next();
    log(util.inspect(relativeTime));
    var timeEnd = 1;
    while (!cmd.time || relativeTime.length >= 1)
    {
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
        if (relativeTime.length == 1)
        {
            cmd.time = Sugar.Date.create('aujourd\'hui ' + time.replace(/h([0-5][0-9])/, ':$1'));
            if (Sugar.Date.isValid(cmd.time))
                break;
        }
        relativeTime.pop();
    }
    if (!Sugar.Date.isValid(cmd.time) && time != '' && typeof (time) != 'undefined')
    {
        log('new start');
        log(time);
        log('not understood');
        cmd.timeStart++;
        return dateInterpreter.apply(this, arguments);
    }
    cmd.text = text.substring(0, timeStart) + text.substring(timeEnd);
    log(cmd.time && cmd.time.toISOString());
    if (Sugar.Date.isPast(cmd.time))
    {
        return next('je ne peux pas remonter le temps');
    }
    cmd.deferred = true;
    next();
    if (cmd.deferred)
    {
        console.log(cmd);
        cmd.deferred = false;
        var timer = setTimeout(next, Sugar.Date.millisecondsFromNow(cmd.time));
        callback("ok, je m'en charge " + Sugar.Date.relative(cmd.time));
    }
}