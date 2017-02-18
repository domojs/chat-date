"use strict";
var di = require("akala-core");
var path = require("path");
var debug = require('debug')('domojs:chat');
di.injectWithName(['language'], function (language) {
    language.name = 'date';
    language.path = path.resolve(__dirname, './interpreter');
    console.log(language.path);
    language.register();
})();

//# sourceMappingURL=index.js.map
