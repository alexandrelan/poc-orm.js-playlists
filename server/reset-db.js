#!/usr/bin/env node
(function () {
  "use strict";

  var app = require('express')(),
    parser = require('body-parser'),
    mysql = require('mysql'),
    persistence = require('orm.js'),
    persistenceStore = persistence.StoreConfig.init(persistence, { adaptor: 'mysql' }),
    persistenceSync = persistence.SyncConfig;

  persistenceStore.config(persistence, 'localhost', 3306, 'poc_ormjs', 'root', '');
  persistenceSync.config(persistence);

var entities = {};
  entities.Song = persistence.define('Song', {
    title: 'TEXT'
  });
  entities.Song.enableSync('/songChanges');

  entities.Playlist = persistence.define('Playlist', {
    title: 'TEXT'
  });
  entities.Playlist.enableSync('/playlistChanges');

  entities.Song.hasOne('playlist', entities.Playlist);
  entities.Playlist.hasMany('songs', entities.Song, 'playlist');

  entities.User = persistence.define('User', {
    login: 'TEXT'
  });
  
  
  var session = persistenceStore.getSession();
  
  session.reset(function () {
    session.close();
    process.exit(0);
  });

}());