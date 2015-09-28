var app = angular.module('app', []);

app.controller('BookController', function ($scope) {
  $scope.titles = [
    "Die Tribut von Panem",
    "Die Stadt der Träumenden Bücher"
  ];
  $scope.add = function () {
    $scope.titles.push($scope.newtitle);
    $scope.newtitle = '';
  }
});