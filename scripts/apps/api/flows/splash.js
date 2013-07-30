define([
    "jquery",
    "sebastian",
    "underscore"], function(
    $,
    sebastian,
    _) {

    var flow = sebastian.flow("ui.splash")
        .step("one", function() {

            this.blocks = [];
            var self = this,
                block = function(num) {
                self.blocks.push($(document.createElement('div'))
                    .addClass("splash-block splash-block-" + num)
                    .css("width", (self.blocks.length + 1) * 10)
                    .appendTo(self.$el));
            };
            this.$el.empty();

            block("one");
            block("two");
            block("three");
            block("four");

        })
        .step("two", function() {
            _.each(this.blocks.reverse(), function(block, index) {
                block.hide().fadeIn(index * 2 * 500);
            });
        })
        .delay(5000)
        .step("three", function() {
            _.each(this.blocks, function(block, index) {
                block.fadeOut(1000/(index+1), function() {
                    block.show().css('visibility', 'hidden');
                });
            });
        })
        .delay(2000);


    return flow;

});