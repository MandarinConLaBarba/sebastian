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
                    _.each(comments, function(comment) {
                        var method = new MethodModel(comment);
                        var methodContainer = $(document.createElement('div'))
                            .addClass("methodContainer");

                        self.$el.append(methodContainer);

                        new MethodView({
                            model : method,
                            el : methodContainer
                        }).render();
                    });

                });

        }

    });



});