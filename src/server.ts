// **** Node Imports **** //
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
let lastGameStubsRefresh: number = 0;

// now start the server
startServer();

/* END OF SETUP SECTION */

function startServer() {
    log.info(__filename, 'startServer()', 'Starting Game Monitor v' + consts.APP_VERSION);

    // refresh caches
    refreshGameStubsCache();

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

            // check for game stub cache expiration & refresh if needed
            if (Date.now() - lastGameStubsRefresh > consts.GAME_STUBS_CACHE_TTL) {
                log.info(__filename, 'startServer()', format('mazeList cache expired - calling refresh.'));
                refreshGameStubsCache();
            }

            next(); // forces server to look for next route
        });

        // handle index page request
        app.get('/index', function(req, res) {
            res.render('index', {
                contentType: 'text/html',
                responseCode: 200,
                host: req.headers.host,
                games: gameStubs
            });
        });

        // handle favicon requests
        app.get('/favicon.ico', (req, res) => {
            res.status(200).sendFile(path.resolve('./views/favicon.ico'));
        });

        // handle images, css, and js file requests
        app.get(['/views/images/:file', '/views/css/:file', '/views/js/:file'], function(req, res) {
            res.sendFile(path.resolve('.' + req.path));
        });

        // handle root URL with redirect to /index
        app.get('/', function(req, res) {
            res.redirect('/index');
        });

        // Catch all - return 404/
        app.get('/*', function(req, res) {
            log.trace(__filename, req.url, 'Route not found, returning 404.');
            res.render('404', {
                contentType: 'text/html',
                responseCode: 404,
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
    ReqMaker.doRequest(consts.GAME_SVC_URL + '/games', function cb_refreshGameStubsCache(res: any, body: any, err?: any) {
        // check for Response Code 204 (No Content)
        if (res.statusCode == 204) {
            gameStubs = new Array<IGameStub>();
            log.debug(__filename, 'cb_refreshGameStubsCache()', format('No active games were found.'));
        } else {
            gameStubs = JSON.parse(body);
            dumpArray(gameStubs, 'gameId');
        }

        lastGameStubsRefresh = Date.now();
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
        log.debug(__filename, 'dumpArray()', format('%s=%s', key, item[key]));
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

function doShutdown() {
    // gracefully shut down all servers/services
    log.info(__filename, 'doShutDown()', 'Closing HTTP Server connections...');
    httpServer.close();
}
