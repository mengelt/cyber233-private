import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/routing.js';
import { MongoClient } from 'mongodb';
import { MONGO_URI } from './db/conn.js';

// get MongoDB driver connection
//const dbo = require("./db/conn");

const PORT = process.env.PORT || 5001;
const app = express();

app.use(cors());
app.use(express.json());
app.use(apiRoutes);

// Global error handling
app.use(function (err, _req, res) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


async function startServer() {
  try {

    console.log('\nStarting up OneSpace Tokeninator API');

    // Connect to MongoDB
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB!');
    
    // Use the MongoDB connection in your app
    app.locals.db = client.db('tokenize');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Listing on at http://localhost:${PORT}... Let's tokenate!`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

await startServer();