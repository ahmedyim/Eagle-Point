import * as mongoose from "mongoose"

export async function DB_Conect() {
     mongoose.connect(process.env.DATABASE_URL??"").
    then(data=>console.log("DB Conect"))
    .catch(error=>console.log(`Error connecting db ${error}`))
}

