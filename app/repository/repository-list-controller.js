

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
    class RepositoryListController {
      constructor($scope, $route, $location, $uibModal, Repository, AppMode) {
        this.appMode = AppMode.query();

        this.$location = $location;
        this.$uibModal = $uibModal;
        // this.filterFilter = filterFilter;

        this.reposPerPage = getNumberOfReposPerPage($route.current.params) || this.reposPerPage;
        this.currentLastRepository = getCurrentLastRepository($route.current.params);
        const queryObject = buildQueryObject.call(this);

        // this.repositories = { repos: [] };
        this.repositories = Repository.query(queryObject);

        // selected repos
        this.selectedRepositories = [];

        // Watch repos for changes
        // To watch for changes on a property inside the object "repositories"
        // we first have to make sure the promise is ready.
        this.repositories.$promise.then((data) => {
          this.repositories = data;

          this.isLastPage = !data.lastRepository;
          this.isFirstPage = !this.currentLastRepository;
          // $scope.$watch('repositories.repos|filter:{selected:true}', (nv) => {
          //   this.selectedRepositories = nv.map(repo => repo.name);
          // }, true);

          $scope.$watch(() => this.repositories.repos.filter(r => r.selected), (nv) => {
            this.selectedRepositories = nv.map(repo => repo.name);
          }, true);
        });
      }

      // helper method to get selected tags
      selectedRepos() {
        return this.filterFilter(this.repositories.repos, { selected: true });
      }

      page(num) {
        this.$location.path(`repositories/${num}/${this.currentLastRepository}`);
      }

      nextPage() {
        if (!this.isLastPage) {
          this.$location.path(`/repositories/${this.reposPerPage}/${this.repositories.lastRepository}`);
        }
      }

      previousPage() {
        if (!this.isFirstPage) {
          this.$location.path(`repositories/${this.reposPerPage}`);
        }
      }

      openConfirmRepoDeletionDialog(size) {
        this.$uibModal.open({
          animation: true,
          templateUrl: 'modalConfirmDeleteItems.html',
          controller: 'DeleteRepositoryController',
          size,
          resolve: {
            items() {
              return this.selectedRepositories;
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
      }
    }]);
