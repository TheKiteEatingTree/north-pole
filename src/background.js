'use strict';

import * as urls from './bg/urls.js';
import PrivateKey from './bg/PrivateKey.js';
import PassDirectory from './bg/PassDirectory.js';

let passDir = PassDirectory.fetch();
let privateKey = PrivateKey.fetch();

window.passDir = passDir;
window.privateKey = privateKey;
window.savePassDir = savePassDir;
window.savePrivateKey = savePrivateKey;

chrome.app.runtime.onLaunched.addListener(() => {
    chrome.app.window.create('index.html', {
        'outerBounds': {
            'width': 600,
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
    return PassDirectory.save(dir);
}

function savePrivateKey(key) {
    return PrivateKey.save(key);
}

function decrypt(name, password, port) {
    const msg = {cmd: 'decrypt'};
    passDir.then((passDir) => {
        return Promise.all([
            passDir.findFile(name),
            privateKey
        ]);
    }).then((results) => {
        const file = results[0];
        const privateKey = results[1];

        return privateKey.decrypt(file, password);
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
    passDir.then(passDir => passDir.getSimpleFiles())
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
    privateKey.then(privateKey => privateKey.testPassword(password))
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
