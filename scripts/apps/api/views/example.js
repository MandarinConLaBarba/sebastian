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
                this.options.target,
                "text!" + this.options.target + ".js"
            ], function(exampleFlow, exampleSource) {
                self.exampleFlow = exampleFlow;
                var templateData = {
                    exampleSource : prettify.prettyPrintOne(exampleSource)
                };
                self.$el.append(self.template(templateData));
            });


        },

        flow : function() {
            return this.exampleFlow;
        }


 });

});