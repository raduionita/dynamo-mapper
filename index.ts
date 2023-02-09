
class Custom { };

type SchemaType<T> = { type:T, default?:any };
type StringSchemaType = typeof String | 'string' | 'String';
type NumberSchemaType = typeof Number | 'number' | 'Number';
type DateSchemaType = typeof Date | 'date' | 'Date';


type StringType = string & SchemaType<string>;


class PathTypeSchema<T> {
  type?:T extends string ? StringSchemaType :
          T extends number ? NumberSchemaType :
            unknown;
  default?: any|null;
}


type IfEquals<T, U, Y = true, N = false> = (<G>() => G extends T ? 1 : 0) extends (<G>() => G extends U ? 1 : 0) ? Y : N;

type ResolvePathType<PathType, Options extends PathTypeSchema<PathType> = {},  TypeKey extends string = 'type'> = 
  PathType extends DateSchemaType ? Date :
    IfEquals<PathType, String> extends true ? string :
      PathType extends typeof String ? string :
        PathType extends typeof Number ? number :    
          unknown;

type PathWithType<TypeKey extends string = 'type'> = { [k in TypeKey]:any };

// type ObtainPathType<FieldType/*=type OR default*/, TypeKey extends string = 'type'> = 
//   ResolvePathType<FieldType extends PathWithType<TypeKey> ? FieldType[TypeKey] : FieldType, TypeKey>;

type ObtainPathType<PathType /*={type:?,default:?}*/, TypeKey extends string = 'type'> = 
   ResolvePathType<PathType extends PathWithType<TypeKey> ? PathType[TypeKey] : PathType, 
                   PathType extends PathWithType<TypeKey> ? Omit<PathType,TypeKey> : {},
                   TypeKey>;


type ObtainDocType<DocDef, TypeKey extends string = 'type'> = { 
  [K in keyof DocDef]: ObtainPathType<DocDef[K], TypeKey>;
};

class Schema<
  DocType extends ObtainDocType<DocType> = ObtainDocType<any>
> {
  constructor(def:DocType) { }
}

type InferSchemaType<TSchema> = TSchema extends Schema<infer DocType> ? DocType : unknown;

// type Model = InferModelType<typeof Schema>

const schema = new Schema({
  created: {type:Date, default:0},
  name: {type:String}, // default:'N/A'},
  email: {type:String},
  age: {type:Number},
});


type Type = InferSchemaType<typeof schema>;

function make() : Type {
  return {} as Type;
};
let xxx = make();
xxx.email;



export function model<TDef = {}, TConfig = {}, TypeKey extends string = 'type'>(def:TDef,config?:TConfig) {


  type Type = string;



  type Model = { 
    new () : Type 
    findOneById(id:string) : Type;
  };

  const Dynamic: Model = function (this:Model) {
    this.findOneById = (id:string) : Type => {
      return null;
    };
  } as any;

  return Dynamic;
}


export const UserModel = model({
  name: {type:String},
  age: {type:Number},
}, { });

const user = new UserModel;


UserModel.findOneById('')
