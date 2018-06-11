'use strict';

function buildRoute() {
  return {
    current: {
      params: {
        repositoryName: 'nginx',
        tagName: 'latest',
        tagsPerPage: 10,
      },
    },
  };
}

function mockTagService($q) {
  var mockTagReturnValue = [];
  var mockTag = { query: null };
  spyOn(mockTag, 'query').and.returnValue({$promise: $q.when(mockTagReturnValue)});

  return mockTag;
}

function mockAppMode($httpBackend) {
  var expectedAppMode = {"browseOnly": true, "defaultRepositoriesPerPage": 20, "defaultTagsPerPage": 10};
  $httpBackend.expectGET('app-mode.json').respond(expectedAppMode);
}

describe('TagController', function() {

  // load the controller's module
  beforeEach(module('tag-controller'));

  var $controller, $httpBackend, $q, $rootScope;

  beforeEach(inject(function(_$controller_, _$httpBackend_, _$q_, _$rootScope_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  describe('Sorting', function() {
    it('should sort tags Ascending', function() {
      var $scope = $rootScope.$new();
      var route = buildRoute();
      var mockTag = mockTagService($q);
      mockAppMode($httpBackend);

      var ctrl = $controller('TagController', {$scope: $scope, $route: route, Tag: mockTag});
      // $httpBackend.flush();
      $scope.displayedTags = [{
        name: 'aaa',
        details: {
          created: '2015-03-25',
        },
      }, {
        name: 'bbb',
        details: {
          created: '2015-03-20',
        },
      }];
      expect($scope.orderByCreated).toBeTruthy();

      $scope.sortTags();
      expect($scope.displayedTags).toEqual([{
        name: 'bbb',
        details: {
          created: '2015-03-20',
        },
      }, {
        name: 'aaa',
        details: {
          created: '2015-03-25',
        },
      }]);
      expect($scope.orderByCreated).toBeFalsy();
    });
  });
});

