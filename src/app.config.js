'use strict';

config.$inject = ['$routeProvider'];

export default function config($routeProvider) {
    $routeProvider.when('/home', {
        template: require('./components/home/home.html'),
        controller: 'HomeController',
        controllerAs: 'vm'
    }).when('/settings', {
        template: require('./components/settings/settings.html'),
        controller: 'SettingsController',
        controllerAs: 'vm'
    }).otherwise({
        redirectTo: '/home'
    });
}
