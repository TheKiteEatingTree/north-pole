'use strict';

import * as openpgp from 'openpgp';
import fileSystem from './file-system.js';
import storage from './storage.js';

export default class PublicKey {
    constructor(entry) {
        this.entry = entry;
    }

    static fetch() {
        return storage.fetch('publicKey').then((keyId) => {
            if (!keyId) {
                throw new Error('Please select a public key in northern pass');
            }
            return fileSystem.restoreEntry(keyId);
        }).then((entry) => {
            if (!entry) {
                throw new Error('Could not find public key');
            }
            return new PublicKey(entry);
        });
    }

    static save(entry) {
        const keyId = fileSystem.retainEntry(entry);
        return storage.save({'publicKey': keyId}).then(() => {
            return new PublicKey(entry);
        });
    }

    getDisplayPath() {
        return fileSystem.getDisplayPath(this.entry);
    }

    open() {
        return fileSystem.readFileAsText(this.entry).then((contents) => {
            const publicKeys = openpgp.key.readArmored(contents).keys;
            if (publicKeys.err) {
                throw new Error('Could not open public key');
            }
            return publicKeys;
        });
    }
}
