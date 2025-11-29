export const userTypeDefs=`


type User{
id:Int!
name:String!
email:String!
password:String!
}

type Mutation{
 register(name:String!,email:String!,password:String!):String!
 login(email:String!,password:String!):AuthPayload
 refreshAccessToken:String!
}

type AuthPayload  {
token:String!
id:String!
}

scalar JSON

`