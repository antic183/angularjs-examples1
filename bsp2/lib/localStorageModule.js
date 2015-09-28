(function (window, angular) {
  var angularLocalStorage = angular.module('SimpleLocalStorageModule', []);

  var localStorage = window.localStorage;

// You should set a prefix to avoid overwriting any local storage variables from the rest of your app
// e.g. angularLocalStorage.constant('prefix', 'youAppName');
  angularLocalStorage.value('prefix', 'ls_');

  angularLocalStorage.service('myLocalStorageService', [
    'prefix',
    function (prefix) {

      // Checks the browser to see if local storage is supported
      var browserSupportsLocalStorage = function () {
        try {
          return ('localStorage' in window && window['localStorage'] !== null);
        } catch (e) {
          return false;
        }
      };

      // Directly adds a value to local storage
      // If local storage is not available in the browser use cookies
      // Example use: localStorageService.add('library','angular');
      var putToLocalStorage = function (key, value) {

        if (!browserSupportsLocalStorage()) {
          return false;
        }
        // Let's convert undefined values to null to get the value consistent
        if (typeof value == "undefined")
          value = null;

        try {
          if (angular.isObject(value) || angular.isArray(value)) {
            value = angular.toJson(value);
          }
          localStorage.setItem(prefix + key, value);

        } catch (e) {
          return false;
        }
        return true;
      };

      // Directly get a value from local storage
      // Example use: localStorageService.get('library'); // returns 'angular'
      var getFromLocalStorage = function (key) {

        var item = localStorage.getItem(prefix + key);
        if (!item)
          return null;
        if (item.charAt(0) === "{" || item.charAt(0) === "[") {
          return angular.fromJson(item);
        }
        return item;
      };

      // Remove an item from local storage
      // Example use: localStorageService.remove('library'); // removes the key/value pair of library='angular'
      var removeFromLocalStorage = function (key) {
        if (!browserSupportsLocalStorage()) {
          return false;
        }

        try {
          localStorage.removeItem(prefix + key);
        } catch (e) {
          return false;
        }
        return true;
      };

      // Return array of keys for local storage
      // Example use: var keys = localStorageService.keys()
      var getKeysForLocalStorage = function () {

        if (!browserSupportsLocalStorage()) {
          return [];
        }

        var prefixLength = prefix.length;
        var keys = [];
        for (var key in localStorage) {
          // Only return keys that are for this app
          if (key.substr(0, prefixLength) === prefix) {
            try {
              keys.push(key.substr(prefixLength))
            } catch (e) {
              return [];
            }
          }
        }
        return keys;
      };

      // Remove all data for this app from local storage
      // Example use: localStorageService.clearAll();
      // Should be used mostly for development purposes
      var clearAllFromLocalStorage = function () {

        if (!browserSupportsLocalStorage()) {
          return false;
        }

        var prefixLength = prefix.length;

        for (var key in localStorage) {
          // Only remove items that are for this app
          if (key.substr(0, prefixLength) === prefix) {
            try {
              removeFromLocalStorage(key.substr(prefixLength));
            } catch (e) {
              return false;
            }
          }
        }
        return true;
      };

      return {
        isSupported: browserSupportsLocalStorage,
        put: putToLocalStorage,
        get: getFromLocalStorage,
        keys: getKeysForLocalStorage,
        remove: removeFromLocalStorage,
        clearAll: clearAllFromLocalStorage,
        getPrefix: function () {
          return prefix;
        }
      };
    }]);

})(window, angular);