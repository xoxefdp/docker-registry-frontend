'use strict';

// This is the main entrypoint to interact with the Docker registry.

// Helpful resources
//
// https://docs.angularjs.org/tutorial/step_11
// https://docs.angularjs.org/api/ngResource/service/$resource

function getNextLink(linkHeader) {
  return linkHeader.split(',').filter(function(l){
    return /rel="next"/.test(l);
  })[0];
}

function getURL(link) {
  var regex = /<(.+)>;/g;
  var url = link ? regex.exec(link) : undefined;
  return url ? url[1] : undefined;
}

function getLast(link) {
  var regex = /last=(.+)&/g;
  return link ? regex.exec(link)[1] : undefined;
}

/**
 *  Extract the "last=" part from Link header:
 *
 *   Link: </v2/_catalog?last=namespace%2Frepository&n=10>; rel="next"
 *
 * We only want to extract the "last" part and store it like this
 *
 *   lastRepository = namespace/repository
 **/
function linkParser(linkHeader) {
  var namespace;
  var repository;
  var last;
  var link;
  var url;
  var parts;

  if (linkHeader) {
    link = getNextLink(linkHeader)
    url = getURL(link)
    last = getLast(url);
    repository = last ? last.replace('%2F', '/') : undefined;
  }

  return { repository: repository };
}

