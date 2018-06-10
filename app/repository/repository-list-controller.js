'use strict';


function getCurrentLastRepository(params) {
  return [
    params.lastNamespace,
    params.lastRepository
  ].filter(function(p) {
    return !!p;
  })
  .join('\\');
}

function getNumberOfReposPerPage(params) {
  return params.reposPerPage
    ? parseInt(params.reposPerPage, 10)
    : undefined;
}

function buildQueryObject() {
  var queryObject = {};

  if (this.reposPerPage) {
    queryObject['n'] = this.reposPerPage;
  }

  if (this.currentLastRepository) {
    queryObject['last'] = ''+this.currentLastRepository;
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
  .controller('RepositoryListController', ['$scope', '$route', '$location', '$modal', 'Repository', 'AppMode',
  function($scope, $route, $location, $modal, Repository, AppMode){
    var queryObject;

    $scope.appMode = AppMode.query();

    $scope.reposPerPage = getNumberOfReposPerPage($route.current.params) || $scope.reposPerPage;
    $scope.currentLastRepository = getCurrentLastRepository($route.current.params);
    queryObject = buildQueryObject.call($scope);

    $scope.repositories = Repository.query(queryObject);

    // selected repos
    $scope.selectedRepositories = [];

    // helper method to get selected tags
    $scope.selectedRepos = function selectedRepos() {
      return filterFilter($scope.repositories.repos, { selected: true });
    };

    $scope.page = function(num){
      $location.path("repositories/" + num + "/" + $scope.currentLastRepository);
    }

    $scope.nextPage = function() {
      if (!$scope.isLastPage) {
        $location.path("/repositories/" + $scope.reposPerPage + "/" + $scope.repositories.lastRepository)
      }
    }

    $scope.previousPage = function() {
      if (!$scope.isFirstPage) {
        $location.path("repositories/" + $scope.reposPerPage);
      }
    }

    // Watch repos for changes
    // To watch for changes on a property inside the object "repositories"
    // we first have to make sure the promise is ready.
    $scope.repositories.$promise.then(function(data) {
      $scope.repositories = data;

      $scope.isLastPage = !data.lastRepository;
      $scope.isFirstPage = !$scope.currentLastRepository;
      $scope.$watch('repositories.repos|filter:{selected:true}', function(nv) {
        $scope.selectedRepositories = nv.map(function (repo) {
          return repo.name;
        });
      }, true);
    });

    $scope.openConfirmRepoDeletionDialog = function(size) {
      var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'modalConfirmDeleteItems.html',
          controller: 'DeleteRepositoryController',
          size: size,
          resolve: {
            items: function () {
              return $scope.selectedRepositories;
            },
            information: function() {
              return 'A repository is a collection of tags. \
                      A tag is basically a reference to an image. \
                      If no references to an image exist, the image will be scheduled for automatic deletion. \
                      That said, if you remove a tag, you remove a reference to an image. \
                      Your image data may get lost, if no other tag references it. \
                      If you delete a repository, you delete all tags associated with it. \
                      Are you sure, you want to delete the following repositories?';
            }
          }
      });
    };

  }]);
