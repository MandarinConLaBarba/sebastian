define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/views/base",
    "apps/api/util/eventManager",
    "text!apps/api/templates/nav.html"
], function(
    $,
    Backbone,
    _,
    BaseView,
    eventManager,
    theTemplate) {


    return BaseView.extend({

        template : _.template(theTemplate),

        events : {

        },

        initialize : function() {
            var self = this;
            eventManager.on("refresh-scrollspy-requested", function() {
                self.wireUpScrollSpy();
            });
        },

        render : function() {

            var json = this.options.methods.toJSON()
            this.$el.append(this.template({
                methods : json
            }));

            this.wireUpScrollSpy();

        },

        wireUpScrollSpy : function() {

            var self = this;

            eventManager.unbindScroll();

            $('.spied').each(function() {
                var position = $(this).position();
                $(this).scrollspy({
                    min: position.top,
                    max: position.top + $(this).height(),
                    onEnter: function(element, position) {
                        self.$el.find("li").removeClass("active")
                        var spyId = $(element).attr("data-spy-id");
                        self.$el.find("#spy-nav-" + spyId).addClass("active")
                    }
                });
            });


        }

    });

});