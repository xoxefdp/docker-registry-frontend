

angular.module('tag-list-directive', [])
  .directive('tagList', () => ({
    restrict: 'E',
    templateUrl: 'tag/tag-list-directive.html',
    controller: 'TagController',
  }));
