define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/views/example",
    "apps/api/examples/helper",
    "apps/api/util/eventManager",
    "text!apps/api/templates/method.html"
], function(
    $,
    Backbone,
    _,
    ExampleView,
    exampleHelper,
    eventManager,
    theTemplate) {


    return Backbone.View.extend({

        template : _.template(theTemplate),

        events : {
            "click .btnShowDocPanel" : "showDocPanel",
            "click .btnShowExamplePanel" : "showExamplePanel",
            "click .btnRunExamplePanel" : "showDemoPanel"
        },

        initialize : function() {

        },

        render : function() {
            this.$el.attr("data-spy-id", this.model.get("safeFullName"));
            this.$el.append(this.template(this.model.toJSON()));
            this.showPanel(null, ".doc");

            var self = this;

            this.exampleViews = [];

            var exampleContainer = $(document.createElement('div'))
                .addClass("example")
                .addClass("panel");
            self.$el.find(".exampleList")
                .append(exampleContainer);

            _.each(this.model.get("examples"), function(example) {
                var exampleView = new ExampleView({
                    target : example.path,
                    el : exampleContainer
                });

                exampleView.render();

                self.exampleViews.push(exampleView);

            });

            this.$el.find('.btnShowExamplePanel').hide();
            this.$el.find('.btnRunExamplePanel').hide();
            this.$el.find('.panel.demo').hide();

            if (this.exampleViews &&
                this.exampleViews.length) {
                this.$el.find('.btnShowExamplePanel').show();
                this.$el.find('.btnRunExamplePanel').show();
            }

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

            this.showPanel(e, '.exampleList');

            if (this.exampleViews) {
                _.each(this.exampleViews, function(view) {
                    view.show();
                });
            }

        },

        showDemoPanel : function(e) {

            this.showPanel(e, '.demo');

            if (this.exampleViews &&
                this.exampleViews.length) {

                var demoContainer = this.$el.find('.demo'),
                    demo = this.exampleViews[0].flow();
                demoContainer.empty();

                this.runFlowDirectly(demo, demoContainer);

            }
        },


        runFlowDirectly : function(demo, demoContainer) {

            exampleHelper.appendFlowStartedMessage.call(demoContainer, demo.name)

            var deferred = demo.call(this, demoContainer);

            deferred.done(function() {
                exampleHelper.appendFlowCompleteMessage.call(demoContainer, demo.name);
                //trigger this after a second, allowing the demo div container to
                //expand before resetting the scrollspy dimensions
                setTimeout(function() {
                    eventManager.trigger('refresh-scrollspy-requested');
                }, 1000);
            });
        }

    });

});