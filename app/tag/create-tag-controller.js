

/**
 * @ngdoc function
 * @name docker-registry-frontend.controller:CreateTagController
 * @description
 * # CreateTagController
 * Controller of the docker-registry-frontend
 */
angular.module('create-tag-controller', ['registry-services', 'app-mode-services'])
  .controller('CreateTagController', ['$route', '$window', 'Tag', 'Repository', 'AppMode',
    class CreateTagController {
      constructor($route, $window, Tag, Repository, AppMode) {
        this.imageId = $route.current.params.imageId;
        this.repositoryUser = $route.current.params.repositoryUser;
        this.repositoryName = $route.current.params.repositoryName;
        this.Tag = Tag;
        this.$window = $window;

        this.master = {};

        this.repositories = Repository.query();
        this.appMode = AppMode.query();

        this.tag = {
          repoUser: this.repositoryUser,
          repoName: this.repositoryName,
        };
      }

      selectRepo(repoStr) {
        const res = repoStr.split('/');
        this.tag.repoUser = res[0];
        this.tag.repoName = res[1];
      }

      doCreateTag(tag) {
        const tagStr = `${tag.repoUser}/${tag.repoName}:${tag.tagName}`;
        this.Tag.save(
          tag, `"${this.imageId}"`,
          // success
          () => {
            toastr.success(`Created tag: ${tagStr}`);
            // Redirect to new tag page
            this.$window.location.href = `tag/${tag.repoUser}/${tag.repoName}/${tag.tagName}/${this.imageId}`;
          },
          // error
          (httpResponse) => {
            toastr.error(`Failed to create tag: ${tagStr} Response: ${httpResponse.statusText}`);
          },
        );
      }

      createTag(tag, forceOverwrite) {
        this.master = angular.copy(tag);
        const tagStr = `${tag.repoUser}/${tag.repoName}:${tag.tagName}`;
        this.Tag.exists(
          tag,
          () => {
            if (!forceOverwrite) {
              toastr.warning(`Tag already exists: ${tagStr}`);
              return;
            }
            this.doCreateTag(tag);
          },
          () => {
            this.doCreateTag(tag);
          },
        );
      }

      isUnchanged(tag) {
        return angular.equals(tag, this.master);
      }
    }]);
