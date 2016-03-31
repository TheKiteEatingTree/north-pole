'use strict';

import moment from 'moment';
import * as pgp from './pgp.js';
import Password from './Password.js';

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
                passDir.findFile(result.file)
            ]);
        }).then((results) => {
            const privateKey = results[0];
            const file = results[1];
            return pgp.decrypt(privateKey, file, password);
        }).then((result) => {
            const password = new Password(result.data);
            port.postMessage({
                cmd: 'foundPassword',
                password: password.toJSON()
            });
        });
    }).catch((err) => {
        port.postMessage({
            cmd: 'foundPassword',
            error: `Auto-login error: ${err.message}`
        });
    });
}

function getUrls(password) {
    if (moment.utc().subtract(6, 'hours').isAfter(urlsUpdated)) {
        return new Promise((resolve, reject) => {
            window.setTimeout(function() {
                refreshUrls(password)
                    .then(urls => resolve(urls))
                    .catch(err => reject(err));
            }, 100);
        });
    } else {
        return loadUrls(password);
    }
}

function loadUrls(password) {
    return window.passDir.then((passDir) => {
        return Promise.all([
            window.privateKey,
            passDir.findFile('.urls')
        ]);
    }).then(([privateKey, entry]) => {
        return pgp.decrypt(privateKey, entry, password);
    }).then((result) => {
        const urls = JSON.parse(result.data);
        return urls;
    });
}

function refreshUrls(password) {
    return window.passDir.then((passDir) => {
        return passDir.getFlatFiles().then((files) => {
            return Promise.all([
                Promise.resolve(files),
                window.privateKey
            ]);
        }).then(([files, privateKey]) => {
            return Promise.all(files.map((file) => {
                return pgp.decrypt(privateKey, file, password)
                    .then((result) => {
                        return {
                            file: file,
                            password: new Password(result.data)
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

            return Promise.all([
                Promise.resolve(urls),
                passDir.createFile('.urls.gpg', false),
                window.publicKey
            ]);
        }).then(([urls, entry, publicKey]) => {
            return Promise.all([
                Promise.resolve(urls),
                pgp.encrypt(publicKey, entry, JSON.stringify(urls))
            ]);
        }).then(([urls]) => {
            urlsUpdated = moment.utc();
            return urls;
        });
    });
}
