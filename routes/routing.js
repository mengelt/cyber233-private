/*

Requires a multi-stage breach to compromise data. 

Can support token-cycling in the event of a single stage breach

uses uuid v4 to eliminate predictability

the token is not sent to the client ever

-private server endpoints

/token - generates tokens
/exchange - gets an id and returns its token

// https://en.wikipedia.org/w/index.php?title=Universally_unique_identifier&oldid=755882275#Random_UUID_probability_of_duplicates
    // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)


*/

import express from 'express';
import {v4 as uuidv4} from 'uuid';
import { MongoClient, ServerApiVersion } from 'mongodb';

const apiRoutes = express.Router();

// This will help us connect to the database
//const dbo = require("../db/conn");

apiRoutes.route("/login").post(async function (req, res) {

  console.info(`* login attempt for ${req.body.email}`)
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      return res.status(401).json({ error: 'Invalid email and/or password.' });
    }

    if (!password) {
      return res.status(401).json({ error: 'Invalid email and/or password.' });
    }

    const db = req.app.locals.db;
    const tokensCollection = db.collection('tokens');

    const document = await tokensCollection.findOne({ email, password });

    if ( document === null ) {
      console.info(`user document not found for ${email}`)
      return res.status(401).json({ error: 'Invalid email and/or password.' });
    }

    console.info(`user document found for ${email}`)
    let user = {
      email: document.email,
      name: document.name
    };

    res.status(200).json({ user });    
  
  } catch (error) {
    console.error('Error negotiating token exchange:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

apiRoutes.route("/token").post(async function (req, res) {

  console.info('/token request', req.body)
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const db = req.app.locals.db;
    const tokensCollection = db.collection('tokens');

    // Check if the email address already exists
    const existingEmail = await tokensCollection.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email address is already in use' });
    } else {
      console.info('email not in use, insert a record')
    }

    let myuuid = uuidv4();

    const result = await tokensCollection.insertOne({ token: myuuid, name, email, password });
    
    res.status(201).json({ token: myuuid });    

  } catch (error) {
    console.error('Error negotiating token exchange:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

/* receives email address and exchanges it identity's token */
apiRoutes.route("/exchange").post(async function (req, res) {

  console.info('* token exchange request')
  console.info('req', req.body.email)
  
  const email = req.body.email;
  
  if (!email) {
    return res.status(401).json({ error: 'Invalid email and/or password.' });
  }

  const db = req.app.locals.db;
  const tokensCollection = db.collection('tokens');

  const document = await tokensCollection.findOne({ email });

  if ( document === null ) {
    console.info(`user document not found for ${email}`)
    return res.status(401).json({ error: 'Missing document' });
  }


  // https://en.wikipedia.org/w/index.php?title=Universally_unique_identifier&oldid=755882275#Random_UUID_probability_of_duplicates
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)

  console.info('exchanged token', document.token)

  res.status(200).json({ token: document.token });

});

/* receives email address and exchanges it identity's token */
apiRoutes.route("/friends").post(async function (req, res) {

  console.info('* friends of token request')
  console.info('req', req.body.token)
  
  const token = req.body.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Invalid email and/or password.' });
  }

  const db = req.app.locals.db;
  const tokensCollection = db.collection('tokens');

  const document = await tokensCollection.findOne({ token });

  if ( document === null ) {
    console.info(`user document not found for ${token}`)
    return res.status(401).json({ error: 'Missing document' });
  }


  // https://en.wikipedia.org/w/index.php?title=Universally_unique_identifier&oldid=755882275#Random_UUID_probability_of_duplicates
  // https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)

  console.info('friends found', document.friends)

  res.status(200).json({ friends: document.friends });

});


export default apiRoutes;