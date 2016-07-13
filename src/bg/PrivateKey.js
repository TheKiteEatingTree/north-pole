'use strict';

import fs from 'fsystem';
import * as openpgp from 'openpgp';
import storage from './storage.js';

export default class PrivateKey {
    constructor(file) {
        this.file = file;
    }

    static fetch() {
        return storage.fetch('privateKey').then((keyId) => {
            if (!keyId) {
                throw new Error('Please select a private key in northern pass');
            }
            return fs.restoreEntry(keyId);
        }).then((file) => {
            if (!file) {
                throw new Error('Could not find private key');
            }
            return new PrivateKey(file);
        });
    }

    static save(file) {
        const keyId = file.retain();
        return storage.save({'privateKey': keyId}).then(() => {
            return new PrivateKey(file);
        });
    }

    getDisplayPath() {
        return this.file.getDisplayPath();
    }

    open() {
        return this.file.readAsText().then((contents) => {
            const privateKey = openpgp.key.readArmored(contents);
            if (privateKey.err) {
                throw new Error('Could not open private key');
            }
            return privateKey.keys[0];
        });
    }

    testPassword(password) {
        return this.open().then(privateKey => privateKey.decrypt(password));
    }
}
