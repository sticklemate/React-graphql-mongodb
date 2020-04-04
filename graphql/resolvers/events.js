const Event = require("../../models/event");
const { transformEvent } = require("./merge");

module.exports = {
	events: async () => {
		try {
			const events = await Event.find();

			//since mongoDB returns metadata as well, we need to map it to new object for every events
			return events.map(event => {
				return transformEvent(event);
			});
		} catch (err) {
			throw err;
		}
	},

	createEvent: async args => {
		const event = new Event({
			title: args.eventInput.title,
			desc: args.eventInput.desc,
			price: +args.eventInput.price,
			date: new Date(args.eventInput.date),
			creator: "5e511b0b03e1ad0778cedc4e"
		});

		let createdEvent;
		try {
			//mongoDB functionality to save directly into db
			//resolver always returns everything but graphql returns only data that the front end requests
			//executes async operation and wait for it to complete and return our promise
			const result = await event.save();

			createdEvent = transformEvent(result);

			const creator = await User.findById("5e511b0b03e1ad0778cedc4e");
			console.log(result);
			//return result property to provide mongoose that makes up the event object

			//if user does not exists
			if (!creator) {
				throw new Error("User not found");
			}
			creator.createdEvents.push(event);
			await creator.save();

			//once user is added
			return createdEvent;
		} catch (err) {
			console.log(err);
			throw err; //express graphQL can handle and return error
		}
	}
};
