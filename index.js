const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Debugging environment variables
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cjch2a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoClient options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Main function to run the server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Collections
    const usersCollection = client.db("bhromonkariDB").collection("users");
    const tourPlacesCollection = client.db("bhromonkariDB").collection("tourPlaces");
    const touristWalletCollection = client.db("bhromonkariDB").collection("touristWallet");

    // Routes
    app.get('/users', async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
      }
    });

    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
      }
    });

    app.patch('/users/:email', async (req, res) => {
      const { email } = req.params;
      const updateData = req.body;
      try {
        const result = await usersCollection.updateOne(
          { email: email },
          { $set: updateData }
        );
        if (result.matchedCount === 0) {
          return res.status(404).send('User not found');
        }
        res.send(result);
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
      }
    });

    app.get('/tour-places', async (req, res) => {
      try {
        const result = await tourPlacesCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching tour places:', error);
        res.status(500).send('Error fetching tour places');
      }
    });

    app.get('/tour-places/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne({ _id: new ObjectId(id) });
        if (!tourPlace) {
          return res.status(404).send('Tour place not found');
        }
        res.send(tourPlace);
      } catch (error) {
        console.error('Error fetching tour place:', error);
        res.status(500).send('Error fetching tour place');
      }
    });

      //Hotel Data
    app.get('/tour-places/:id/hotel', async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne(
          { _id: new ObjectId(id) },
          { projection: { hotel: 1 } } // Project only the hotel field
        );
        if (!tourPlace) {
          return res.status(404).send('Tour place not found');
        }
        res.send(tourPlace.hotel || []);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).send('Error fetching hotels');
      }
    });

    //Tour Guide Data
    app.get('/tour-places/:id/tourGuide', async (req, res) => {
      const { id } = req.params;
      try {
        const tourPlace = await tourPlacesCollection.findOne(
          { _id: new ObjectId(id) },
          { projection: { tourGuide: 1 } } // Project only the tourGuide field
        );
        if (!tourPlace) {
          return res.status(404).send('Tour place not found');
        }
        res.send(tourPlace.tourGuide || []);
      } catch (error) {
        console.error('Error fetching tourGuide:', error);
        res.status(500).send('Error fetching tourGuide');
      }
    });

    // Tourist Wallet Data
    app.get('/tourist-wallet', async (req, res) => {
      try {
        const result = await touristWalletCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching tourist wallet:', error);
        res.status(500).send('Error fetching tourist wallet');
      }
    });

    // Ping the database
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Start the server
    app.listen(port, () => {
      console.log(`Bhromonkari server listening on port ${port}`);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    await client.close();
  }
}

// Properly close the MongoDB connection on application shutdown
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB client disconnected');
  process.exit(0);
});

// Start the run function
run().catch(console.dir);

// Serve main HTML file for all other routes
app.get('/', (req, res) => {
  res.send('Bhromonkari server is running');
});
