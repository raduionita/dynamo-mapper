type ResolvePathType<PathType, TypeKey extends string = 'type'> = 
  PathType extends typeof String ? string :
    PathType extends typeof Number ? number :
      PathType extends typeof Date ? typeof Date.prototype :
      unknown;

type PathWithType<TypeKey extends string = 'type'> = { [k in TypeKey]:any };

type ObtainPathType<FieldType/*=type OR default*/, TypeKey extends string = 'type'> = 
  ResolvePathType<FieldType extends PathWithType<TypeKey> ? FieldType[TypeKey] : FieldType, TypeKey>;

type InferPathType<PathType /*={type:?,default:?}*/, TypeKey extends string = 'type'> = {
  [K in keyof PathType]: ObtainPathType<PathType, TypeKey>
}[keyof PathType];

type InferModelType<TSchema, TypeKey extends string = 'type'> = { 
  [K in keyof TSchema]: InferPathType<TSchema[K], TypeKey>;
};

class Schema<
  DocType extends InferModelType<DocType> = InferModelType<any>
> {
  constructor(def:DocType) {

  }

}


type InferSchemaType<TSchema> = TSchema extends Schema<infer DocType> ? DocType : unknown;

// const Schema = {
//   name: {type:String},// default:'N/A'},
//   email: {type:String},
//   age: {type:Number},
//   created: {type:Date},
// };

// type Model = InferModelType<typeof Schema>



export function model<TDef = {}, TConfig = {}, TypeKey extends string = 'type'>(def:TDef,config?:TConfig) {

  const schema = new Schema({
    something: {type:String},
  });


  type Type = InferSchemaType<typeof schema>;

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

let u = new UserModel;

UserModel.findOneById('')