function handelSchemaV1(data) {
  // https://docs.docker.com/registry/spec/manifest-v2-1/
  /** Response example:
   * {
   *   "schemaVersion": 1,
   *   "name": "arthur/busybox",
   *   "tag": "demo",
   *   "architecture": "amd64",
   *   "fsLayers": [
   *     {
   *       "blobSum": "sha256:a3ed95caeb02ffe68cdd9fd84406680ae93d633cb16422d00e8a7c22955b46d4"
   *     },
   *     {
   *       "blobSum": "sha256:d7e8ec85c5abc60edf74bd4b8d68049350127e4102a084f22060f7321eac3586"
   *     }
   *   ],
   *   "history": [
   *     {
   *       "v1Compatibility": "{\"id\":\"3e1018ee907f25aef8c50016296ab33624796511fdbfdbbdeca6a3ed2d0ba4e2\",\"parent\":\"176dfc9032a1ec3ac8586b383e325e1a65d1f5b5e6f46c2a55052b5aea8310f7\",\"created\":\"2016-01-12T17:47:39.251310827Z\",\"container\":\"2732d16efa11ab7da6393645e85a7f2070af94941a782a69e86457a2284f4a69\",\"container_config\":{\"Hostname\":\"ea7fe68f39fd\",\"Domainname\":\"\",\"User\":\"\",\"AttachStdin\":false,\"AttachStdout\":false,\"AttachStderr\":false,\"Tty\":false,\"OpenStdin\":false,\"StdinOnce\":false,\"Env\":[\"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\"],\"Cmd\":[\"/bin/sh\",\"-c\",\"#(nop) LABEL awesome=Not yet!\"],\"Image\":\"176dfc9032a1ec3ac8586b383e325e1a65d1f5b5e6f46c2a55052b5aea8310f7\",\"Volumes\":null,\"WorkingDir\":\"\",\"Entrypoint\":null,\"OnBuild\":[],\"Labels\":{\"awesome\":\"Not yet!\",\"test\":\"yes\",\"working\":\"true\"}},\"docker_version\":\"1.9.1\",\"author\":\"Arthur\",\"config\":{\"Hostname\":\"ea7fe68f39fd\",\"Domainname\":\"\",\"User\":\"\",\"AttachStdin\":false,\"AttachStdout\":false,\"AttachStderr\":false,\"Tty\":false,\"OpenStdin\":false,\"StdinOnce\":false,\"Env\":[\"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\"],\"Cmd\":[\"sh\"],\"Image\":\"176dfc9032a1ec3ac8586b383e325e1a65d1f5b5e6f46c2a55052b5aea8310f7\",\"Volumes\":null,\"WorkingDir\":\"\",\"Entrypoint\":null,\"OnBuild\":[],\"Labels\":{\"awesome\":\"Not yet!\",\"test\":\"yes\",\"working\":\"true\"}},\"architecture\":\"amd64\",\"os\":\"linux\"}"
   *     },
   *     {
   *       "v1Compatibility": "{\"id\":\"5c5fb281b01ee091a0fffa5b4a4c7fb7d358e7fb7c49c263d6d7a4e35d199fd0\",\"created\":\"2015-12-08T18:31:50.979824705Z\",\"container\":\"ea7fe68f39fd0df314e841247fb940ddef4c02ab7b5edb0ee724adc3174bc8d9\",\"container_config\":{\"Hostname\":\"ea7fe68f39fd\",\"Domainname\":\"\",\"User\":\"\",\"AttachStdin\":false,\"AttachStdout\":false,\"AttachStderr\":false,\"Tty\":false,\"OpenStdin\":false,\"StdinOnce\":false,\"Env\":null,\"Cmd\":[\"/bin/sh\",\"-c\",\"#(nop) ADD file:c295b0748bf05d4527f500b62ff269bfd0037f7515f1375d2ee474b830bad382 in /\"],\"Image\":\"\",\"Volumes\":null,\"WorkingDir\":\"\",\"Entrypoint\":null,\"OnBuild\":null,\"Labels\":null},\"docker_version\":\"1.8.3\",\"config\":{\"Hostname\":\"ea7fe68f39fd\",\"Domainname\":\"\",\"User\":\"\",\"AttachStdin\":false,\"AttachStdout\":false,\"AttachStderr\":false,\"Tty\":false,\"OpenStdin\":false,\"StdinOnce\":false,\"Env\":null,\"Cmd\":null,\"Image\":\"\",\"Volumes\":null,\"WorkingDir\":\"\",\"Entrypoint\":null,\"OnBuild\":null,\"Labels\":null},\"architecture\":\"amd64\",\"os\":\"linux\",\"Size\":1113436}"
   *     }
   *   ],
   * }
   **/

  var dockerFile;
  var res = {};
  var history = data.history.map(function(history) {
    return angular.fromJson(history.v1Compatibility);
  }).filter(function(history) {
    return history !== undefined;
  }).map(function(history) {
    return {
      id: history.id,
      os: history.os,
      docker_version: history.docker_version,
      created: history.created,
      author: history.author,
      labels: history.config && history.config.Labels,
      layerCmd: history.container_config && history.container_config.Cmd.join(' ')
        .replace(/^\/bin\/sh -c #\(nop\)\s*/, '')
        .replace('/bin/sh -c', 'RUN')
        .replace(/\t\t/g, '\\\n\t'),
    };
  });

  dockerFile = history.map(function(history) {
    return history.layerCmd;
  }).reverse();

  if(history.length > 0){
    res = history.shift();
    res.history = history;
  }

  res.dockerfile = dockerFile
  res.layers = dockerFile.length
  res.fsLayers = data.fsLayers;
  res.architecture = data.architecture;

  return res;
}

function handelSchemaV2(data) {
  // https://docs.docker.com/registry/spec/manifest-v2-2/#image-manifest-field-descriptions
  /** Response example:
   * {
   *   "schemaVersion": 2,
   *   "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
   *   "config": {
   *     "mediaType": "application/vnd.docker.container.image.v1+json",
   *     "size": 7023,
   *     "digest": "sha256:b5b2b2c507a0944348e0303114d8d93aaaa081732b86451d9bce1f432a537bc7"
   *   },
   *   "layers": [
   *     {
   *       "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
   *       "size": 32654,
   *       "digest": "sha256:e692418e4cbaf90ca69d05a66403747baa33ee08806650b51fab815ad7fc331f"
   *     },
   *     {
   *       "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
   *       "size": 16724,
   *       "digest": "sha256:3c3a4604a545cdc127456d94e421cd355bca5b528f4a9c1905b15da2eb4a4c6b"
   *     },
   *     {
   *       "mediaType": "application/vnd.docker.image.rootfs.diff.tar.gzip",
   *       "size": 73109,
   *       "digest": "sha256:ec4b8955958665577945c89419d1af06b5f7636b4ac3da7f12184802ad867736"
   *     }
   *    ]
   *   }
   **/

  var res = {
    id: data.config.digest.replace(/^sha256:/, ''),
  };

  res.size = data.layers.reduce(function(size, layer) {
    return size + layer.size;
  }, data.config.size);

  return res;
}

angular.module('registry-services', ['ngResource'])
  .factory('RegistryHost', ['$resource', function($resource){
    return $resource('registry-host.json', {}, {
      'query': {
        method:'GET',
        isArray: false,
      },
    });
  }])
  /* Repository returns:
   *
   *   {
   *     repos: [
   *       {username: 'SomeNamespace', name: 'SomeNamespace/SomeRepo1', selected: true|false},
   *       {username: 'SomeOtherNamespace', name: 'SomeOtherNamespace/SomeRepo2', selected: true|false},
   *       {username: 'SomeCompletelyDifferenNamespace', name: 'SomeCompletelyDifferenNamespace/SomeRepo3', selected: true|false}
   *     ],
   *     nextLink: '/v2/_catalog?last=SomeNamespace%F2SomeRepo&n=1'
   *   }
   *
   * The "nextLink" element is a preparation for supporting pagination
   * (see https: *github.com/docker/distribution/blob/master/docs/spec/api.md#pagination)
   *
   * On subsequent calls to "Repository()" you may pass in "n" as the number of
   * elements per page as well as "last" which is the "nextLink" from the last
   * call to Repository.
   **/
  .factory('Repository', ['$resource', function($resource){
    return $resource('/v2/_catalog?n=:n&last=:last', {}, {
      'query': {
        method:'GET',
        isArray: false,
        transformResponse: function(data, headers, status){
          if (status !== 200) {
            return {
              repos: [],
              lastRepository: undefined
            };
          }

          var repos = angular.fromJson(data).repositories;
          var last = linkParser(headers()['link'])
          var ret = {
            repos: [],
            lastRepository: last.repository
          };

          angular.forEach(repos, function(value/*, key*/) {
            ret.repos.push({
              username: ''+value.split('/')[0],
              name: value,
              selected: false
            });
          });

          return ret;
        }
      },
      'delete': {
        url: '/v2/repositories/:repoUser/:repoName/',
        method: 'DELETE',
      }
    });
  }])
  .factory('Tag', ['$resource', function($resource){
    // TODO: rename :repo to repoUser/repoString for convenience.
    // https://github.com/docker/distribution/blob/master/docs/spec/api.md#listing-image-tags
    return $resource('/v2/:repoUser/:repoName/tags/list', {}, {
      // Response example:
      // {"name":"kkleine/docker-registry-frontend","tags":["v2", "v1-deprecated"]}
      'query': {
        method:'GET',
        isArray: true,
        transformResponse: function(data/*, headers*/){
          var res = [];
          var resp = angular.fromJson(data);
          for (var idx in resp.tags){
            res.push({
              name: resp.tags[idx],
              imageId: 'ImageIDOf'+resp.tags[idx],
              selected: false
            });
          }
          return res;
        },
      },
      'exists': {
        url: '/v1/repositories/:repoUser/:repoName/tags/:tagName',
        method: 'GET',
        transformResponse: function(data/*, headers*/){
          // data will be the image ID if successful or an error object.
          data = angular.isString(angular.fromJson(data));
          return data;
        },
      },
      // Usage: Tag.save({repoUser:'someuser', repoName: 'someRepo', tagName: 'someTagName'}, imageId);
      'save': {
        method:'PUT',
        url: '/v1/repositories/:repoUser/:repoName/tags/:tagName',
      },
    });
  }])
  .factory('Manifest', ['$resource', function($resource){
    return $resource('/v2/:repository/manifests/:tagName', {}, {
      'query': {
        method:'GET',
        headers: {
            accept: 'application/vnd.docker.distribution.manifest.v2+json',
        },
        isArray: false,
        transformResponse: function(data, headers){
          var resp = angular.fromJson(data);
          var isSchemaV2 = (headers('content-type') === 'application/vnd.docker.distribution.manifest.v2+json');
          var res = isSchemaV2
            ? handelSchemaV2(resp)
            : handelSchemaV1(resp);
          res.digest = headers('docker-content-digest');
          res.isSchemaV2 = isSchemaV2;

          return res;
        },
      },
      'delete': {
          url: '/v2/:repository/manifests/:digest',
          method: 'DELETE',
      },
    });
  }])
  .factory('Blob', ['$resource', function($resource){
    return $resource('/v2/:repository/blobs/:digest', {}, {
      'querySize': {
        method:'HEAD',
        interceptor: {
          response: function(response){
            var res = {contentLength: parseInt(response.headers('content-length'))};
            return res;
          }
        }
      },
      /** Example Response:
       * {
       *   "architecture": "amd64",
       *   "config": {},
       *   "container": "caab3f21c75adc3560754e71374cd01cb1bbe39b2b9c2809ff6c22bbcd39206c",
       *   "container_config": {},
       *   "created": "2017-04-25T03:44:24.620936172Z",
       *   "docker_version": "17.04.0-ce",
       *   "history": [
       *     {
       *       "created": "2017-04-24T19:20:41.290148217Z",
       *       "created_by": "/bin/sh -c #(nop) ADD file:712c48086043553b85ffb031d8f6c5de857a2e53974df30cdfbc1e85c1b00a25 in / "
       *     },
       *     {
       *       "created": "2017-04-24T19:20:42.022627269Z",
       *       "created_by": "/bin/sh -c #(nop)  CMD [\"/bin/bash\"]",
       *       "empty_layer": true
       *     }
       *   ],
       *   "os": "linux",
       *   "rootfs": {}
       * }
       **/
      'query': {
        method: 'GET',
        transformResponse: function(data, headers){
          data = angular.fromJson(data);
          data.dockerfile = data.history.map(function(history) {
            return history.created_by
              .replace(new RegExp('^/bin/sh -c #\\(nop\\)\\s*'), '')
              .replace(new RegExp('^/bin/sh -c\\s*'), 'RUN ')
              .replace(/\t\t/g, '\\\n\t');
           });

           return data;
        }
      }
    });
  }]);
