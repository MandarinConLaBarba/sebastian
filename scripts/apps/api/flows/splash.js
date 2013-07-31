define([
    "jquery",
    "sebastian",
    "underscore"], function(
    $,
    sebastian,
    _) {

    return sebastian.flow("ui.splash")
        .step("one", function() {

            this.blocks = [];
            var self = this,
                addBlock = function(num) {
                    self.blocks.push($(document.createElement('div'))
                        .append('*')
                        .addClass("splash-block splash-block-" + num)
                        .appendTo(self.$el));
                };
            this.$el.empty();

            addBlock("one");
            addBlock("two");
            addBlock("three");
            addBlock("four");

        })
        .step("two", function() {
            _.each(this.blocks.reverse(), function(block, index) {
                block.hide().fadeIn(index * 2 * 500);
            });
        })
        .delay(10000)
        .step("three", function() {
            _.each(this.blocks, function(block, index) {
                block.fadeOut(1000/(index+1), function() {
                    block.show().css('visibility', 'hidden');
                });
            });
        })
        .delay(8000);

});