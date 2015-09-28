(function (w, angular) {
  "use strict";
  //das modul für "ng-app='linkManager'"
  var app = angular.module('linkManager', ['ngRoute', 'SimpleLocalStorageModule']);

  // der route provider muss separat eingebunden werden und als modulabhängigkeit definiert werden
  app.config(function ($routeProvider) {
    $routeProvider.
            when('/', {controller: 'ListController', templateUrl: 'list.html'}).
            when('/edit/:linkId', {controller: 'EditController', templateUrl: 'detail.html'}).
            when('/new', {controller: 'CreateController', templateUrl: 'detail.html'}).
            when('/copy/:linkId', {controller: 'CopyController', templateUrl: 'list.html'}).
            otherwise({redirectTo: '/'});
  });

  //controller für die Geschäftslogik zweischen view und Datenhaltung (in Services)

  //-->controller für die Übersicht der Links
  ////template=list.html
  app.controller('ListController', function ($scope, linkService, $rootScope, $filter, myLocalStorageService) {

    //____service = "myLocalStorageService" aus dem Modul = "SimpleLocalStorageModule"
    console.info(myLocalStorageService);
    console.info('localStorage-PRÄFIX = "' + myLocalStorageService.getPrefix() + '"');

    $scope.storeLinks = function () {
      myLocalStorageService.put('localLinks', linkService.getLinks());
    };

    $scope.loadLinks = function () {
      if (myLocalStorageService.get('localLinks').length >= 1) {
        linkService.setLinks(myLocalStorageService.get('localLinks'));
        $scope.search();
      }
    };
    //____service = "myLocalStorageService" aus dem Modul = "SimpleLocalStorageModule"

    $scope.filteredItems = linkService.getLinks();
    $scope.pageSize = 4;
    $scope.pagedItems = [];

    $scope.numberOfPages = function () {
      return Math.ceil($scope.filteredItems.length / $scope.pageSize);
    };

    $scope.search = function () {
      if (!$scope.query || $scope.query === '') {
        $scope.filteredItems = linkService.getLinks();
      } else {
        $scope.filteredItems = $filter('customFilter')(linkService.getLinks(), $scope.query, ["name", "desciption", "tags"]);
        $rootScope.query = $scope.query;
      }
      if ($scope.sortingOrder !== '') {
        $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, false);
        $rootScope.sortingOrder = $scope.sortingOrder;
      }
      $scope.groupToPages();
      if (!$scope.currentPage) {
        $scope.currentPage = 0;
      }
      $scope.currentPage = Math.min($scope.currentPage, $scope.pagedItems.length - 1);
      $rootScope.currentPage = $scope.currentPage;
    };


    $scope.groupToPages = function () {
      $scope.pagedItems = [];

      for (var i = 0; i < $scope.filteredItems.length; i++) {
        if (i % $scope.pageSize === 0) {
          $scope.pagedItems[Math.floor(i / $scope.pageSize)] = [$scope.filteredItems[i]];
        } else {
          $scope.pagedItems[Math.floor(i / $scope.pageSize)].push($scope.filteredItems[i]);
        }
      }
    };

    $scope.search();

    $scope.sortBy = function (newSortingOrder) {
      $scope.sortingOrder = newSortingOrder;
      $scope.search();
    };

    $scope.setPage = function (newpage) {
      $scope.currentPage = newpage;
      $rootScope.currentPage = newpage;
    };
  });

  //-->controller um einen neuen Link zu erstellen in der Detailansicht
  //template=detail.html
  app.controller('CreateController', function ($scope, $location, linkService) {
    $scope.save = function () {
      linkService.addLink(angular.copy($scope.alink));
      $location.path('/');
    };
  });

  //-->controller um einen Link zu kopieren in der liste. neuer Name bekommnt + 'New'
  //template=list.html
  app.controller('CopyController', function ($scope, $location, $routeParams, linkService) {
    var p = angular.copy(linkService.findById($routeParams.linkId));
    p.name = p.name + 'New';
    linkService.addLink(p);
    $location.path('/');
  });

  //-->controller für die Detailansicht der Links
  //template=detail.html
  app.controller('EditController', function ($scope, $location, $routeParams, linkService) {
    //nur eine copy, keine referenz(nicht veränderbar)
    $scope.alink = angular.copy(linkService.findById($routeParams.linkId));
    //veränderbar mit referenz wegen 2 way databinding 
    $scope.original = linkService.findById($routeParams.linkId);

    $scope.isClean = function () {
      // mit angular.equals kann man 2 objekte vergleichen
      return angular.equals($scope.original, $scope.alink);
    };
    $scope.destroy = function () {
      linkService.deleteLink($scope.alink);
      $scope.close();
    };
    $scope.save = function () {
      linkService.updateLink($scope.alink);
      $scope.close();
    };
    $scope.close = function () {
      $scope.original = null;
      $scope.alink = null;
      $location.path('/');
    };
  });

  // datenrückgabe in Service halten. Besser als in controller. Übersichtlicher. Jede Aufgabe hat eigenen Service.
  app.factory('linkService', function () {
    var data = [
      {
        Id: 1,
        name: 'Zita.de',
        site: 'http://www.zita.de',
        description: 'Beschreibung...',
        tags: 'Zitate'
      }
    ];

    function copy(quelle, ziel) {
      if (!ziel) {
        ziel = {};
      }
      Object.keys(quelle).forEach(function (val) {
        ziel[val] = quelle[val];
      });
      return ziel;
    }

    return {
      //git den Datensatz mit der gewünschten Id zurück
      findById: function (id) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].Id == id) {
            return data[i];
          }
        }
        return null;
      },
      //gibt alle Datensätze zurück
      getLinks: function () {
        return data;
      },
      setLinks: function (_data) {
        data = _data;
      },
      addLink: function (item) {
        //geenrate a unique id.
        item.Id = new Date().getTime();
        data.push(item);
      },
      deleteLink: function (item) {
        var tempItem = this.findById(item.Id);
        data.splice(data.indexOf(tempItem), 1);
      },
      updateLink: function (item) {
        var p = this.findById(item.Id);
        if (!p) {
          this.addLink(item);
        }
        copy(item, p);
      }
    };
  });

  app.filter('customFilter', function () {
    return function (data, queryStr, includedAttributes) {
      var resultArray = [];

      for (var i = data.length; i--; ) {
        var item = data[i];
        var found = false;
        for (var attr in item) {
          if (includedAttributes.indexOf(attr) > -1) {
            if (searchMatch(item[attr], queryStr)) {
              found = true;
              break;
            }
          }
        }
        if (found) {
          resultArray.push(item);
        }
      }
      return resultArray;
    }
  });

  function searchMatch(haystack, needle) {
    if (typeof (haystack) != 'string') {
      return false;
    }
    if (!needle) {
      return true;
    }
    return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
  }
})(window, angular);