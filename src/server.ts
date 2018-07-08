// **** Node Imports **** //
import fs from 'fs';
import path from 'path';
import { format } from 'util';
import { Server } from 'http';
import * as ReqMaker from './request';
import express from 'express';
import compression from 'compression';

// **** App Imports **** //
import { Logger, Enums, Maze, IMaze, Cell, ICell, Score, IScore, Team, ITeam, Game, IGameStub } from 'cc2018-ts-lib';
import * as consts from './consts';
import { version } from 'punycode';
import { LOG_LEVELS } from 'cc2018-ts-lib/dist/Logger';
import { GAME_SVC_URL } from './consts';

// **** Initialize **** //
let httpServer: Server; // set by app.listen
const enums = Enums.getInstance(); // instance of shared enum-related helper module
const log = Logger.getInstance(); // instance of logging helper
const app = express(); // alias the express server

// pulled from environment variable - see '.env' file in project root
// (more info about .env in README.MD)
log.setLogLevel(consts.LOG_LEVEL); // 3 = INFO

// configure express to use Pug
app.set('views', 'views');
app.set('view engine', 'pug');

// caches for games and game stub data
let games: Array<Game> = new Array<Game>();
let gameStubs: Array<IGameStub> = new Array<IGameStub>();
let hndGameStubRefreshTimer: any;

// now start the server
startServer();

/* END OF SETUP SECTION */

function startServer() {
    log.info(__filename, 'startServer()', 'Starting Game Monitor v' + consts.APP_VERSION);

    //initial cache load
    refreshGameStubsCache();

    // set auto cache refresh timer
    hndGameStubRefreshTimer = setInterval(refreshGameStubsCache, consts.GAME_STUBS_CACHE_TTL);

    // start the http server
    httpServer = app.listen(consts.GAME_MON_PORT, function() {
        log.info(__filename, 'startServer()', format('Game Monitor is listening on port %d', consts.GAME_MON_PORT));

        // enable express http compression
        app.use(compression());

        // This runs for ALL incoming requests
        app.use(function(req, res, next) {
            log.trace(__filename, 'app.listen()', format('Incoming Request: %s', req.url));

            // add the CORS headers to all responses
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

            next(); // forces server to look for next route
        });

        // handle index page request
        app.get(['/', '/index'], function(req, res) {
            res.render('index', { host: req.headers.host, games: gameStubs });
        });

        // handle index page request
        app.get(['/live'], function(req, res) {
            res.render('live', {
                host: req.headers.host,
                games: gameStubs,
                gamesUrl: consts.GAME_SVC_URL_EXT + '/games'
            });
        });

        // handle images, css, and js file requests
        app.get(['/favicon.ico', '/views/images/:file', '/views/css/:file', '/views/js/:file'], function(req, res) {
            // make sure file exits before sending
            if (fs.existsSync(path.resolve('.' + req.path).toString())) {
                res.sendFile(path.resolve('.' + req.path));
            } else {
                res.status(404).send();
            }
        });

        // Catch all - return 404/
        app.get('/*', function(req, res) {
            log.trace(__filename, req.url, 'Route not found, returning 404.');
            res.status(404).render('404', {
                host: req.headers.host,
                image: format('/views/images/404_%d.jpg', Math.floor(Math.random() * Math.floor(7)) + 1),
                title: 'Page Not Found'
            });
        });
    });
}

/**
 * Refreshes the local gameStubs cache array and resets the cache fill time.
 * Called once during service start, then again whenever a request comes in
 * if the cache expiration time is exceeded (consts.GAMES_LIST_CACHE_TTL)
 */
function refreshGameStubsCache() {
    ReqMaker.doRequest(consts.GAME_SVC_URL + '/games', consts.GAME_STUBS_CACHE_TTL / 2, function cb_refreshGameStubsCache(res: any, body: any, err?: any) {
        // check for Response Code 204 (No Content)
        if (res.statusCode == 204) {
            gameStubs = new Array<IGameStub>();
            log.debug(__filename, 'cb_refreshGameStubsCache()', format('No active games were found.'));
        } else {
            gameStubs = JSON.parse(body);
            if (log.getLogLevel() == LOG_LEVELS.TRACE) dumpArray(gameStubs, 'gameId');
        }

        log.debug(__filename, 'cb_refreshGameStubsCache()', format('gameStubs Cache Updated: %s game stubs loaded.', gameStubs.length));
    });
}

/** DEBUG / TRACE FUNCTIONS HERE **/
/**
 * Useful debug tool - dumps key/val array to debug/trace logs
 *
 * @param list
 * @param key
 */
function dumpArray(list: Array<any>, key: string) {
    list.forEach(item => {
        log.trace(__filename, 'dumpArray()', JSON.stringify(item));
    });
}

/** GRACEFUL SHUTDOWN / CLEANUP FUNCTIONS **/

process.on('SIGINT', function onSigInt() {
    log.info(__filename, 'onSigInt()', 'Got SIGINT - Exiting applicaton...');
    doShutdown();
});

process.on('SIGTERM', function onSigTerm() {
    log.info(__filename, 'onSigTerm()', 'Got SIGTERM - Exiting applicaton...');
    doShutdown();
});

/**
 * Gracefully stop HTTP Server, timers, and other services
 */
function doShutdown() {
    log.info(__filename, 'doShutDown()', 'Closing HTTP Server connections...');
    httpServer.close();

    log.info(__filename, 'doShutDown()', 'Stoping timers...');
    clearInterval(hndGameStubRefreshTimer);
}
