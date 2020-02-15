const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql"); //import middleware function - take incoming request and forward them to resolvers
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event.js");

const app = express();
const events = [];

app.use(bodyParser.json());

app.use(
	"/graphql",
	graphqlHttp({
		//configure graphql api - to find schema, resolver to resolve queries

		schema: buildSchema(`
   
    type Event {
        _id: ID!
        title: String!
        desc:String!
        price:Float!
        date:String! 
    }

    input EventInput {
        title: String!
        desc:String!
        price:Float!
        date:String!
    }

    type RootQuery {
       
    events: [Event!]!

    }

    type RootMutation{

        createEvent(eventInput: EventInput) : Event
    }

    schema {
        query: RootQuery
        mutation: RootMutation

    }
    `),
		//all resolver functions that need to match our schema endpoints by name
		rootValue: {
			events: () => {
				return Event.find()
					.then(events => {
						//since mongoDB returns metadata as well, we need to map it to new object for every events
						return events.map(event => {
							return { ...event._doc };
						});
					})
					.catch(err => {
						throw err;
					});
			},

			createEvent: args => {
				const event = new Event({
					title: args.eventInput.title,
					desc: args.eventInput.desc,
					price: +args.eventInput.price,
					date: new Date(args.eventInput.date)
				});

				//mongoDB functionality to save directly into db
				//resolver always returns everything but graphql returns only data that the front end requests
				//executes async operation and wait for it to complete and return our promise
				return event
					.save()
					.then(result => {
						console.log(result);
						return { ...result._doc }; //return result property provide mongoose that makes up the event object
					})
					.catch(err => {
						console.log(err);
						throw err; //express graphQL can handle and return error
					});
			}
		},
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
