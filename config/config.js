if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connect() {
    try {
        client.db(process.env.DB_NAME)
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        await client.close();
    }
}

async function getDb() {
    return client.db(process.env.DB_NAME)
}

module.exports = {
    connect, getDb
}