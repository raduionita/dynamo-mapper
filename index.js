"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolver = exports.Resolver = void 0;
class Resolver {
    constructor(trier) {
        this._trier = { call: null, thens: [] };
        this._orers = [];
        if (trier) {
            this._trier.call = trier;
        }
    }
    try(trier) {
        this._trier.call = trier;
        return this;
    }
    then(call) {
        if (this._orers.length === 0) {
            this._trier.thens.push(call);
        }
        else {
            this._orers[this._orers.length - 1].thens.push(call);
        }
        return this;
    }
    or(call) {
        this._orers.push({ call: call, thens: [] });
        return this;
    }
    exec() {
        return new Promise(async (rez, rej) => {
            const data = await (this._trier.call());
            if (data) {
                let rezl = data;
                let comp = null;
                for (const then of this._trier.thens) {
                    comp = then(rezl);
                    if (comp instanceof Promise)
                        comp = await comp;
                    if (comp && typeof comp === typeof rezl)
                        rezl = comp;
                }
                return rez(rezl);
            }
            else if (this._orers.length !== 0) {
                for (const _orer of this._orers) {
                    const data = await (_orer.call());
                    if (data) {
                        let rezl = data;
                        let comp = null;
                        for (const then of _orer.thens) {
                            comp = then(rezl);
                            if (comp instanceof Promise)
                                comp = await comp;
                            if (comp && typeof comp === typeof rezl)
                                rezl = comp;
                        }
                        return rez(rezl);
                    }
                }
            }
            return rez(null);
        });
    }
}
exports.Resolver = Resolver;
;
function resolver(trier) {
    return new Resolver(trier);
}
exports.resolver = resolver;
(async () => {
    const data = await resolver().try(() => new Promise((rez, rej) => rez(null)))
        .then((data) => (Object.assign({ 'then': '1.1' }, data)))
        .or(() => new Promise((rez, rej) => rez(null)))
        .then((data) => (Object.assign({ 'then': '2.1' }, data)))
        .then((data) => new Promise((rez, rej) => rez(Object.assign(Object.assign({}, data), { then: '2.2' }))))
        .then((data) => new Promise((rez, rej) => rez(1)))
        .or(() => new Promise((rez, rej) => rez({ 'or': 3 })))
        .then((data) => new Promise((rez, rej) => rez(Object.assign(Object.assign({}, data), { 'then': 5 }))))
        .exec();
    console.log(data);
})();
