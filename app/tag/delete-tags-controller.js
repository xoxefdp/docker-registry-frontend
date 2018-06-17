

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:DeleteTagsController
 * @description
 * # DeleteTagsController
 * Controller of the docker-registry-frontend
 */
angular.module('delete-tags-controller', ['registry-services'])
  .controller('DeleteTagsController', ['$scope', '$route', '$modalInstance', '$window', 'Manifest', 'items', 'information',
    ($scope, $route, $modalInstance, $window, Manifest, items, information) => {
      $scope.items = items;
      $scope.information = information;

      // Callback that triggers deletion of tags and reloading of page
      $scope.ok = () => {
        angular.forEach($scope.items, (value) => {
          const repository = value.split(':')[0];
          const tagName = value.split(':')[1];

          Manifest.query({
            repository,
            tagName,
          }).$promise.then((data) => {
            Manifest.delete({
              repository,
              digest: data.digest,
            }).$promise.then(() => {
              $window.location.href = `/repository/${repository}`;
            });
          });
        });
        $modalInstance.close();
      };

      $scope.cancel = () => {
        $modalInstance.dismiss('cancel');
      };
    }]);
