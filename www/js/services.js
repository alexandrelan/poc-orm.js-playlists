angular.module('starter.services', [])

.factory('Persistence', function($q) {
    //persistence.store.memory.config(persistence);  

    persistence.store.cordovasql.config(persistence, 'test', '0.0.1', 'Database description', 5 * 1024 * 1024, 0);
    //persistence.reset();

    var entities = {};

    entities.Song = persistence.define('Song', {
      title: 'TEXT'
    });
    entities.Song.enableSync('http://localhost:5985/songChanges');

    entities.Playlist = persistence.define('Playlist', {
      title: 'TEXT'
    });
    entities.Playlist.enableSync('http://localhost:5985/playlistChanges');

    entities.Song.hasOne('playlist', entities.Playlist);
    entities.Playlist.hasMany('songs', entities.Song, 'playlist');



    persistence.debug = true;
    persistence.schemaSync();

    var syncAll = function() {
      entities.Playlist.syncAll(persistence.sync.preferLocalConflictHandler, function() {
        entities.Song.syncAll(persistence.sync.preferLocalConflictHandler, function() {
          setTimeout(syncAll, 10000);
        }, function() {});
      }, function() {});
    };

    syncAll();

    return {
      Entities: entities,

      addPlaylist: function(playlist) {
        persistence.add(playlist);
        persistence.flush();
      },

      getAllPlaylists: function() {
        var defer = $q.defer();

        entities.Playlist.all().list(null, function (playlists) {
          defer.resolve(playlists);
        });

        return defer.promise;
      },

      addSong: function(song) {
        persistence.add(song);
        persistence.flush();
      },

      getAllSongsForPlaylist: function(playlistId) {
        var defer = $q.defer();

        entities.Song.all().filter("playlist", '=', playlistId).list(null, function (songs) {
          defer.resolve(songs);
        });

        return defer.promise;
      }
    };
  })