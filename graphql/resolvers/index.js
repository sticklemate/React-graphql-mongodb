const authResolver = require("./auth");
const eventResolver = require("./events");
const bookingResolver = require("./booking");

//Merge all resolvers into one root resolver

const rootResolver = {
	...authResolver,
	...eventResolver,
	...bookingResolver
};

module.exports = rootResolver;
