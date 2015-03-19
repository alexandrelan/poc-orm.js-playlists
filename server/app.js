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
  entities.User.hasMany('songs', entities.Song, 'user');
  entities.Song.hasOne('user', entities.User);
  entities.User.hasMany('playlists', entities.Playlist, 'user');
  entities.Playlist.hasOne('user', entities.User);
  
  var session = persistenceStore.getSession();
  //session.reset();
  session.schemaSync();

  app.use(parser.json());

  app.use(function (req, res, next) {
      // CORS and  other headers,
      // unjsonned query
      res.set({
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Expose-Headers": "Content-Type, Server",
        "Access-Control-Allow-Headers": "Content-Type, Server, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,HEAD",
        "Access-Control-Max-Age": "86400"
      });
      res.set('Access-Control-Allow-Origin', req.headers.origin);

      next();
    }
  );

  app.post('/playlistChanges', function(req, res) {

    function validatePlaylist(playlist) {
      return playlist.title.indexOf('e') === -1;
    }
    if (!req.body.every(validatePlaylist)) {
      res.status(400).send('Le nom d\'une playliste ne peut pas contenir la lettre \'e\'');
      res.end();
    }
      
    session.transaction(function(tx){
      persistenceSync.receiveUpdates(session, tx, entities.Playlist, req.body, function(result) {
        res.send(result);
      });
    });
  });

  app.get('/playlistChanges', function(req, res) {

    // TODO Filter
    session.transaction(function(tx){
      persistenceSync.pushUpdates(session, tx, entities.Playlist, req.query.since, function(updates) {
        res.send(updates);
      });
    });
  });

  app.post('/songChanges', function(req, res) {

    // TODO Validation
    session.transaction(function(tx){
      persistenceSync.receiveUpdates(session, tx, entities.Song, req.body, function(result) {
        res.send(result);
      });
    });
  });

  app.get('/songChanges', function(req, res) {

    // TODO Filter
    session.transaction(function(tx){
      persistenceSync.pushUpdates(session, tx, entities.Song, req.query.since, function(updates) {
        res.send(updates);
      });
    });
  });

  app.listen(5985);

  //exit the process
  function exit() {
    if (session) {
      session.close();
    }

    logger.log('application shutdown process succesfull');
    process.exit(0);
  }

  // intercept CTRL + C for correct application destruction
  process.on('SIGINT', function () {
    logger.log('Got SIGINT. quiting application');
    exit();
  });

  // app requested exit
  process.on('exit_app', exit);

}());