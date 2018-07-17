"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// grab the current environment
exports.NODE_ENV = process.env.NODE_ENV || 'production';
// load env vars (or defaults if not found - aka PROD)
const MAZE_SVC_HOST = process.env.MAZE_SVC_URL || 'http://maze-service.code-camp.svc';
const MAZE_SVC_PORT = process.env.MAZE_SVC_PORT || 8080;
const SCORE_SVC_HOST = process.env.SCORE_SVC_URL || 'http://score-service.code-camp.svc';
const SCORE_SVC_PORT = process.env.SCORE_SVC_PORT || 8080;
const TEAM_SVC_HOST = process.env.TEAM_SVC_URL || 'http://team-service.code-camp.svc';
const TEAM_SVC_PORT = process.env.TEAM_SVC_PORT || 8080;
const GAME_SVC_HOST = process.env.GAME_SVC_URL || 'http://game-server.code-camp.svc';
const GAME_SVC_PORT = process.env.GAME_SVC_PORT || 8080;
const GAME_SVC_HOST_EXT = process.env.GAME_SVC_EXT_URL || 'http://game.code-camp-2018.com';
const GAME_SVC_PORT_EXT = process.env.GAME_SVC_EXT_PORT || 80;
exports.GAME_MON_HOST = process.env.GAME_MON_URL || 'http://game-monitor.code-camp.svc';
exports.GAME_MON_PORT = process.env.GAME_MON_PORT || 8080;
// construct base URLs
exports.MAZE_SVC_URL = util_1.format('%s:%s', MAZE_SVC_HOST, MAZE_SVC_PORT);
exports.SCORE_SVC_URL = util_1.format('%s:%s', SCORE_SVC_HOST, SCORE_SVC_PORT);
exports.TEAM_SVC_URL = util_1.format('%s:%s', TEAM_SVC_HOST, TEAM_SVC_PORT);
exports.GAME_SVC_URL = util_1.format('%s:%s', GAME_SVC_HOST, GAME_SVC_PORT);
exports.GAME_SVC_URL_EXT = util_1.format('%s:%s', GAME_SVC_HOST_EXT, GAME_SVC_PORT_EXT);
exports.GAME_MON_URL = util_1.format('%s:%s', exports.GAME_MON_HOST, exports.GAME_MON_PORT);
// other stuff
exports.LOG_LEVEL = parseInt(process.env.LOG_LEVEL + '') || 3; // 3=INFO is default
exports.APP_VERSION = getPackageVersion();
// sets the AJAX Current Games refresh interval on HTML Pages
exports.GAME_LIST_REFRESH_RATE = parseInt(process.env.GAME_LIST_REFRESH_RATE + '') || 5000; // 15 seconds, by default
function getPackageVersion() {
    let data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve('package.json'), 'utf8'));
    return data.version;
}
//# sourceMappingURL=consts.js.map