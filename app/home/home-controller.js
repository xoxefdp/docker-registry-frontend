

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:HomeController
 * @description
 * # HomeController
 * Controller of the docker-registry-frontend
 */
angular.module('home-controller', ['app-mode-services'])
  .controller('HomeController', ['AppMode',
    class HomeController {
      constructor(AppMode) {
        this.appMode = AppMode.query();
      }
    }]);
