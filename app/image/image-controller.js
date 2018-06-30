

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:ImageController
 * @description
 * # ImageController
 * Controller of the docker-registry-frontend
 */
angular.module('image-controller', ['registry-services', 'app-mode-services'])
  .controller('ImageController', ['$route', 'Manifest', 'Blob', 'AppMode',
    class ImageController {
      constructor($route, Manifest, Blob, AppMode) {
        this.appMode = AppMode.query();
        this.Blob = Blob;

        this.repositoryUser = $route.current.params.repositoryUser;
        this.repositoryName = $route.current.params.repositoryName;
        if (this.repositoryUser == null || this.repositoryUser == 'undefined') {
          this.repository = this.repositoryName;
        } else {
          this.repository = `${this.repositoryUser}/${this.repositoryName}`;
        }
        this.tagName = $route.current.params.tagName;

        Manifest.query({ repository: this.repository, tagName: this.tagName })
          .$promise.then((data) => {
            this.imageDetails = angular.copy(data);

            return !data.isSchemaV2
              ? undefined
              : Blob.query({ repository: this.repository, digest: `sha256:${data.id}` })
                .$promise.then((config) => {
                  const labels = config.container_config && config.container_config.Labels;
                  this.imageDetails.created = config.created;
                  this.imageDetails.docker_version = config.docker_version;
                  this.imageDetails.os = config.os;
                  this.imageDetails.architecture = config.architecture;
                  this.imageDetails.labels = labels;
                  this.imageDetails.dockerfile = config.dockerfile;
                  this.imageDetails.layers = config.dockerfile.length;

                  this.totalImageSize = this.imageDetails.size;
                });
          });
      }

      /**
       * Calculates the total download size for the image based on
       * it's layers.
       */
      calculateTotalImageSize() {
        this.totalImageSize = 0;

        angular.forEach(this.imageDetails.fsLayers, (id) => {
          this.Blob.querySize({ repository: this.repository, digest: id.blobSum })
            .$promise.then((data) => {
              if (!isNaN(data.contentLength - 0)) {
                this.totalImageSize += data.contentLength;
              }
            });
        });
      }
    }]);
