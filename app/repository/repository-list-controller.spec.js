

describe('RepositoryListController', () => {
  // load the controller's module
  beforeEach(module('repository-list-controller'));

  let $controller;
  let $httpBackend;
  let $q;
  let $rootScope;

  beforeEach(inject((_$controller_, _$httpBackend_, _$q_, _$rootScope_) => {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  it('should attach some keys to the scope', () => {
    const $scope = $rootScope.$new();
    const route = {
      current: {
        params: {
          lastNamespace: 'lastNamespace',
          lastRepository: 'lastRepository',
          reposPerPage: 10,
        },
      },
    };

    const mockRepositoryReturnValue = {
      repos: [{ username: 'username', name: 'name', selected: true }],
      lastRepository: 'lastNamespace/lastRepository',
    };
    const mockRepository = { query: null };
    spyOn(mockRepository, 'query').and.returnValue({ $promise: $q.when(mockRepositoryReturnValue) });

    const expectedAppMode = {
      browseOnly: true,
      defaultRepositoriesPerPage: 20,
      defaultTagsPerPage: 10,
    };
    $httpBackend.expectGET('app-mode.json').respond(expectedAppMode);

    const controller = $controller('RepositoryListController', { $scope, $route: route, Repository: mockRepository });
    $httpBackend.flush();

    expect(controller.reposPerPage).toBe(10);
    expect(controller.currentLastRepository).toEqual('lastNamespace\\lastRepository');
    expect(controller.selectedRepositories).toEqual(['name']);
    expect(mockRepository.query).toHaveBeenCalled();
    expect(controller.repositories).toEqual(mockRepositoryReturnValue);
  });
});

