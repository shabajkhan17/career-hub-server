const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());

// Mongo db connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q0qwx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const categoryCollection = client.db("job-portal").collection("categories");
    const jobCollection = client.db("job-portal").collection("jobs");

    app.get("/all-categories", async (req, res) => {
      const categories = await categoryCollection.find().toArray();
      res.send({ job_categories: categories });
    });
    app.get("/all-jobs", async (req, res) => {
      const {limit =0 } =req.query;
      console.log(limit);
      const jobs = await jobCollection.find().limit(parseInt(limit)).toArray();
      res.send({ job_posts: jobs });
    });
    app.get("/job-details/:id", async (req, res) => {
      const id = req.params.id;

      const jobDetails = await jobCollection.findOne({ _id: new ObjectId(id) });
      res.send(jobDetails);
    });
    // add a job
    app.post("/add-job", async (req, res) => {
      const job = req.body.job;
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    // Update a job
    app.put("/update-job/:id", async (req, res) => {
      const { id } = req.params;
      const { updatedJob } = req.body;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updates = {
        $set: updatedJob,
      };

      // Update method
      const result = await jobCollection.updateOne(filter, updates, options);
      res.send(result);
    });

    // Delete a job
    app.delete("/delete-a-job/:id", async (req, res) => {
      const { id } = req.params;
      
      const filter = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send({ message: "Server is running" });
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
