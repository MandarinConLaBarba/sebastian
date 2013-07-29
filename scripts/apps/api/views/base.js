define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/models/method",
    "apps/api/views/method"], function($, Backbone, _, MethodModel, MethodView) {

    return Backbone.View.extend({

        show : function() {
            this.$el.show();
        }

    });



});