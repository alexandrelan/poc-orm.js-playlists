angular.module('starter.controllers', [])

.controller('AppCtrl', function($http, $rootScope, $scope, $ionicModal, $timeout, Persistence) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  },

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    $http.post('http://localhost:5985/login', $scope.loginData)
    .success(function (data) {
      $rootScope.user = {
        login: $scope.loginData.login,
        token: data.token
      };
      $scope.closeLogin();
    });
  };

  // Playlist dialog part

  // Form data for the add playlist modal
  $scope.playlistData = {};

  // Create the add playlist modal that we will use later
  $ionicModal.fromTemplateUrl('templates/add-playlist.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.addDialog = modal;
  });

  // Triggered in the add playlist modal to close it
  $scope.closeAddDialog = function() {
    $scope.playlistData = {};
    $scope.addDialog.hide();
  },

  // Open the add playlist modal
  $scope.showAddDialog = function() {
    $scope.playlistData = {};
    $scope.addDialog.show();
  };

  // Perform the add playlist action when the user submits the add playlist form
  $scope.doAddDialog = function() {
    var playlist = new Persistence.Entities.Playlist({title: $scope.playlistData.title});
    Persistence.addPlaylist(playlist);
    $scope.$broadcast('playlistAdded', playlist);

    $scope.closeAddDialog();
  };
})

.controller('PlaylistsCtrl', function($scope, Persistence) {
  var getPlaylists = function() {
    Persistence.getAllPlaylists().then(function (response) {
      $scope.playlists = response;
    });
  };

  getPlaylists();

  $scope.$on('playlistAdded', function(event, playlist) {
    getPlaylists();
  });
})

.controller('PlaylistCtrl', function($scope, $ionicModal, $stateParams, Persistence) {

    var playlistId = $stateParams.playlistId;
    var getSongs = function() {
      Persistence.getAllSongsForPlaylist(playlistId).then(function (response) {
        $scope.songs = response;
      });
    };

    getSongs();

    $scope.$on('songAdded', function(event, song) {
      getSongs();
    });

    // Form data for the add playlist modal
    $scope.songData = {};

    // Create the add playlist modal that we will use later
    $ionicModal.fromTemplateUrl('templates/add-song.html', {
      scope: $scope
    }).then(function(modal) {
        $scope.addDialog = modal;
      });

    // Triggered in the add playlist modal to close it
    $scope.closeAddDialog = function() {
      $scope.songData = {};
      $scope.addDialog.hide();
    };

      // Open the add playlist modal
      $scope.showAddDialog = function() {
        $scope.songData = {};
        $scope.addDialog.show();
      };

    // Perform the add playlist action when the user submits the add playlist form
    $scope.doAddDialog = function() {
      var song = new Persistence.Entities.Song({title: $scope.songData.title, playlist: playlistId});
      Persistence.addSong(song);
      $scope.$broadcast('songAdded', song);

      $scope.closeAddDialog();
    };
})
