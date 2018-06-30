

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:MainController
 * @description
 * # MainController
 * Controller of the docker-registry-frontend
 */
angular.module('main-controller', ['ngRoute', 'app-version-services', 'registry-services'])
  .controller('MainController', ['$route', '$routeParams', '$location', 'AppVersion', 'RegistryHost',
    class MainController {
      constructor($route, $routeParams, $location, AppVersion, RegistryHost) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;
        this.appVersion = AppVersion.query();
        this.registryHost = RegistryHost.query();
      }
    }]);
