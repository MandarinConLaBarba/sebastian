var dox = require("dox"),
    ejs = require("ejs"),
    $ = require("jquery-deferred"),
    request = require("request"),
    sebastian = require("sebastian"),
    fs = require('fs');


sebastian.flow("flows.generate.gh-page")
    .step("fetch-local-sebastian-js", function() {
        return fs.readFileSync("./scripts/vendor/sebastian/sebastian.js").toString();
    })
    .step("generate-jsdoc-annotations", function(sebastianRawJs) {

        return dox.parseComments(sebastianRawJs);

    })
    .step("get-public-method-comments", function(comments) {

        return comments.filter(function(comment) {
            if (!comment.ctx || comment.isPrivate || comment.ignore) {
                return false;
            }

            return true;
        });

    })
    .step("pre-process-method-comments", function(comments) {
        var parents = ["onFailure", "onSuccess"];
        var reformattedComments = comments.filter(function(comment) {
            return parents.indexOf(comment.ctx.name) === -1;
        });

        reformattedComments = reformattedComments.map(function(comment) {
            if (comment.ctx.receiver === "onFailureOptions") {
                comment.ctx.name = "onFailure()." + comment.ctx.name;
            }

            if (comment.ctx.receiver === "onSuccessOptions") {
                comment.ctx.name = "onSuccess()." + comment.ctx.name;
            }

            comment.params = comment.tags.filter(function(tag) {
                return tag.type === "param";
            });

            return comment;
        });

        return reformattedComments;

    })
    .step("render-json", function(comments) {

        fs.writeFileSync(__dirname + "/doc.json", JSON.stringify(comments));

    })
    .begin();





