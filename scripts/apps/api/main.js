define([
    "jquery",
    "backbone",
    "apps/api/views/app",
    "jquery-scrollspy"], function(
    $,
    backbone,
    AppView) {


    new AppView({
        el : $('body')
    }).render();


});