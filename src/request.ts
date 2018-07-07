import { Logger } from 'cc2018-ts-lib'; // import classes
import { format } from 'util';
import request from 'request';
import { LOG_LEVELS } from 'cc2018-ts-lib/dist/Logger';

// get singleton logger instance
const log = Logger.getInstance();

/**
 * Wraps http request functionality in a call-back enabled function
 *
 * @param url - URL to request
 * @param callback - Callback to send response data to
 */
export function doRequest(url: string, callback: Function) {
    let fnName = format('doRequest("%s" -> "%s")', arguments[0], arguments[1].name);

    log.trace(__filename, fnName, 'Initiating request...');

    // make the request
    request(url, (err, res, body) => {
        // if there's an error during request, log it and eat the response
        if (err) {
            log.error(__filename, fnName, format('Error from %s %s', url, log.getLogLevel() == LOG_LEVELS.TRACE ? '\n' + err.stack : err.message));
            return;
        }

        // if the statusCode is not something we expect, log it and eat the response
        // TODO: Handle redirect codes?
        if (res.statusCode != 200 && res.statusCode != 204) {
            log.warn(__filename, fnName, format('Response Code %d (%s) recieved! Discarding response from %s', res.statusCode, res.statusMessage, url));
            return; // eat the response
        }

        // error states managed above, apparently - fire othe callback
        log.trace(__filename, fnName, format('Response Recieved: \nStatus: %d (%s) \nBody: ', res.statusCode, res.statusMessage, body));

        // fire the callback
        callback(res, body, err);
    });
}
