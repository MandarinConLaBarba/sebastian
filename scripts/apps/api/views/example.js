define([
    "jquery",
    "backbone",
    "prettify",
    "underscore",
    "apps/api/views/base",
    "text!apps/api/templates/example.html"
], function(
    $,
    Backbone,
    prettify,
    _,
    BaseView,
    theTemplate) {


    return BaseView.extend({

        template : _.template(theTemplate),

        events : {

        },

        initialize : function() {

        },

        render : function() {


            //load the example as text
            var self = this;

            require([
                this.options.target
            ], function(exampleFlow) {
                self.example = exampleFlow.execute;
                var templateData = {
                    exampleSource : prettify.prettyPrintOne(exampleFlow.execute.toString())
                };
                self.$el.append(self.template(templateData));
            });


        },

        example : function() {
            return this.example;
        }


 });

});