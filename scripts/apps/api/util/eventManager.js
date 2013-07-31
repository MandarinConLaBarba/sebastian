define([
    "jquery"], function($) {


    return {

        on : function(eventName, callback) {
            $('body').on(eventName, callback);
        },

        trigger : function(eventName, args) {
            $('body').trigger(eventName, args);
        },

        unbindScroll : function() {
            $(window).unbind('scroll');
        }

    };


});