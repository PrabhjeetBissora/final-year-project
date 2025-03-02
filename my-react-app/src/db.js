//import { MongoClient } from "mongodb"
// source: https://www.mongodb.com/resources/languages/mongodb-with-nodejs#:~:text=Import%20the%20MongoClient%20in%20a,your%20connection%20URI%20to%20it.

const {MongoClient} = require("mongodb");
const MONGO_DB_USER = ""
const MONGO_DB_PASSWORD = ""
const MONGO_DB_SERVER_URL = ""
const mongo_db_uri = "mongodb+srv://{$MONGO_DB_USER}:{$MONGO_DB_PASSWORD}@{$MONGO_DB_SERVER_URL}"

const client = new MongoClient(uri);

async function listDatabases(client){
    const databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};



async function main(){
    try{ 

        await client.connect();

        await listDatabases(client);

        const newUser = {
            name: "John Doe",
            email: "johndoe@example.com",
            phone: "+123456789",
            address: {
                street: "123 Main St",
                city: "New York",
                zip: "10001"
            },
            createdAt: new Date(),
            orders: []
        };

        const db = client.db("user-flight-journies"); // Select the database
        const usersCollection = db.collection("users"); // Select the collection

        const result = await usersCollection.insertOne(newUser);

        console.log("Customer inserted with ID: ", result.insertedId);

        //await createCollection();

    } catch (error) {
        console.log("Error in MongoDB script: ", error);
    } finally{
        await client.close();
    }
}

main();