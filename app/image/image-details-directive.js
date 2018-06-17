

angular.module('image-details-directive', [])
  .directive('imageDetails', () => ({
    restrict: 'E',
    templateUrl: 'image/image-details-directive.html',
    controller: 'ImageController',
  }));
