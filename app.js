const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql"); //import middleware function - take incoming request and forward them to resolvers
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

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
				return events;
			},

			createEvent: args => {
				//event object
				const event = {
					_id: Math.random().toString(),
					title: args.eventInput.title,
					desc: args.eventInput.desc,
					price: +args.eventInput.price,
					date: args.eventInput.date
				};
				events.push(event);
				//resolver always returns everything but graphql returns only data that the front end requests
				return event;
			}
		},
		//graph ql GUI for development purpose
		graphiql: true
	})
);

//Establish connection with MongoDB by using stored username and pwd from env variables

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-xqb0p.mongodb.net/test`
	)
	.then(() => {
		//Promise to establish connection to Mongo cluster then start the server
		app.listen(3000);
	})
	.catch(err => {
		//If connection fails log the error
		console.log(err);
	});
