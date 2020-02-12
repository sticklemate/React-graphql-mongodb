const express = require('express');
const bodyParser = require ('body-parser');
const graphqlHttp = require ('express-graph-ql'); //import middleware function - take incoming request and forward them to resolvers
const { buildSchema } = require ('graphql');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
//configure graphql api - to find schema, resolver to resolve queries

    schema: buildSchema(`
   
    type RootQuery {


    }

    type RootMutation{


    }

    schema {
        query: RootQuery
        mutation: RootMutation

    }
    `),
    //all resolver functions that need to match our schema endpoints by name
    rootValue: {
     

    }

}))

app.listen(3000);