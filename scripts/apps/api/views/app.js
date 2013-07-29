define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/models/method",
    "apps/api/views/method"], function($, Backbone, _, MethodModel, MethodView) {

    return Backbone.View.extend({

        events : {

        },

        initialize : function() {},

        render : function() {
            var self = this;

            $.getJSON("doc.json")
                .then(function(comments) {
                    //create new method view for each comment..
                    _.chain(comments)
                        .sortBy(function(comment) {
                            if (comment.ctx.cons &&
                                comment.ctx.cons === "execution") {
                                return 1;
                            };
                            return -1;
                        })
                        .each(function(comment) {
                            var method = new MethodModel(comment),
                                methodContainer = $(document.createElement('div'))
                                    .addClass("methodContainer");

                            self.$el.append(methodContainer);

                            if (["waterfall", "step", "parallel"].indexOf(method.get("ctx").name) > -1) {
                                method.set("examples", [
                                    "apps/api/examples/" + method.get("ctx").name
                                ]);
                            }

                            new MethodView({
                                model : method,
                                el : methodContainer
                            }).render();
                        });

                });

        }

    });



});