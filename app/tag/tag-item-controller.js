

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:TagItemController
 * @description
 * # TagItemController
 * Every item in the tag list is associated with a TagItemController
 */
angular.module('tag-item-controller', ['registry-services'])
  .controller('TagItemController', ['$scope', 'Image', 'Ancestry',
    ($scope, Image, Ancestry) => {
    // Assign details to "tag" variable in the parent scope

      $scope.tag.details = Image.query({ imageId: $scope.tag.imageId });

      /**
     * Calculates the total download size for the image based on
     * it's ancestry.
     */
      $scope.totalImageSize = null;
      $scope.calculateTotalImageSize = () => {
      /* Fetch the image's ancestry and when complete, fetch the size of each image */

        Ancestry.query({ imageId: $scope.tag.imageId }).$promise.then((result) => {
          $scope.totalImageSize = 0;

          angular.forEach(result, (id) => {
          /* We have to use the $promise object here to be sure the result is accessible */

            Image.get({ imageId: id }).$promise.then((image) => {
              if (!isNaN(image.Size - 0)) {
                $scope.totalImageSize += image.Size;
              }
            });
          });
        });
      };
    }]);
