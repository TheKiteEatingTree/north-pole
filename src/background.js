'use strict';

import * as urls from './bg/urls.js';
import * as pgp from './bg/pgp.js';
import Password from './bg/Password.js';
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
        } else if (msg.cmd === 'encrypt') {
            encrypt(msg.name, msg.content, port);
        } else if (msg.cmd === 'create') {
            create(msg.name, port);
        }
    });
});

function create(name, port) {
    const msg = {cmd: 'create'};
    window.passDir.then((dir) => {
        return Promise.all([
            dir.createFile(`${name}.gpg`),
            window.publicKey
        ]);
    }).then((results) => {
        const entry = results[0];
        const publicKey = results[1];

        const password = new Password();
        password.generatePassword();

        return pgp.encrypt(publicKey, entry, password);
    })
    .then(() => port.postMessage(msg))
    .catch((err) => {
        msg.error = err.message;
        port.postMessage(msg);
    });
}

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
            window.privateKey
        ]);
    }).then((results) => {
        const file = results[0];
        const privateKey = results[1];

        return pgp.decrypt(privateKey, file, password);
    }).then((result) => {
        const password = new Password(result.data);
        msg.password = password.toJSON();
        port.postMessage(msg);
    }).catch((err) => {
        msg.error = err.message;
        port.postMessage(msg);
    });
}

function encrypt(name, content, port) {
    const msg = {cmd: 'encrypt'};
    window.passDir.then((passDir) => {
        return Promise.all([
            passDir.findFile(name),
            window.publicKey
        ]);
    }).then((results) => {
        const file = results[0];
        const publicKey = results[1];

        const password = new Password(content);

        return pgp.encrypt(publicKey, file, password);
    }).then((password) => {
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
