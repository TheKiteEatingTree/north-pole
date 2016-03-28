'use strict';

export default class SettingsController {
    constructor(passwordList, pgp, fileSystem, $q, $mdToast) {
        this.passwordList = passwordList;
        this.pgp = pgp;
        this.fileSystem = fileSystem;
        this.promise = $q;
        this.toast = $mdToast;

        this.pgp.privateKey
            .then(privateKey => this.promise.when(privateKey.getDisplayPath()))
            .then(displayPath => this.privateKeyPath = displayPath)
            .catch(err => this.toast.show(this.toast.simple().textContent(err.message)));

        this.pgp.publicKey
            .then(publicKey => this.promise.when(publicKey.getDisplayPath()))
            .then(displayPath => this.publicKeyPath = displayPath)
            .catch(err => this.toast.show(this.toast.simple().textContent(err.message)));

        this.passwordList.passDir
            .then(passDir => this.promise.when(passDir.getDisplayPath()))
            .then(displayPath => this.passDir = displayPath)
            .catch(err => this.toast.show(this.toast.simple().textContent(err.message)));
    }

    selectPrivateKey() {
        this.pgp.selectPrivateKey().then(privateKey => privateKey.getDisplayPath())
            .then(displayPath => this.privateKeyPath = displayPath)
            .catch(err => this.toast.show(this.toast.simple().textContent(err.message)));
    }

    selectPublicKey() {
        this.pgp.selectPublicKey().then(publicKey => publicKey.getDisplayPath())
            .then(displayPath => this.publicKeyPath = displayPath)
            .catch(err => this.toast.show(this.toast.simple().textContent(err.message)));
    }

    selectDir() {
        this.passwordList.selectPassDir().then(passDir => passDir.getDisplayPath())
            .then(displayPath => this.passDir = displayPath)
            .catch(err => this.toast.show(this.toast.simple().textContent(err.message)));
    }
}

SettingsController.$inject = ['passwordList', 'pgp', 'fileSystem', '$q', '$mdToast'];
