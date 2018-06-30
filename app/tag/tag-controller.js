function maxTagsPerPage(numOfPages, tagsPerPage) {
  return parseInt(Math.ceil(parseFloat(numOfPages) / parseFloat(tagsPerPage)), 10);
}

function compare(a, b) {
  const at = new Date(a.details.created);
  const bt = new Date(b.details.created);

  return at.getTime() - bt.getTime();
}

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:TagController
 * @description
 * # TagController
 * Controller of the docker-registry-frontend
 */
angular.module('tag-controller', ['ui.bootstrap', 'registry-services', 'app-mode-services'])
  .controller('TagController', ['$scope', '$route', '$location', 'Manifest', 'Tag', 'AppMode', 'filterFilter', '$uibModal', 'Blob', 'RegistryHost',
    class TagController {
      constructor($scope, $route, $location, Manifest, Tag, AppMode, filterFilter, $uibModal, Blob, RegistryHost) {
        this.$route = $route;
        this.$location = $location;
        this.$uibModal = $uibModal;
        this.filterFilter = filterFilter;
        this.registryHost = RegistryHost.query();

        this.searchName = $route.current.params.searchName;
        this.repositoryUser = $route.current.params.repositoryUser;
        this.repositoryName = $route.current.params.repositoryName;

        // sort tags
        this.orderByCreated = true;

        if (this.repositoryUser == null || this.repositoryUser == 'undefined') {
          this.repository = this.repositoryName;
        } else {
          this.repository = `${this.repositoryUser}/${this.repositoryName}`;
        }
        this.tagName = $route.current.params.tagName;
        AppMode.query((result) => {
          this.appMode = result;
          this.tagsPerPage = $route.current.params.tagsPerPage || this.appMode.defaultTagsPerPage;
          if (this.tagsPerPage === 'all') {
            this.tagsPerPage = null;
          }
        });

        // Fetch tags
        Tag.query({
          repoUser: this.repositoryUser,
          repoName: this.repositoryName,
        }).$promise.then((result) => {
          this.tags = result;

          // Determine the number of pages
          this.maxTagsPage = maxTagsPerPage(result.length, this.tagsPerPage);
          // Compute the right current page number
          this.tagsCurrentPage = $route.current.params.tagPage;
          if (!this.tagsCurrentPage) {
            this.tagsCurrentPage = 1;
          } else {
            this.tagsCurrentPage = parseInt(this.tagsCurrentPage, 10);
            if (this.tagsCurrentPage > this.maxTagsPage || this.tagsCurrentPage < 1) {
              this.tagsCurrentPage = 1;
            }
          }
          // Select wanted tags
          let idxShift = 0;
          // Copy collection for rendering in a smart-table
          this.displayedTags = [].concat(this.tags);

          if (this.tagsPerPage) {
            idxShift = (this.tagsCurrentPage - 1) * this.tagsPerPage;
            this.displayedTags = this.displayedTags.slice(idxShift, (this.tagsCurrentPage) * this.tagsPerPage);
          }

          // Fetch wanted manifests
          this.displayedTags.forEach((tag) => {
            if (Object.prototype.hasOwnProperty.call(tag, 'name')) {
              Manifest.query({ repository: this.repository, tagName: tag.name })
                .$promise.then((data) => {
                  tag.details = angular.copy(data);
                  return !data.isSchemaV2
                    ? undefined
                    : Blob.query({ repository: this.repository, digest: `sha256:${data.id}` })
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

          $scope.$watch(() => this.displayedTags.filter(t => t.selected), (nv) => {
            this.selection = nv.map(tag => `${this.repository}:${tag.name}`);
          }, true);
        });

        // selected tags
        this.selection = [];
      }

      // helper method to get selected tags
      selectedTags() {
        return this.filterFilter(this.displayedTags, { selected: true });
      }

      sortTags() {
        if (this.orderByCreated) {
          this.displayedTags.sort(compare);
        } else {
          this.displayedTags.sort(compare).reverse();
        }

        this.orderByCreated = !this.orderByCreated;
      }

      openConfirmTagDeletionDialog(size) {
        this.$uibModal.open({
          animation: true,
          templateUrl: 'modalConfirmDeleteItems.html',
          controller: 'DeleteTagsController',
          size,
          resolve: {
            items() {
              return this.selection;
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
      }
    }]);
