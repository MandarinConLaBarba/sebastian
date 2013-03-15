define([
    "jquery",
    "backbone",
    "underscore",
    "text!apps/api/templates/method.html"
], function(
    $,
    Backbone,
    _,
    theTemplate) {


    return Backbone.View.extend({

        template : _.template(theTemplate),

        events : {
            "click .btnShowDocPanel" : "showDocPanel",
            "click .btnShowExamplePanel" : "showExamplePanel",
            "click .btnShowTestPanel" : "showTestPanel"
        },

        initialize : function() {

        },

        render : function() {

            console.log(this.model.attributes);

            this.$el.append(this.template(this.model.toJSON()));
            this.showPanel(null, ".doc");

        },

        hidePanels : function()  {
            this.$el.find('.panel').hide();
        },

        showPanel : function(e, classSelector) {
            if (e) {
                e.preventDefault();
                //remove active state from other tabs
                this.$el.find('.sub-nav').children().removeClass('active');
                //add active state to tab just clicked
                $(e.target).parent().addClass('active');
            }
            //hide other panels
            this.hidePanels();
            //show panel just selected
            this.$el.find(".panel" + classSelector).show();

        },

        showDocPanel : function(e) {

            this.showPanel(e, '.doc');

        },

        showExamplePanel : function(e) {

            this.showPanel(e, '.example');
        },

        showTestPanel : function(e) {
            this.showPanel(e, '.test');
        }

    });

});