import * as di from 'akala-core';
import * as $ from 'underscore';
import * as va from '../../../chat';
import * as eachAsync from 'each-async';
import * as vm from 'vm';
import * as url from 'url';
import * as path from 'path';
import * as ajax from 'ajax-request-wrapper';
var debug = require('debug')('domojs:chat');

di.injectWithName(['language'], function (language: va.Language)
{
    language.name = 'date';
    language.path = path.resolve(__dirname, './interpreter');
    console.log(language.path);
    language.register();
})();
