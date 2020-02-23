const mongoose = require("mongoose");

const Schema = mongoose.Schema; // schema constructor that mongoose provides

const bookingSchema = new Schema(
	{
		event: {
			type: Schema.Types.ObjectId,
			ref: "Event"
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User"
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("Booking", bookingSchema);
