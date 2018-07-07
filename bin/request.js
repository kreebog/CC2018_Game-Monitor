"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cc2018_ts_lib_1 = require("cc2018-ts-lib"); // import classes
const util_1 = require("util");
const request_1 = __importDefault(require("request"));
const Logger_1 = require("cc2018-ts-lib/dist/Logger");
// get singleton logger instance
const log = cc2018_ts_lib_1.Logger.getInstance();
/**
 * Wraps http request functionality in a call-back enabled function
 *
 * @param url - URL to request
 * @param callback - Callback to send response data to
 */
function doRequest(url, callback) {
    let fnName = util_1.format('doRequest("%s" -> "%s")', arguments[0], arguments[1].name);
    log.trace(__filename, fnName, 'Initiating request...');
    // make the request
    request_1.default(url, (err, res, body) => {
        // if there's an error during request, log it and eat the response
        if (err) {
            log.error(__filename, fnName, util_1.format('Error from %s %s', url, log.getLogLevel() == Logger_1.LOG_LEVELS.TRACE ? '\n' + err.stack : err.message));
            return;
        }
        // if the statusCode is not something we expect, log it and eat the response
        // TODO: Handle redirect codes?
        if (res.statusCode != 200 && res.statusCode != 204) {
            log.warn(__filename, fnName, util_1.format('Response Code %d (%s) recieved! Discarding response from %s', res.statusCode, res.statusMessage, url));
            return; // eat the response
        }
        // error states managed above, apparently - fire othe callback
        log.trace(__filename, fnName, util_1.format('Response Recieved: \nStatus: %d (%s) \nBody: ', res.statusCode, res.statusMessage, body));
        // fire the callback
        callback(res, body, err);
    });
}
exports.doRequest = doRequest;
//# sourceMappingURL=request.js.map