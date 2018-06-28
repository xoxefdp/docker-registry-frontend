

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:CreateTagController
 * @description
 * # CreateTagController
 * Controller of the docker-registry-frontend
 */
angular.module('create-tag-controller', ['registry-services', 'app-mode-services'])
  .controller('CreateTagController', ['$scope', '$route', '$routeParams', '$location', '$log', '$filter', '$window', 'Tag', 'Repository', 'AppMode',
    function ($scope, $route, $routeParams, $location, $log, $filter, $window, Tag, Repository, AppMode) {
      $scope.imageId = $route.current.params.imageId;
      $scope.repositoryUser = $route.current.params.repositoryUser;
      $scope.repositoryName = $route.current.params.repositoryName;

      $scope.master = {};

      $scope.repositories = Repository.query();
      $scope.appMode = AppMode.query();

      $scope.tag = {
        repoUser: $scope.repositoryUser,
        repoName: $scope.repositoryName,
      };
      $scope.selectRepo = (repoStr) => {
        const res = repoStr.split('/');
        $scope.tag.repoUser = res[0];
        $scope.tag.repoName = res[1];
      };

      $scope.doCreateTag = (tag) => {
        const tagStr = `${tag.repoUser}/${tag.repoName}:${tag.tagName}`;
        Tag.save(
          tag, `"${$scope.imageId}"`,
          // success
          () => {
            toastr.success(`Created tag: ${tagStr}`);
            // Redirect to new tag page
            $window.location.href = `tag/${tag.repoUser}/${tag.repoName}/${tag.tagName}/${$scope.imageId}`;
          },
          // error
          (httpResponse) => {
            toastr.error(`Failed to create tag: ${tagStr} Response: ${httpResponse.statusText}`);
          },
        );
      };

      $scope.createTag = (tag, forceOverwrite) => {
        $scope.master = angular.copy(tag);
        const tagStr = `${tag.repoUser}/${tag.repoName}:${tag.tagName}`;
        Tag.exists(
          tag,
          () => {
            if (!forceOverwrite) {
              toastr.warning(`Tag already exists: ${tagStr}`);
              return;
            }
            $scope.doCreateTag(tag);
          },
          () => {
            $scope.doCreateTag(tag);
          },
        );
      };

      $scope.isUnchanged = tag => angular.equals(tag, $scope.master);
    }]);
