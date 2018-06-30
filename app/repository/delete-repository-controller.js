

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:DeleteRepositoryController
 * @description
 * # DeleteRepositoryController
 * Controller of the docker-registry-frontend
 */
angular.module('delete-repository-controller', ['registry-services'])
  .controller('DeleteRepositoryController', ['$route', '$modalInstance', '$window', 'Repository', 'items', 'information',
    class DeleteRepositoryController {
      constructor($route, $modalInstance, $window, Repository, items, information) {
        this.items = items;
        this.information = information;
        this.$route = $route;
        this.$modalInstance = $modalInstance;
        this.$window = $window;
        this.Repository = Repository;
      }

      // Callback that triggers deletion of tags and reloading of page
      ok() {
        angular.forEach(this.items, (value) => {
          const repoStr = value;
          const repoUser = value.split('/')[0];
          const repoName = value.split('/')[1];

          const repo = {
            repoUser,
            repoName,
          };

          this.Repository.delete(
            repo,
            // success
            () => toastr.success(`Deleted repository: ${repoStr}`),
            // error
            (httpResponse) => {
              toastr.error(`Failed to delete repository: ${repoStr} Response: ${httpResponse.statusText}`);
            },
          );
        });

        this.$modalInstance.close();

        // Go to the repositories page
        this.$window.location.href = 'repositories';
        this.$route.reload();
      }

      cancel() {
        this.$modalInstance.dismiss('cancel');
      }
    }]);
