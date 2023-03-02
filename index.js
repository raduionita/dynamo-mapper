"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Resolver {
    constructor() {
        this._trier = { call: null, thens: [] };
        this._elser = { call: null, thens: [] };
    }
    try(trier) {
        this._trier.call = trier;
        return this;
    }
    then(call) {
        if (!this._elser.call) {
            this._trier.thens.push(call);
        }
        else {
            this._elser.thens.push(call);
        }
        return this;
    }
    or(call) {
        this._elser.call = call;
        return this;
    }
    exec() {
        return new Promise(async (rez, rej) => {
            console.log('exec', 'Promise');
            const data = await (this._trier.call());
            if (data) {
                console.log('exec', 'Promise', 'try');
                let rezl = data;
                console.log('exec', 'Promise', 'try', 'before thens', rezl);
                for (const then of this._trier.thens)
                    rezl = then(rezl);
                console.log('exec', 'Promise', 'try', 'after thens', rezl);
                return rez(rezl);
            }
            else if (this._elser.call) {
                console.log('exec', 'Promise', 'or');
                const data = await (this._elser.call());
                if (data) {
                    let relz = data;
                    let comp = null;
                    for (const then of this._elser.thens) {
                        comp = then(relz);
                        if (comp instanceof Promise)
                            comp = await comp;
                        if (comp)
                            relz = comp;
                    }
                    return rez(relz);
                }
            }
            return rez(null);
        });
    }
}
;
function resolver() {
    return new Resolver;
}
(async () => {
    const data = await resolver().try(() => new Promise((rez, rej) => rez(null)))
        .then((data) => (Object.assign({ 'then': 1 }, data)))
        .or(() => new Promise((rez, rej) => rez({ 'or': 2 })))
        .then((data) => (Object.assign({ 'then': 1 }, data)))
        .then((data) => new Promise((rez, rej) => rez(data)))
        .exec();
    console.log(data);
})();
