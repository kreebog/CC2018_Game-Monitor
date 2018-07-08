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
export function doRequest(url: string, timeout: number, callback: Function) {
    let fnName = format('doRequest("%s" -> "%s")', arguments[0], arguments[1], arguments[2].name);
    let start = Date.now();
    log.debug(__filename, fnName, 'Initiating request.');

    request({ uri: url, timeout: timeout }, (err, res, body) => {
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

        // make sure that the content type is JSON, but don't overwrite existing errors
        let ct: string;
        if (res !== undefined && res.headers !== undefined) {
            ct = res.headers['content-type'] + '';
            if (ct.toLowerCase() != 'application/json; charset=utf-8') {
                err = new Error(format('Invalid Content Type [%s], expected [application/json]', ct));
            }
        }

        // error states managed above, apparently - fire othe callback
        log.debug(__filename, fnName, format('Response %d (%s) recieved in %dms.', res.statusCode, res.statusMessage, Date.now() - start));
        log.trace(__filename, fnName, format('Response Body\n: ', body));

        // fire the callback
        callback(res, body, err);
    });
}
