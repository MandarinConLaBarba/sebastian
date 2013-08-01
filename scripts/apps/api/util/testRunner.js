define([
    "jquery",
    "apps/api/examples/helper",
    "mocha",
    "sebastian-tests"], function($, helper, mocha) {


    return {

        run : function(targetElement, filter) {

            targetElement.empty();

            mocha.setup({
                grep : filter,
                reporter: function (runner) {

                    Mocha.reporters.Base.call(this, runner);

                    runner.on('start', function(){

                    });

                    runner.on('pending', function(test){

                    });

                    runner.on('pass', function(test){
                        helper.appendSuccessMessage.call(targetElement, test.fullTitle() + " passed.");
                    });

                    runner.on('fail', function(test, err){
                        helper.appendFailureMessage.call(targetElement, test.fullTitle() + " failed.");
                        helper.appendFailureMessage.call(targetElement, err);
                    });

                    runner.on('end', function(args){
                        helper.appendMessage.call(targetElement, this.stats.passes + " passes, " + this.stats.failures + " failures.");
                    });
                }
            });

            mocha.run();

        }

    };


});