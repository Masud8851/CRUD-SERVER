const express = require("express");
const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const port = process.env.PORT || 5000;

require("dotenv").config();

const { MongoClient } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkd0m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const ObjectId = require("mongodb").ObjectId;

async function run() {
	try {
		await client.connect();
		// console.log("database connected successfully");
		const database = client.db("form");
		const dataCollection = database.collection("bioDatas");

		// GET API All Users
		app.get("/bioDatas", async (req, res) => {
			const cursor = dataCollection.find({});
			const bioDatas = await cursor.toArray();
			res.send(bioDatas);
		});

		// Dynamic User GET
		app.get("/bioDatas/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const user = await dataCollection.findOne(query);
			// console.log('load user with id: ', id);
			res.send(user);
		});

		// UPDATE API
		app.put("/biodatas/:id", async (req, res) => {
			const id = req.params.id;
			const updatedUser = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					name: updatedUser.name,
					email: updatedUser.email,
				},
			};
			const result = await dataCollection.updateOne(filter, updateDoc, options);
			res.json(result);
		});

		// DELETE API
		app.delete("/bioDatas/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await dataCollection.deleteOne(query);
			console.log("Deleted");
			res.json(result);
		});

		// POST API
		app.post("/bioDatas", async (req, res) => {
			const newUser = req.body;
			const result = await dataCollection.insertOne(newUser);
			// console.log("User adder successfully", result.insertedId);
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Running my server");
});

app.listen(port, () => {
	console.log("Hitting the posts", port);
});
