define(["jquery", "sebastian"], function($, sebastian) {


    var appendMessage = function(message, timeout) {

        message = message.charAt(0).toUpperCase() + message.slice(1);

        var demoMessageContainer = $(document.createElement('div'))
            .addClass('demoMessage')
            .hide();

        var timeout = timeout ? timeout : 1,
            ret = $.Deferred(),
            self = this;
        setTimeout(function() {
            demoMessageContainer
                .addClass("alert-box radius")
                .append(message);
            self.append(demoMessageContainer);
            demoMessageContainer.fadeIn();
            ret.resolve(demoMessageContainer);
        }, timeout);

        return ret;

    };


    return {

        appendMessage : appendMessage,
        appendSuccessMessage : function(message, timeout) {
            var deferred = appendMessage.call(this, message, timeout);
            deferred.done(function(container) {
                container
                    .addClass("success");
            });

            return deferred;

        },
        appendFlowStartedMessage : function(flow, timeout) {
            var deferred = appendMessage.call(this, "flow " + flow + " started.", timeout);
            deferred.done(function(container) {
                container.addClass("flow-started secondary");
            });

            return deferred;

        },
        appendFlowCompleteMessage : function(flow, timeout) {
            var deferred = appendMessage.call(this, "flow " + flow + " complete.", timeout)
            deferred.done(function(container) {
                container.addClass("flow-complete secondary");
            });

            return deferred;

        },
        appendStepCompleteMessage : function(step, timeout) {
            var deferred = appendMessage.call(this, "step " + step + " complete.", timeout);
            deferred.done(function(container) {
                container
                    .addClass("step-complete")
                    .addClass("step-"+step+"-complete success");
            });

            return deferred;
        }


    };


});