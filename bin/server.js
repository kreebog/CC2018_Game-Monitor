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
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const ReqMaker = __importStar(require("./request"));
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
// **** App Imports **** //
const cc2018_ts_lib_1 = require("cc2018-ts-lib");
const consts = __importStar(require("./consts"));
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
let lastGameStubsRefresh = 0;
// now start the server
startServer();
/* END OF SETUP SECTION */
function startServer() {
    log.info(__filename, 'startServer()', 'Starting Game Monitor v' + consts.APP_VERSION);
    // refresh caches
    refreshGameStubsCache();
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
            // check for game stub cache expiration & refresh if needed
            if (Date.now() - lastGameStubsRefresh > consts.GAME_STUBS_CACHE_TTL) {
                log.info(__filename, 'startServer()', util_1.format('mazeList cache expired - calling refresh.'));
                refreshGameStubsCache();
            }
            next(); // forces server to look for next route
        });
        // handle index page request
        app.get('/index', function (req, res) {
            res.render('index', {
                contentType: 'text/html',
                responseCode: 200,
                host: req.headers.host,
                games: gameStubs
            });
        });
        // handle favicon requests
        app.get('/favicon.ico', (req, res) => {
            res.status(200).sendFile(path_1.default.resolve('./views/favicon.ico'));
        });
        // handle images, css, and js file requests
        app.get(['/images/:file', '/css/:file', '/js/:file'], function (req, res) {
            res.sendFile(path_1.default.resolve('./views' + req.path));
        });
        // handle root URL with redirect to /index
        app.get('/', function (req, res) {
            res.redirect('/index');
        });
        // Catch all - return 404
        app.get('/*', function (req, res) {
            log.trace(__filename, req.url, 'Route not found, returning 404.');
            res.render('404', {
                contentType: 'text/html',
                responseCode: 404,
                host: req.headers.host,
                image: util_1.format('/images/404_%d.jpg', Math.floor(Math.random() * Math.floor(7)) + 1),
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
    ReqMaker.doRequest(consts.GAME_SVC_URL + '/games', function cb_refreshGameStubsCache(res, body, err) {
        // check for Response Code 204 (No Content)
        if (res.statusCode == 204) {
            gameStubs = new Array();
            log.debug(__filename, 'cb_refreshGameStubsCache()', util_1.format('No active games were found.'));
        }
        else {
            gameStubs = JSON.parse(body);
            dumpArray(gameStubs, 'id');
        }
        lastGameStubsRefresh = Date.now();
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
        log.debug(__filename, 'dumpArray()', util_1.format('%s=%s', key, item[key]));
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
//# sourceMappingURL=server.js.map