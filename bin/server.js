"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// **** Node Imports **** //
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const ReqMaker = __importStar(require("./request"));
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
// **** App Imports **** //
const cc2018_ts_lib_1 = require("cc2018-ts-lib");
const consts = __importStar(require("./consts"));
const Logger_1 = require("cc2018-ts-lib/dist/Logger");
// **** Initialize **** //
let httpServer; // set by app.listen
const enums = cc2018_ts_lib_1.Enums.getInstance(); // instance of shared enum-related helper module
const log = cc2018_ts_lib_1.Logger.getInstance(); // instance of logging helper
const app = express_1.default(); // alias the express server
// pulled from environment variable - see '.env' file in project root
// (more info about .env in README.MD)
log.setLogLevel(consts.LOG_LEVEL); // 3 = INFO
// configure express to use Pug
app.set('views', 'views');
app.set('view engine', 'pug');
// caches for games and game stub data
let games = new Array();
let gameStubs = new Array();
let hndGameStubRefreshTimer;
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
    httpServer = app.listen(consts.GAME_MON_PORT, function () {
        log.info(__filename, 'startServer()', util_1.format('Game Monitor is listening on port %d', consts.GAME_MON_PORT));
        // enable express http compression
        app.use(compression_1.default());
        // This runs for ALL incoming requests
        app.use(function (req, res, next) {
            log.trace(__filename, 'app.listen()', util_1.format('Incoming Request: %s', req.url));
            // add the CORS headers to all responses
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next(); // forces server to look for next route
        });
        // handle index page request
        app.get(['/', '/index'], function (req, res) {
            res.render('index', { host: req.headers.host, games: gameStubs });
        });
        // handle index page request
        app.get(['/live'], function (req, res) {
            res.render('live', {
                host: req.headers.host,
                games: gameStubs,
                gamesUrl: consts.GAME_SVC_URL + '/games'
            });
        });
        // handle images, css, and js file requests
        app.get(['/favicon.ico', '/views/images/:file', '/views/css/:file', '/views/js/:file'], function (req, res) {
            // make sure file exits before sending
            if (fs_1.default.existsSync(path_1.default.resolve('.' + req.path).toString())) {
                res.sendFile(path_1.default.resolve('.' + req.path));
            }
            else {
                res.status(404).send();
            }
        });
        // Catch all - return 404/
        app.get('/*', function (req, res) {
            log.trace(__filename, req.url, 'Route not found, returning 404.');
            res.status(404).render('404', {
                host: req.headers.host,
                image: util_1.format('/views/images/404_%d.jpg', Math.floor(Math.random() * Math.floor(7)) + 1),
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
    ReqMaker.doRequest(consts.GAME_SVC_URL + '/games', consts.GAME_STUBS_CACHE_TTL / 2, function cb_refreshGameStubsCache(res, body, err) {
        // check for Response Code 204 (No Content)
        if (res.statusCode == 204) {
            gameStubs = new Array();
            log.debug(__filename, 'cb_refreshGameStubsCache()', util_1.format('No active games were found.'));
        }
        else {
            gameStubs = JSON.parse(body);
            if (log.getLogLevel() == Logger_1.LOG_LEVELS.TRACE)
                dumpArray(gameStubs, 'gameId');
        }
        log.debug(__filename, 'cb_refreshGameStubsCache()', util_1.format('gameStubs Cache Updated: %s game stubs loaded.', gameStubs.length));
    });
}
/** DEBUG / TRACE FUNCTIONS HERE **/
/**
 * Useful debug tool - dumps key/val array to debug/trace logs
 *
 * @param list
 * @param key
 */
function dumpArray(list, key) {
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
//# sourceMappingURL=server.js.map