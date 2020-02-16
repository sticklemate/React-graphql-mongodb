//Javascript model created with Mongoose package to manage data creating a Model view controller
const mongoose = require("mongoose");
const Schema = mongoose.Schema; //access constructor function from Mongoose

const eventSchema = new Schema({
	//Define SCHEMA strucutre of event object throughout our entire app
	//Like plan, them model then is the blueprint which incorporates the plan to create objects to work with our app

	title: {
		type: String,
		require: true
	},
	desc: {
		type: String,
		require: true
	},
	price: {
		type: Number,
		require: true
	},
	date: {
		type: Date,
		required: true
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}
});

module.exports = mongoose.model("Event", eventSchema);
