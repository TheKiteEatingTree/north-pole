'use strict';

const base = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const specials = ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
const max = Math.pow(2, 32) - 1;

export default class Random {
    static generateString(length = 12, useSpecials = true) {
        var array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        let chars = base;
        if (useSpecials) {
            chars += specials;
        }

        let random = '';
        array.forEach((num) => {
            random += chars[Math.floor((num/max) * chars.length)];
        });
        return random;
    }
}
