define(["jquery", "backbone", "apps/api/views/app"], function($, backbone, AppView) {


    new AppView({
        el : $('#apiMethodContainer')
    }).render();


});