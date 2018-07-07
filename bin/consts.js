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
exports.MAZE_SVC_HOST = process.env.MAZE_SVC_URL || 'http://maze.code-camp-2018.svc';
exports.MAZE_SVC_PORT = process.env.MAZE_SVC_PORT || 80;
exports.SCORE_SVC_HOST = process.env.SCORE_SVC_URL || 'http://score.code-camp-2018.svc';
exports.SCORE_SVC_PORT = process.env.SCORE_SVC_PORT || 80;
exports.TEAM_SVC_HOST = process.env.TEAM_SVC_URL || 'http://team.code-camp-2018.svc';
exports.TEAM_SVC_PORT = process.env.TEAM_SVC_PORT || 80;
exports.GAME_SVC_HOST = process.env.GAME_SVC_URL || 'http://game-server.code-camp-2018.svc';
exports.GAME_SVC_PORT = process.env.GAME_SVC_PORT || 80;
exports.GAME_MON_HOST = process.env.GAME_MON_URL || 'http://monitor.code-camp.svc';
exports.GAME_MON_PORT = process.env.GAME_MON_PORT || 80;
// construct base URLs
exports.MAZE_SVC_URL = util_1.format('%s:%s', exports.MAZE_SVC_HOST, exports.MAZE_SVC_PORT);
exports.SCORE_SVC_URL = util_1.format('%s:%s', exports.SCORE_SVC_HOST, exports.SCORE_SVC_PORT);
exports.TEAM_SVC_URL = util_1.format('%s:%s', exports.TEAM_SVC_HOST, exports.TEAM_SVC_PORT);
exports.GAME_SVC_URL = util_1.format('%s:%s', exports.GAME_SVC_HOST, exports.GAME_SVC_PORT);
exports.GAME_MON_URL = util_1.format('%s:%s', exports.GAME_MON_HOST, exports.GAME_MON_PORT);
// other stuff
exports.LOG_LEVEL = parseInt(process.env.LOG_LEVEL + '') || 3; // 3=INFO is default
exports.GAME_STUBS_CACHE_TTL = parseInt(process.env.GAMES_LIST_CACHE_TTL + '') || 15000; // 15 seconds, by default
exports.APP_VERSION = getPackageVersion();
function getPackageVersion() {
    let data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve('package.json'), 'utf8'));
    return data.version;
}
//# sourceMappingURL=consts.js.map