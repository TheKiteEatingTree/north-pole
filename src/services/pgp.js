'use strict';

export default class PGP {
    constructor($q, fileSystem, bg) {
        this.promise = $q;
        this.fileSystem = fileSystem;
        this.bg = bg.getBackgroundPage();

        this.privateKey = this.bg.then((bg) => {
            return this.promise.when(bg.privateKey);
        });

        this.publicKey = this.bg.then((bg) => {
            return this.promise.when(bg.publicKey);
        });
    }

    selectPrivateKey() {
        return this.fileSystem.chooseEntry({
            type: 'openFile',
            accepts: [{extensions: ['asc']}],
            acceptsAllTypes: false
        }).then((entry) => {
            return this.bg.then(bg => this.promise.when(bg.savePrivateKey(entry)));
        }).then((privateKey) => {
            this.privateKey = this.promise.when(privateKey);
            return privateKey;
        });
    }

    selectPublicKey() {
        return this.fileSystem.chooseEntry({
            type: 'openFile',
            accepts: [{extensions: ['asc']}],
            acceptsAllTypes: false
        }).then((entry) => {
            return this.bg.then(bg => this.promise.when(bg.savePublicKey(entry)));
        }).then((publicKey) => {
            this.publicKey = this.promise.when(publicKey);
            return publicKey;
        });
    }
}

PGP.$injects = ['$q', 'fileSystem'];
