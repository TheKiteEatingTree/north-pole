'use strict';

import PassDirectory from './bg/PassDirectory.js';
import storage from './bg/storage.js';

let passDir = PassDirectory.fetch;

window.fetchPassDir = passDir;
window.fetchPrivateKey = fetchPrivateKey;
window.savePassDir = savePassDir;
window.savePrivateKey = savePrivateKey;

chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('index.html', {
        'outerBounds': {
            'width': 600,
            'height': 400
        }
    });
});

chrome.runtime.onConnectExternal.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        if (msg.cmd === 'sendFiles') {
            passDir.then((passDir) => {
                port.postMessage({
                    cmd: 'sendFiles',
                    files: passDir.files
                });
            });
        }
    });
});

function savePassDir(dir) {
    passDir = PassDirectory.save(dir);
    return passDir;
}

function fetchPrivateKey() {
    return storage.fetch('privateKey');
}

function savePrivateKey(key) {
    return storage.save({ 'privateKey': key });
}
