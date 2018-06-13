'use strict';

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:ImageController
 * @description
 * # ImageController
 * Controller of the docker-registry-frontend
 */
angular.module('image-controller', ['registry-services', 'app-mode-services'])
  .controller('ImageController', ['$scope', '$route', '$routeParams', '$location', '$log', '$filter', 'Manifest', 'Blob', 'AppMode',
  function($scope, $route, $routeParams, $location, $log, $filter, Manifest, Blob, AppMode){


    $scope.appMode = AppMode.query();
    Manifest.query({repository: $scope.repository, tagName: $scope.tagName})
      .$promise.then(function(data) {
        $scope.imageDetails = angular.copy(data);

        return !data.isSchemaV2
          ? undefined
          : Blob.query({repository: $scope.repository, digest: 'sha256:'+data.id})
            .$promise.then(function(config) {
              $scope.imageDetails.created = config.created;
              $scope.imageDetails.docker_version = config.docker_version;
              $scope.imageDetails.os = config.os;
              $scope.imageDetails.architecture = config.architecture;
              $scope.imageDetails.labels = config.container_config && config.container_config.Labels;
              $scope.imageDetails.dockerfile = config.dockerfile;
              $scope.imageDetails.layers = config.dockerfile.length;

              $scope.totalImageSize = $scope.imageDetails.size;
            });
      });



    /**
     * Calculates the total download size for the image based on
     * it's layers.
     */
    $scope.calculateTotalImageSize = function() {
      $scope.totalImageSize = 0;
      angular.forEach($scope.imageDetails.fsLayers, function (id, key) {
        Blob.querySize({repository: $scope.repository, digest: id.blobSum})
          .$promise.then(function(data){
            if(!isNaN(data.contentLength-0)){
              $scope.totalImageSize += data.contentLength;
            }
          });
      });
    };
  }]);
