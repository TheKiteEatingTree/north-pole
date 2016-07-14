'use strict';

import * as pgp from './pgp.js';
import Password from './Password.js';

function wildCardToRegex(url) {
    let regex = url.replace('*', '.*');
    return new RegExp(regex);
}

export function editUrl(name, url, password) {
    return loadUrls(password).then((urls) => {
        const i = urls.findIndex((url) => url.file == name);
        if (url && i > -1) {
            urls[i].url = url;
        } else if (url) {
            urls.push({
                file: name,
                url
            });
        } else if (i > -1) {
            urls.splice(i, 1);
        }

        return window.passDir.then((passDir) => {
            return Promise.all([
                Promise.resolve(urls),
                passDir.findFile('.urls.gpg'),
                window.publicKey
            ]);
        });
    }).then(([urls, file, publicKey]) => {
        return pgp.encrypt(publicKey, file, JSON.stringify(urls));
    });
}

export function testUrl(url, password, port) {
    return loadUrls(password).then((urls) => {
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
        throw err;
    });
}

function loadUrls(password) {
    return window.passDir.then((passDir) => {
        return Promise.all([
            window.privateKey,
            passDir.findFile('.urls.gpg')
        ]);
    }).then(([privateKey, file]) => {
        return pgp.decrypt(privateKey, file, password);
    }).then((result) => {
        const urls = JSON.parse(result.data);
        return urls;
    });
}

export function refreshUrls(password) {
    return window.passDir.then((passDir) => {
        return passDir.getFlatFiles().then((files) => {
            files.forEach((file, index, files) => {
                if (file.name[0] === '.' || file.name.slice(-4) !== '.gpg') {
                    files.splice(index, 1);
                }
            });
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
                let path = result.file.entry.fullPath;
                path = path.slice(passDir.dir.name.length + 2);
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
        }).then(([urls, file, publicKey]) => {
            return Promise.all([
                Promise.resolve(urls),
                pgp.encrypt(publicKey, file, JSON.stringify(urls))
            ]);
        }).then(([urls]) => {
            return urls;
        });
    });
}
