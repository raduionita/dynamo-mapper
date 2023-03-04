type Call = ()=>Promise<unknown>;
type Then = (data:unknown)=>unknown;
type Path = {call?:Call, thens:Then[]};

export class Resolver<T = unknown> {
  private _trier:Path   = {call:null, thens:[]} as Path;
  private _orers:Path[] = [];

  constructor(trier?:Call) {
    if (trier) {
      this._trier.call = trier;
    }
  }

  try(trier:Call) : Resolver<T> {
    this._trier.call = trier;
    return this;
  }

  then(call:(data:unknown)=>unknown) : Resolver<T> {
    if (this._orers.length === 0) {
      // or/elser has not been set, add to _trier
      this._trier.thens.push(call);
    } else {
      // or/elser has beens set, add to _elser
      this._orers[this._orers.length-1].thens.push(call);
    }
    return this;
  }

  or(call:Call) : Resolver<T> {
    this._orers.push({call:call, thens:[]});
    return this;
  }

  exec() : Promise<T> {
    return new Promise(async (rez, rej) => {
      const data = await (this._trier.call());
      if (data) {
        let rezl = data;
        let comp = null;
        // exec all .then(s) adjacent to .try
        for (const then of this._trier.thens) {
          comp = then(rezl);
          if (comp instanceof Promise)
            comp = await comp;
          if (comp && typeof comp === typeof rezl)
           rezl = comp;
        }
        // done
        return rez(rezl as T);
      } else if (this._orers.length !== 0) {
        for (const _orer of this._orers) { 
          const data = await (_orer.call());
          // if data => continue w/ thens
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
            // return, skipping the rest of the orers
            return rez(rezl as T);
          }
          // else => continue w/ next or
        }
      }
      return rez(null);
    });
  }
};


export function resolver<T = unknown>(trier?:Call) : Resolver<T> {
  return new Resolver(trier);
}

(async () => {
  const data = await resolver().try(() => new Promise((rez,rej) => rez(null))) // if found => return
                                 .then((data:{}) => ({'then':'1.1', ...data}))
                               .or(() => new Promise((rez,rej) => rez(null))) // if not found return
                                 .then((data:{}) => ({'then':'2.1', ...data}))
                                 .then((data:{}) => new Promise((rez,rej) => rez({...data, then:'2.2'})))
                                 .then((data:{}) => new Promise((rez,rej) => rez(1)))
                               .or(() => new Promise((rez,rej) => rez({'or':3})))
                                 .then((data:{}) => new Promise((rez,rej) => rez({...data,'then':5})))
                               .exec();
  console.log(data);
})();

