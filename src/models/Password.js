'use strict';

export default class Password {
    constructor(data) {
        const lines = data.data.split('\n');

        this.password = lines[0];
        this.url = '';
        this.user = '';

        lines.forEach((line) => {
            if (line.startsWith('url:')) {
                this.url = line.slice(4).trim();
            } else if (line.startsWith('user:')) {
                this.user = line.slice(5).trim();
            }
        });
    }
}
