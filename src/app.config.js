'use strict';

config.$inject = ['$routeProvider', '$mdThemingProvider'];

export default function config($routeProvider, $mdThemingProvider) {
    $routeProvider.when('/settings', {
        template: require('./components/settings/settings.html'),
        controller: 'SettingsController',
        controllerAs: 'vm'
    }).otherwise({
        redirectTo: '/settings'
    });

    $mdThemingProvider.theme('default')
        .primaryPalette('cyan', {
            'default': '500'
        })
        .accentPalette('amber', {
            'default': '500'
        });
}
