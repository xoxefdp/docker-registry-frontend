

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:DeleteRepositoryController
 * @description
 * # DeleteRepositoryController
 * Controller of the docker-registry-frontend
 */
angular.module('delete-repository-controller', ['registry-services'])
  .controller('DeleteRepositoryController', ['$scope', '$route', '$modalInstance', '$window', 'Repository', 'items', 'information',
    function ($scope, $route, $modalInstance, $window, Repository, items, information) {
      $scope.items = items;
      $scope.information = information;

      // Callback that triggers deletion of tags and reloading of page
      $scope.ok = () => {
        angular.forEach($scope.items, (value) => {
          const repoStr = value;
          const repoUser = value.split('/')[0];
          const repoName = value.split('/')[1];

          const repo = {
            repoUser,
            repoName,
          };

          Repository.delete(
            repo,
            // success
            () => {
              toastr.success(`Deleted repository: ${repoStr}`);
            },
            // error
            (httpResponse) => {
              toastr.error(`Failed to delete repository: ${repoStr} Response: ${httpResponse.statusText}`);
            },
          );
        });

        $modalInstance.close();

        // Go to the repositories page
        $window.location.href = 'repositories';
        $route.reload();
      };

      $scope.cancel = () => {
        $modalInstance.dismiss('cancel');
      };
    }]);
