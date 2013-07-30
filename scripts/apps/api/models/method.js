define(["backbone"], function(Backbone) {


    return Backbone.Model.extend({

        initialize : function() {

            var ctx = this.get("ctx"),
                parent = ctx.cons ? ctx.cons : "flow";

            this.set("fullName", parent + "." + ctx.name + "()");
            this.set("safeFullName", this.get("fullName").replace(/[\.\(\)]/g,'-'));

        }

    });


});