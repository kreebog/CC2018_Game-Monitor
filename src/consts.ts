require('dotenv').config();
import { format } from 'util';
import fs from 'fs';
import path from 'path';

// grab the current environment
export const NODE_ENV = process.env.NODE_ENV || 'production';

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

export const GAME_MON_HOST = process.env.GAME_MON_URL || 'http://game-monitor.code-camp.svc';
export const GAME_MON_PORT = process.env.GAME_MON_PORT || 8080;

// construct base URLs
export const MAZE_SVC_URL = format('%s:%s', MAZE_SVC_HOST, MAZE_SVC_PORT);
export const SCORE_SVC_URL = format('%s:%s', SCORE_SVC_HOST, SCORE_SVC_PORT);
export const TEAM_SVC_URL = format('%s:%s', TEAM_SVC_HOST, TEAM_SVC_PORT);
export const GAME_SVC_URL = format('%s:%s', GAME_SVC_HOST, GAME_SVC_PORT);
export const GAME_SVC_URL_EXT = format('%s:%s', GAME_SVC_HOST_EXT, GAME_SVC_PORT_EXT);
export const GAME_MON_URL = format('%s:%s', GAME_MON_HOST, GAME_MON_PORT);

// other stuff
export const LOG_LEVEL = parseInt(process.env.LOG_LEVEL + '') || 3; // 3=INFO is default
export const APP_VERSION = getPackageVersion();

// sets the AJAX Current Games refresh interval on HTML Pages
export const GAME_LIST_REFRESH_RATE = parseInt(process.env.GAME_LIST_REFRESH_RATE + '') || 5000; // 15 seconds, by default

function getPackageVersion(): string {
    let data = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
    return data.version;
}
