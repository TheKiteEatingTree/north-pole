'use strict';

import * as urls from './bg/urls.js';
import Encryption from './bg/Encryption.js';
import PrivateKey from './bg/PrivateKey.js';
import PublicKey from './bg/PublicKey.js';
import PassDirectory from './bg/PassDirectory.js';

window.passDir = PassDirectory.fetch();
window.privateKey = PrivateKey.fetch();
window.publicKey = PublicKey.fetch();
window.savePassDir = savePassDir;
window.savePrivateKey = savePrivateKey;
window.savePublicKey = savePublicKey;

chrome.app.runtime.onLaunched.addListener(() => {
    chrome.app.window.create('index.html', {
        'outerBounds': {
            'width': 500,
            'height': 400
        }
    });
});

chrome.runtime.onConnectExternal.addListener((port) => {
    port.onMessage.addListener((msg) => {
        if (msg.cmd === 'sendFiles') {
            sendFiles(port);
        } else if (msg.cmd === 'testPassword') {
            testPassword(msg.password, msg.url, port);
        } else if (msg.cmd === 'decrypt') {
            decrypt(msg.name, msg.password, port);
        }
    });
});

function savePassDir(dir) {
    window.passDir = PassDirectory.save(dir);
    return window.passDir;
}

function savePrivateKey(key) {
    window.privateKey = PrivateKey.save(key);
    return window.privateKey;
}

function savePublicKey(key) {
    window.publicKey = PublicKey.save(key);
    return window.publicKey;
}

function decrypt(name, password, port) {
    const msg = {cmd: 'decrypt'};
    window.passDir.then((passDir) => {
        return Promise.all([
            passDir.findFile(name),
            window.privateKey,
            window.publicKey
        ]);
    }).then((results) => {
        const file = results[0];
        const privateKey = results[1];
        const publicKey = results[2];

        return Encryption.decrypt(privateKey, publicKey, file, password);
    }).then((password) => {
        msg.password = password.toJSON();
        port.postMessage(msg);
    }).catch((err) => {
        msg.error = err.message;
        port.postMessage(msg);
    });
}

function sendFiles(port) {
    const msg = {cmd: 'sendFiles'};
    window.passDir.then(passDir => passDir.getSimpleFiles())
        .then((files) => {
            msg.files = files;
            port.postMessage(msg);
        }).catch((err) => {
            msg.error = err.message;
            port.postMessage(msg);
        });
}

function testPassword(password, url, port) {
    const msg = {cmd: 'testPassword'};
    window.privateKey.then(privateKey => privateKey.testPassword(password))
        .then((success) => {
            if (!success) {
                msg.error = 'Incorrect Password';
            }
            port.postMessage(msg);
            window.setTimeout(() => {
                urls.testUrl(url, password, port);
            }, 10);
        }).catch((err) => {
            msg.error = err.message;
            port.postMessage(msg);
        });
}
