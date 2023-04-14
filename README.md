# cyber233-api

- cluster berkbook-private
- cluster berkbook-public
- id bb-token-db
- pw 7tAfep0emiGouSXf

- dbname tokenize
- collection tokens



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://bb-token-db:7tAfep0emiGouSXf@berkbook-private.c7xunwb.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
