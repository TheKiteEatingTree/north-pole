'use strict';

import PassDirectory from './bg/PassDirectory.js';
import storage from './bg/storage.js';

let passDir = PassDirectory.fetch();

window.passDir = passDir;
window.fetchPrivateKey = fetchPrivateKey;
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
            passDir.then(passDir => passDir.getSimpleFiles())
                .then((files) => {
                    port.postMessage({
                        cmd: 'sendFiles',
                        files: files
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
