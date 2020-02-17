/* This is graphql test application v 1.0
Main file containing logic for graphQL including query and mutation functions
Need to refactor the promises with async await 
*/

const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql"); //import middleware function - take incoming request and forward them to resolvers
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/users");
const bcrypt = require("bcryptjs");

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

	type User {
		_id: ID!
		email: String!
		password:String
	}

    input EventInput {
        title: String!
        desc:String!
        price:Float!
        date:String!
    }

	input UserInput {
		email: String!
		password: String!
	}
    type RootQuery {
       
    events: [Event!]!

    }

    type RootMutation{

		createEvent(eventInput: EventInput) : Event
		createUser(userInput:UserInput): User
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
					date: new Date(args.eventInput.date),
					creator: "5e4932b40696963db8da4ca7"
				});

				let createdEvent;

				//mongoDB functionality to save directly into db
				//resolver always returns everything but graphql returns only data that the front end requests
				//executes async operation and wait for it to complete and return our promise
				return event
					.save()
					.then(result => {
						createdEvent = { ...result._doc };
						return User.findById("5e4932b40696963db8da4ca7");
						console.log(result);
						//return result property to provide mongoose that makes up the event object
					})
					.then(user => {
						//if user does not exists
						if (!user) {
							throw new Error("User not found");
						}
						user.createdEvents.push(event);
						return user.save();
					})
					.then(result => {
						//once user is added
						return createdEvent;
					})
					.catch(err => {
						console.log(err);
						throw err; //express graphQL can handle and return error
					});
			},

			createUser: args => {
				return User.findOne({ email: args.userInput.email })
					.then(user => {
						if (user) {
							throw new Error("User exists already");
						}
						/*Added extra security to hash password as it will probably not be required to retrieve anywhere. 
					If at all it is needed, then remove the null overide in the then function while returning the result*/
						return bcrypt.hash(args.userInput.password, 12);
					})
					.then(hashedPassword => {
						//promise for successfull hashing of pwd with 12 rounds of salt value
						const user = new User({
							email: args.userInput.email,
							password: hashedPassword
						});
						return user.save();
					})
					.then(result => {
						return { ...result._doc, password: null, _id: result.id };
					})
					.catch(err => {
						throw err;
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
