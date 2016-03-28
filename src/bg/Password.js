'use strict';

export default class Password {
    constructor(data) {
        this.password = '';
        this.user = '';
        this.url = '';
        this.notes = '';

        if (typeof data === 'string') {
            this.parseString(data);
        } else {
            if (typeof data.password !== 'undefined') {
                this.password = data.password;
            }
            if (typeof data.user !== 'undefined') {
                this.user = data.user;
            }
            if (typeof data.url !== 'undefined') {
                this.url = data.url;
            }
            if (typeof data.notes !== 'undefined') {
                this.notes = data.notes;
            }
        }
    }

    parseString(data) {
        const lines = data.split('\n');

        if (!lines.length) return;

        this.password = lines[0];
        lines.splice(0, 1);

        lines.some((line, index, lines) => {
            if (line.startsWith('user:')) {
                this.user = line.slice(5).trim();
                lines.splice(index, 1);
                return true;
            }
        });

        lines.some((line, index, lines) => {
            if (line.startsWith('url:')) {
                this.url = line.slice(4).trim();
                lines.splice(index, 1);
                return true;
            }
        });

        this.notes = lines.join('\n').trim();
    }

    toJSON() {
        return {
            password: this.password,
            user: this.user,
            url: this.url,
            notes: this.notes
        };
    }

    toString() {
        return `${this.password}
user: ${this.user}
url: ${this.url}

${this.notes}`;
    }
}
