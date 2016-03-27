'use strict';

import * as openpgp from 'openpgp';
import Password from './Password.js';
import fileSystem from './file-system.js';

export default class Encryption {
    static decrypt(privateKey, publicKey, file, password) {
        return Promise.all([
            privateKey.open(),
            publicKey.open(),
            fileSystem.readFileAsBlob(file)
        ]).then((results) => {
            const privateKey = results[0][0];
            const publicKeys = results[1];
            const message = openpgp.message.read(results[2]);

            if (!privateKey.decrypt(password)) {
                throw new Error('Incorrect password');
            }

            const options = {
                message: message,
                publicKeys: publicKeys,
                privateKey: privateKey,
                armor: false
            };

            return openpgp.decrypt(options);
        }).then(result => new Password(result));
    }

    static encrypt(privateKey, publicKey, file, content) {
        return Promise.all([
            privateKey.open(),
            publicKey.open()
        ]).then((results) => {
            const privateKeys = results[0];
            const publicKeys = results[1];

            const options = {
                data: content,
                publicKeys: publicKeys,
                privateKeys: privateKeys,
                armor: false
            };

            return openpgp.encrypt(options);
        }).then((message) => {
            fileSystem.writeFile(cipherText);
        });
    }
}
