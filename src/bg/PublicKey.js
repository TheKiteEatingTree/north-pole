'use strict';

import fs from 'chrome-fs';
import * as openpgp from 'openpgp';
import storage from './storage.js';

export default class PublicKey {
    constructor(file) {
        this.file = file;
    }

    static fetch() {
        return storage.fetch('publicKey').then((keyId) => {
            if (!keyId) {
                throw new Error('Please select a public key in northern pass');
            }
            return fs.restoreEntry(keyId);
        }).then((file) => {
            if (!file) {
                throw new Error('Could not find public key');
            }
            return new PublicKey(file);
        });
    }

    static save(file) {
        const keyId = file.retain();
        return storage.save({'publicKey': keyId}).then(() => {
            return new PublicKey(file);
        });
    }

    getDisplayPath() {
        return this.file.getDisplayPath();
    }

    open() {
        return this.file.readAsText().then((contents) => {
            const publicKeys = openpgp.key.readArmored(contents);
            if (publicKeys.err) {
                throw new Error('Could not open public key');
            }
            return publicKeys.keys;
        });
    }
}
