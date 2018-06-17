

// This allows the application to query information about its version.
// The "app-version.json" file will be build during "docker build".

angular.module('app-version-services', ['ngResource'])
  .factory('AppVersion', ['$resource', '$log', $resource => (
    $resource('app-version.json', {}, {
      query: {
        method: 'GET',
        isArray: false,
      },
    })
  )]);
