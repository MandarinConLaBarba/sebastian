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
                    executable : example.executable,
                    target : example.path,
                    el : exampleContainer
                });

                exampleView.render();

                self.exampleViews.push(exampleView);

            });

            this.$el.find('.btnRunExamplePanel').hide();
            this.$el.find('.panel.demo').hide();

            if (this.exampleViews &&
                this.exampleViews.length &&
                this.exampleViews[0].options.executable) {
                this.$el.find('.btnRunExamplePanel').show();
                this.$el.find('.panel.demo').show();
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
                this.exampleViews.length &&
                this.exampleViews[0].options.executable) {

                var demoContainer = this.$el.find('.demo'),
                    flow = this.exampleViews[0].flow();
                demoContainer.empty();


                var direct = ["examples.context"];

                if (direct.indexOf(flow.name) > -1) {
                    this.runFlowDirectly(flow, demoContainer);
                } else {
                    this.runFlowViaExecution(flow, demoContainer);
                }

            }
        },

        runFlowViaExecution : function(flow, demoContainer) {

            var executor = flow.create();

            executor.context({ $el : demoContainer});
            exampleHelper.appendFlowStartedMessage.call(demoContainer, executor.flow.name)
            var execution = executor.execute();

            execution.done(function() {
                exampleHelper.appendFlowCompleteMessage.call(demoContainer, executor.flow.name)
            });


        },

        runFlowDirectly : function(flow, demoContainer) {

            //TODO: fix this...this is nasty
            flow.ctx.$el = demoContainer;

            var deferred = flow.begin();

            deferred.done(function() {
                exampleHelper.appendFlowCompleteMessage.call(demoContainer, flow.name)
            });
        }

    });

});