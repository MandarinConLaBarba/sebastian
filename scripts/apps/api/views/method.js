define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/views/example",
    "apps/api/examples/helper",
    "text!apps/api/templates/method.html"
], function(
    $,
    Backbone,
    _,
    ExampleView,
    exampleHelper,
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
                    target : example,
                    el : exampleContainer
                });

                exampleView.render();

                self.exampleViews.push(exampleView);

            })

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

            if (this.exampleViews && this.exampleViews.length) {
                var executor = this.exampleViews[0].flow().create(),
                    demoContainer = this.$el.find('.demo');
                demoContainer.empty();

                executor.context({ $el : demoContainer});
                exampleHelper.appendFlowStartedMessage.call(demoContainer, executor.flow.name)
                var execution = executor.execute();

                execution.done(function() {
                    exampleHelper.appendFlowCompleteMessage.call(demoContainer, executor.flow.name)
                });

            }
        }

    });

});