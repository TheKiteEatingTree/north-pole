'use strict';

import moment from 'moment';
import Encryption from './Encryption.js';

let urlsUpdated = moment.utc().subtract(6, 'hours');

function wildCardToRegex(url) {
    let regex = url.replace('*', '.*');
    return new RegExp(regex);
}

export function testUrl(url, password, port) {
    return getUrls(password).then((urls) => {
        const results = urls.filter((testUrl) => {
            const urlRegex = wildCardToRegex(testUrl.url);
            return urlRegex.test(url);
        });

        if (!results.length) {
            return false;
        }

        let result = null;
        if (results.length > 1) {
            result = results.reduce((prev, cur) => {
                const prevReg = wildCardToRegex(prev.url);

                if (prevReg.test(cur.url)) {
                    return cur;
                } else {
                    return prev;
                }
            });
        } else {
            result = results[0];
        }

        if (!result) {
            return false;
        }

        return window.passDir.then((passDir) => {
            return Promise.all([
                window.privateKey,
                window.publicKey,
                passDir.findFile(result.file)
            ]);
        }).then((results) => {
            const privateKey = results[0];
            const publicKey = results[1];
            const file = results[2];
            return Encryption.decrypt(privateKey, publicKey, file, password);
        }).then((password) => {
            port.postMessage({
                cmd: 'foundPassword',
                password: password.toJSON()
            });
        });
    });
}

export function getUrls(password) {
    if (moment.utc().subtract(6, 'hours').isAfter(urlsUpdated)) {
        return refreshUrls(password);
    } else {
        //TODO: save urls to single encrypted file in refresh and load that file here
        return refreshUrls(password);
    }
}

export function refreshUrls(password) {
    return window.passDir.then((passDir) => {
        return passDir.getFlatFiles().then((files) => {
            return Promise.all([
                Promise.resolve(files),
                window.privateKey,
                window.publicKey
            ]);
        }).then((results) => {
            const files = results[0];
            const privateKey = results[1];
            const publicKey = results[2];

            return Promise.all(files.map((file) => {
                return Encryption.decrypt(privateKey, publicKey, file, password)
                    .then((password) => {
                        return {
                            file: file,
                            password: password
                        };
                    });
            }));
        }).then((results) => {
            let urls = results.filter((result) => result.password.url);
            urls = urls.map((result) => {
                let path = result.file.fullPath.slice(0, -4);
                path = path.slice(passDir.entry.name.length + 2);
                return {
                    file: path,
                    url: result.password.url
                };
            });
            urlsUpdated = moment.utc();
            return urls;
        });
    });
}
