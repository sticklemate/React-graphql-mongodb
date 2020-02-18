/* This is graphql test application v 1.0
Main file containing logic for graphQL including query and mutation functions
Need to refactor the promises with async await 
*/

const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql"); //import middleware function - take incoming request and forward them to resolvers
const mongoose = require("mongoose");

const graphqlSchema = require("./graphql/schema/index");
const grapqlResolvers = require("./graphql/resolvers/index");

const app = express();

app.use(bodyParser.json());

//configure graphql api - to find schema, resolver to resolve queries
app.use(
	"/graphql",
	graphqlHttp({
		schema: graphqlSchema,
		//all resolver functions that need to match our schema endpoints by name
		rootValue: grapqlResolvers,
		//graph ql GUI for development purpose
		graphiql: true
	})
);

//Establish connection with MongoDB by using stored username and pwd from env variables

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-xqb0p.mongodb.net/${process.env.MONGO_DB}`
	)
	.then(() => {
		//Promise to establish connection to Mongo cluster then start the server
		app.listen(3000);
	})
	.catch(err => {
		//If connection fails log the error
		console.log(err);
	});
