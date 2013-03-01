require.config({
    "baseUrl" : "/base",
    "paths" : {
        "jquery" : "vendor/jquery/jquery",
        "chai" : "vendor/chai/chai",
        "underscore" : "vendor/underscore-amd/underscore",
        "sinon" : "vendor/sinon/sinon",
        "sebastian" : "sebastian"
    },
    "shim" : {
        "chai" : {
            "exports" : "chai"
        },
        "sinon" : {
            "exports" : "sinon"
        }
    },
    deps : ["test/index"],
    callback : function() {
        window.__testacular__.start();
    }

});
