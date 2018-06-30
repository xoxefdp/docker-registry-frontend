

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:TagItemController
 * @description
 * # TagItemController
 * Every item in the tag list is associated with a TagItemController
 */
angular.module('tag-item-controller', ['registry-services'])
  .controller('TagItemController', ['Image', 'Ancestry',
    class TagItemController {
      constructor(Image, Ancestry) {
        // Assign details to "tag" variable in the parent scope
        this.tag.details = Image.query({ imageId: this.tag.imageId });

        this.totalImageSize = null;
        this.Ancestry = Ancestry;
        this.Image = Image;
      }

      /**
       * Calculates the total download size for the image based on
       * it's ancestry.
       */
      calculateTotalImageSize() {
        // Fetch the image's ancestry and when complete, fetch the size of each image
        this.Ancestry.query({ imageId: this.tag.imageId }).$promise.then((result) => {
          this.totalImageSize = 0;

          angular.forEach(result, (id) => {
          // We have to use the $promise object here to be sure the result is accessible
            this.Image.get({ imageId: id }).$promise.then((image) => {
              if (!isNaN(image.Size - 0)) {
                this.totalImageSize += image.Size;
              }
            });
          });
        });
      };
    }]);
