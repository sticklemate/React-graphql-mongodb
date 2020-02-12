const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql"); //import middleware function - take incoming request and forward them to resolvers
const { buildSchema } = require("graphql");

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
        _title: String!
        _desc:String!
        _price:float!
        _date:String! 
    }

    input EventInput {
        title: String!
        desc:String!
        price:float!
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
				return ["Hello", "World", "Welcome", "to graphQL"];
			},

			createEvent: args => {
				const eventName = args.name;
				return eventName;
			}
		},
		graphiql: true
	})
);

app.listen(3000);
