define([
    "jquery",
    "backbone",
    "underscore",
    "apps/api/views/base",
    "text!apps/api/templates/nav.html"
], function(
    $,
    Backbone,
    _,
    BaseView,
    theTemplate) {


    return BaseView.extend({

        template : _.template(theTemplate),

        events : {

        },

        render : function() {

            var json = this.options.methods.toJSON()
            this.$el.append(this.template({
                methods : json
            }));


            var self = this;

            $('.spied').each(function() {
                var position = $(this).position();
                $(this).scrollspy({
                    min: position.top,
                    max: position.top + $(this).height(),
                    onEnter: function(element, position) {
                        self.$el.find("li").removeClass("active")
                        var spyId = $(element).attr("data-spy-id");
                        self.$el.find("#spy-nav-" + spyId).addClass("active")
                    },
                    onLeave: function(element, position) {


                    }
                });
            });


        }

    });

});