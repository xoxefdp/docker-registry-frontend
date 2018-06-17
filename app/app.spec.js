describe('docker-registry-frontend', () => {
  let $route;
  let $location;
  let $rootScope;
  let $httpBackend;
  let $controller;

  beforeEach(module('docker-registry-frontend'));
  beforeEach(inject((_$route_, _$location_, _$rootScope_, _$httpBackend_, _$controller_) => {
    $route = _$route_;
    $location = _$location_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
  }));

  it('/home should display home page', () => {
    $httpBackend.expectGET('home.html').respond(200);
    $location.path('/home');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('home.html');
    expect($route.current.controller).toBe('HomeController');
    const scope = {};
    const expectedAppMode = {
      browseOnly: true,
      defaultRepositoriesPerPage: 20,
      defaultTagsPerPage: 10,
    };
    $controller('HomeController', { $scope: scope });
    $httpBackend.expectGET('app-mode.json').respond(expectedAppMode);
    $httpBackend.flush();
    jasmine.addCustomEqualityTester(angular.equals);
    expect(scope.appMode).toEqual(expectedAppMode);
  });

  it('/repositories should display repository list page', () => {
    $httpBackend.expectGET('repository/repository-list.html').respond(200);
    $location.path('/repositories');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-list.html');
    expect($route.current.controller).toBe('RepositoryListController');
    const scope = {};
    $controller('RepositoryListController', { $scope: scope });
    expect(scope.reposPerPage).toBeUndefined();
  });

  it('/repositories/10 should display repository list page', () => {
    $httpBackend.expectGET('repository/repository-list.html').respond(200);
    $location.path('/repositories/10');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-list.html');
    expect($route.current.controller).toBe('RepositoryListController');
    const scope = {};
    $controller('RepositoryListController', { $scope: scope });
    expect(scope.reposPerPage).toBe(10);
  });

  it('/repositories/20 should display repository list page', () => {
    $httpBackend.expectGET('repository/repository-list.html').respond(200);
    $location.path('/repositories/20');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-list.html');
    expect($route.current.controller).toBe('RepositoryListController');
    const scope = {};
    $controller('RepositoryListController', { $scope: scope });
    expect(scope.reposPerPage).toBe(20);
  });

  it('URL with repositoryUser and repositoryName and no tagsPerPage should display repository detail page', () => {
    $httpBackend.expectGET('repository/repository-detail.html').respond(200);
    $location.path('/repository/owner/name');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-detail.html');
    expect($route.current.controller).toBe('RepositoryDetailController');
    const scope = {};
    $controller('RepositoryDetailController', { $scope: scope });
    expect(scope.repositoryUser).toBe('owner');
    expect(scope.repositoryName).toBe('name');
    expect(scope.repository).toBe('owner/name');
    expect(scope.maxTagsPage).toBeUndefined();
  });

  it('URL with repositoryUser and repositoryName and tagsPerPage should display repository detail page', () => {
    $httpBackend.expectGET('repository/repository-detail.html').respond(200);
    $location.path('/repository/owner/name');
    $location.search('tagsPerPage', 10);
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-detail.html');
    expect($route.current.controller).toBe('RepositoryDetailController');
    const scope = {};
    $controller('RepositoryDetailController', { $scope: scope });
    expect(scope.repositoryUser).toBe('owner');
    expect(scope.repositoryName).toBe('name');
    expect(scope.repository).toBe('owner/name');
  });

  it('URL with repositoryName but no repositoryUser and no tagsPerPage should display repository detail page', () => {
    $httpBackend.expectGET('repository/repository-detail.html').respond(200);
    $location.path('/repository/cx');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-detail.html');
    expect($route.current.controller).toBe('RepositoryDetailController');
  });

  it('URL with repositoryName but no repositoryUser and tagsPerPage should display repository detail page', () => {
    $httpBackend.expectGET('repository/repository-detail.html').respond(200);
    $location.path('/repository/cx');
    $location.search('tagsPerPage', 10);
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-detail.html');
    expect($route.current.controller).toBe('RepositoryDetailController');
    const scope = {};
    $controller('RepositoryDetailController', { $scope: scope });
    expect(scope.repositoryUser).toBeUndefined();
    expect(scope.repositoryName).toBe('cx');
    expect(scope.repository).toBe('cx');
  });

  it('/about should display about page', () => {
    $httpBackend.expectGET('about.html').respond(200);
    $location.path('/about');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('about.html');
  });

  it('/tag/repositoryUser/repositoryName/latest should display tag detail page', () => {
    $httpBackend.expectGET('tag/tag-detail.html').respond(200);
    $location.path('/tag/repositoryUser/repositoryName/latest');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('tag/tag-detail.html');
    expect($route.current.controller).toBe('TagController');
    const scope = {};
    $controller('TagController', { $scope: scope });
    expect(scope.repositoryUser).toBe('repositoryUser');
    expect(scope.repositoryName).toBe('repositoryName');
    expect(scope.repository).toBe('repositoryUser/repositoryName');
    expect(scope.tagName).toBe('latest');
  });

  it('/tag/repositoryName/latest should display tag detail page', () => {
    $httpBackend.expectGET('tag/tag-detail.html').respond(200);
    $location.path('/tag/repositoryName/latest');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('tag/tag-detail.html');
    expect($route.current.controller).toBe('TagController');
  });

  it('/image/88e37c7099fa should display image detail page', () => {
    $httpBackend.expectGET('tag/image-detail.html').respond(200);
    $location.path('/image/88e37c7099fa');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('tag/image-detail.html');
    expect($route.current.controller).toBe('ImageController');
  });

  it('/image/88e37c7099fa/tag should display create tag page', () => {
    $httpBackend.expectGET('tag/create-tag.html').respond(200);
    $location.path('/image/88e37c7099fa/tag');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('tag/create-tag.html');
    expect($route.current.controller).toBe('CreateTagController');
  });

  it('/unknown-url should display repositories page', () => {
    $httpBackend.expectGET('repository/repository-list.html').respond(200);
    $location.path('/unknown-url');
    $rootScope.$digest();
    expect($route.current.templateUrl).toBe('repository/repository-list.html');
    expect($route.current.controller).toBe('RepositoryListController');
  });
});
