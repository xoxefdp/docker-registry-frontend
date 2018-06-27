

function getCurrentLastRepository(params) {
  return [
    params.lastNamespace,
    params.lastRepository,
  ].filter(p => !!p)
    .join('\\');
}

function getNumberOfReposPerPage(params) {
  return params.reposPerPage
    ? parseInt(params.reposPerPage, 10)
    : undefined;
}

function buildQueryObject() {
  const queryObject = {};

  if (this.reposPerPage) {
    queryObject.n = this.reposPerPage;
  }

  if (this.currentLastRepository) {
    queryObject.last = `${this.currentLastRepository}`;
  }

  return queryObject;
}
/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:RepositoryListController
 * @description
 * # RepositoryListController
 * Controller of the docker-registry-frontend
 */
angular.module('repository-list-controller', ['ngRoute', 'ui.bootstrap', 'registry-services', 'app-mode-services'])
  .controller('RepositoryListController', ['$scope', '$route', '$location', '$uibModal', 'Repository', 'AppMode',
    ($scope, $route, $location, $uibModal, Repository, AppMode) => {
      $scope.appMode = AppMode.query();

      $scope.reposPerPage = getNumberOfReposPerPage($route.current.params) || $scope.reposPerPage;
      $scope.currentLastRepository = getCurrentLastRepository($route.current.params);
      const queryObject = buildQueryObject.call($scope);

      $scope.repositories = Repository.query(queryObject);

      // selected repos
      $scope.selectedRepositories = [];

      // helper method to get selected tags
      $scope.selectedRepos = () => filterFilter($scope.repositories.repos, { selected: true });

      $scope.page = (num) => {
        $location.path(`repositories/${num}/${$scope.currentLastRepository}`);
      };

      $scope.nextPage = () => {
        if (!$scope.isLastPage) {
          $location.path(`/repositories/${$scope.reposPerPage}/${$scope.repositories.lastRepository}`);
        }
      };

      $scope.previousPage = () => {
        if (!$scope.isFirstPage) {
          $location.path(`repositories/${$scope.reposPerPage}`);
        }
      };

      // Watch repos for changes
      // To watch for changes on a property inside the object "repositories"
      // we first have to make sure the promise is ready.
      $scope.repositories.$promise.then((data) => {
        $scope.repositories = data;

        $scope.isLastPage = !data.lastRepository;
        $scope.isFirstPage = !$scope.currentLastRepository;
        $scope.$watch('repositories.repos|filter:{selected:true}', (nv) => {
          $scope.selectedRepositories = nv.map(repo => repo.name);
        }, true);
      });

      $scope.openConfirmRepoDeletionDialog = (size) => {
        $uibModal.open({
          animation: true,
          templateUrl: 'modalConfirmDeleteItems.html',
          controller: 'DeleteRepositoryController',
          size,
          resolve: {
            items() {
              return $scope.selectedRepositories;
            },
            information() {
              return `A repository is a collection of tags.
                      A tag is basically a reference to an image.
                      If no references to an image exist, the image will be scheduled for automatic deletion.
                      That said, if you remove a tag, you remove a reference to an image.
                      Your image data may get lost, if no other tag references it.
                      If you delete a repository, you delete all tags associated with it.
                      Are you sure, you want to delete the following repositories?`;
            },
          },
        });
      };
    }]);
