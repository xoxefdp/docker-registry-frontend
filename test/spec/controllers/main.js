

describe('MainController', () => {
  // load the controller's module
  beforeEach(module('main-controller'));

  const scope = {};
  let $httpBackend;

  beforeEach(inject(($controller, _$httpBackend_) => {
    $controller('MainController', { $scope: scope });
    $httpBackend = _$httpBackend_;
  }));

  it('should attach an appVersion and registryHost to the scope', () => {
    const scopeKeys = Object.keys(scope).sort();
    expect(scopeKeys).toEqual(['appVersion', 'registryHost']);

    const expectedAppVersion = { git: { sha1: 'foo', ref: 'bar' } };
    const expectedRegistryHost = { host: 'path-to-your-registry', port: 80 };
    $httpBackend.expectGET('app-version.json').respond(expectedAppVersion);
    $httpBackend.expectGET('registry-host.json').respond(expectedRegistryHost);
    $httpBackend.flush();
    jasmine.addCustomEqualityTester(angular.equals);
    expect(scope.appVersion).toEqual(expectedAppVersion);
    expect(scope.registryHost).toEqual(expectedRegistryHost);
  });
});
