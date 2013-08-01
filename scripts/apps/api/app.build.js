({
    inlineText: true,
    name : "apps/api/main",
    out : "main.built.js",
    baseUrl : "../../../scripts",
    shim : {
        "jquery-scrollspy" : {
            deps : ['jquery']
        },
        "chai" : {
            "exports" : "chai"
        },
        "sinon" : {
            "exports" : "sinon"
        },
        "sebastian-tests" : {
            deps : ['mocha']
        },
        "mocha" : {
            "exports" : "mocha",
            "init" : function() {
                mocha.setup("bdd");
            }
        }
    },
    paths: {
                "prettify" : "vendor/google-code-prettify/src/prettify",
                "sebastian" : "vendor/sebastian/sebastian",
                "sebastian-tests" : "vendor/sebastian/test/index",
                "jquery" : "vendor/jquery/jquery.min",
                "jquery-scrollspy" : "vendor/jquery-scrollspy/jquery-scrollspy",
                "backbone" : "vendor/backbone-amd/backbone-min",
                "mocha" : "vendor/mocha/mocha",
                "chai" : "vendor/chai/chai",
                "sinon" : "vendor/sinon/sinon",
                "underscore" : "vendor/underscore-amd/underscore-min",
                "text" : "vendor/requirejs-plugins/text"
            }
})