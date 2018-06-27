function maxTagsPerPage(numOfPages, tagsPerPage) {
  return parseInt(Math.ceil(parseFloat(numOfPages) / parseFloat(tagsPerPage)), 10);
}

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:TagController
 * @description
 * # TagController
 * Controller of the docker-registry-frontend
 */
angular.module('tag-controller', ['ui.bootstrap', 'registry-services', 'app-mode-services'])
  .controller('TagController', ['$scope', '$route', '$location', '$filter', 'Manifest', 'Tag', 'AppMode', 'filterFilter', '$uibModal', 'Blob',
    ($scope, $route, $location, $filter, Manifest, Tag, AppMode, filterFilter, $uibModal, Blob) => {
      $scope.$route = $route;
      $scope.$location = $location;

      $scope.searchName = $route.current.params.searchName;
      $scope.repositoryUser = $route.current.params.repositoryUser;
      $scope.repositoryName = $route.current.params.repositoryName;

      if ($scope.repositoryUser == null || $scope.repositoryUser == 'undefined') {
        $scope.repository = $scope.repositoryName;
      } else {
        $scope.repository = `${$scope.repositoryUser}/${$scope.repositoryName}`;
      }
      $scope.tagName = $route.current.params.tagName;
      AppMode.query((result) => {
        $scope.appMode = result;
        $scope.tagsPerPage = $route.current.params.tagsPerPage || $scope.appMode.defaultTagsPerPage;
        if ($scope.tagsPerPage === 'all') {
          $scope.tagsPerPage = null;
        }
      });

      // Fetch tags
      Tag.query({
        repoUser: $scope.repositoryUser,
        repoName: $scope.repositoryName,
      }).$promise.then((result) => {
        $scope.tags = result;

        // Determine the number of pages
        $scope.maxTagsPage = maxTagsPerPage(result.length, $scope.tagsPerPage);
        // Compute the right current page number
        $scope.tagsCurrentPage = $route.current.params.tagPage;
        if (!$scope.tagsCurrentPage) {
          $scope.tagsCurrentPage = 1;
        } else {
          $scope.tagsCurrentPage = parseInt($scope.tagsCurrentPage, 10);
          if ($scope.tagsCurrentPage > $scope.maxTagsPage || $scope.tagsCurrentPage < 1) {
            $scope.tagsCurrentPage = 1;
          }
        }
        // Select wanted tags
        let idxShift = 0;
        // Copy collection for rendering in a smart-table
        $scope.displayedTags = [].concat($scope.tags);

        if ($scope.tagsPerPage) {
          idxShift = ($scope.tagsCurrentPage - 1) * $scope.tagsPerPage;
          $scope.displayedTags = $scope.displayedTags.slice(idxShift, ($scope.tagsCurrentPage) * $scope.tagsPerPage);
        }

        // Fetch wanted manifests
        $scope.displayedTags.forEach((tag) => {
          if (Object.prototype.hasOwnProperty.call(tag, 'name')) {
            Manifest.query({ repository: $scope.repository, tagName: tag.name })
              .$promise.then((data) => {
                tag.details = angular.copy(data);
                return !data.isSchemaV2
                  ? undefined
                  : Blob.query({ repository: $scope.repository, digest: `sha256:${data.id}` })
                    .$promise.then((config) => {
                      const labels = config.container_config && config.container_config.Labels;
                      tag.details.created = config.created;
                      tag.details.docker_version = config.docker_version;
                      tag.details.os = config.os;
                      tag.details.architecture = config.architecture;
                      tag.details.labels = labels;
                      tag.details.dockerfile = config.dockerfile;
                      tag.details.layers = config.dockerfile.length;
                    });
              });
          }
        });

        $scope.$watch('displayedTags|filter:{selected:true}', (nv) => {
          $scope.selection = nv.map(tag => `${$scope.repository}:${tag.name}`);
        }, true);
      });

      // selected tags
      $scope.selection = [];

      // helper method to get selected tags
      $scope.selectedTags = () => (
        filterFilter($scope.displayedTags, { selected: true })
      );

      // sort tags
      $scope.orderByCreated = true;

      function compare(a, b) {
        const at = new Date(a.details.created);
        const bt = new Date(b.details.created);

        return at.getTime() - bt.getTime();
      }

      $scope.sortTags = () => {
        if ($scope.orderByCreated) {
          $scope.displayedTags.sort(compare);
        } else {
          $scope.displayedTags.sort(compare).reverse();
        }

        $scope.orderByCreated = !$scope.orderByCreated;
      };

      $scope.openConfirmTagDeletionDialog = (size) => {
        $uibModal.open({
          animation: true,
          templateUrl: 'modalConfirmDeleteItems.html',
          controller: 'DeleteTagsController',
          size,
          resolve: {
            items() {
              return $scope.selection;
            },
            information() {
              return `A tag is basically a reference to an image.
                      If no references to an image exist, the image will be
                      scheduled for automatic deletion.
                      That said, if you remove a tag, you remove a reference to an image.
                      Your image data may get lost, if no other tag references it.
                      Are you sure, you want to delete the following tags?`;
            },
          },
        });
      };
    }]);
