

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:RepositoryDetailController
 * @description
 * # RepositoryDetailController
 * Controller of the docker-registry-frontend
 */
angular.module('repository-detail-controller', ['registry-services', 'app-mode-services'])
  .controller('RepositoryDetailController', ['$route', '$routeParams', '$location', '$log', '$uibModal', 'AppMode',
    class RepositoryDetailController {
      constructor($route, $routeParams, $location, $log, $uibModal, AppMode) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;
        this.$uibModal = $uibModal;

        // this.searchTerm = $route.current.params.searchTerm;
        this.repositoryUser = $route.current.params.repositoryUser;
        this.repositoryName = $route.current.params.repositoryName;
        $log.log(`repository-detail-controller: this.repositoryUser = ${this.repositoryUser}`);
        if (this.repositoryUser == null || this.repositoryUser == 'undefined') {
          this.repository = this.repositoryName;
          $log.log(`repository-detail-controller: this.repositoryUser was undefined; setting repository to just repositoryName = ${this.repository}`);
        } else {
          this.repository = `${this.repositoryUser}/${this.repositoryName}`;
          $log.log(`repository-detail-controller: this.repositoryUser was NOT undefined; setting repository to ${this.repository}`);
        }

        this.appMode = AppMode.query();
        this.maxTagsPage = undefined;
        this.selectedRepositories = [];
      }

      // Method used to disable next & previous links
      getNextHref() {
        if (this.maxTagsPage > this.tagsCurrentPage) {
          const nextPageNumber = this.tagsCurrentPage + 1;
          return `/repository/${this.repository}?tagsPerPage=${this.tagsPerPage}&tagPage=${nextPageNumber}`;
        }
        return '#';
      }

      getFirstHref() {
        if (this.tagsCurrentPage > 1) {
          return `/repository/${this.repository}?tagsPerPage=${this.tagsPerPage}`;
        }
        return '#';
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
