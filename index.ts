import { type } from "os";

type Then = (data:unknown)=>unknown;
type Path = {call:()=>Promise<unknown>, thens:Then[]};

class Resolver {
  private _trier:Path = {call:null, thens:[]} as Path;
  private _elser:Path = {call:null, thens:[]} as Path;


  try(trier:()=>Promise<unknown>) : Resolver {
    this._trier.call = trier;
    return this;
  }

  then(call:(data:unknown)=>unknown) : Resolver {
    if (!this._elser.call) {
      // or/elser has not been set, add to _trier
      this._trier.thens.push(call);
    } else {
      // or/elser has beens set, add to _elser
      this._elser.thens.push(call);
    }
    return this;
  }

  or(call:()=>Promise<unknown>) : Resolver {
    this._elser.call = call;
    return this;
  }

  exec() : Promise<unknown> {
    return new Promise(async (rez, rej) => {
      console.log('exec', 'Promise')
      const data = await (this._trier.call());
      if (data) {
        console.log('exec', 'Promise', 'try');
        let rezl = data;
        // exec all .then(s) adjacent to .try
        for (const then of this._trier.thens)
          rezl = then(rezl);
        // done
        return rez(rezl);
      } else if (this._elser.call) {
        console.log('exec', 'Promise', 'or')
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
};


function resolver() : Resolver {
  return new Resolver;
}

(async () => {
  const data = await resolver().try(() => new Promise((rez,rej) => rez(null))) // if found => return
                                 .then((data:{}) => ({'then':1, ...data}))
                               .or(() => new Promise((rez,rej) => rez({'or':2}))) // if not found return
                                 .then((data:{}) => ({'then':1, ...data}))
                                 .then((data:{}) => new Promise((rez,rej) => rez(data))) // 
                               .exec();
  console.log(data);
})();

