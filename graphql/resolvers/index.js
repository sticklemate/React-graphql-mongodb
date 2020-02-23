const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/users");
const Booking = require("../../models/booking");

const event = async eventIds => {
	try {
		const event = await Event.find({ _id: { $in: eventIds } });

		event.map(event => {
			return {
				...event._doc,
				_id: event.id,
				date: new Date(event._doc.date).toISOString(),
				creator: user.bind(this, event.creator)
			};
		});
		return event;
	} catch (err) {
		throw err;
	}
};

// The only difference from above event is that here we fetch only one event instead of multiple events
const singleEvent = async eventId => {
	try {
		const event = await Event.findById(eventId);
		return {
			...event._doc,
			_id: eventId,
			creator: user.bind(this, event.creator)
		};
	} catch (err) {
		throw err;
	}
};

//replace with functions so query can call the function and return value of property

const user = async userId => {
	try {
		const user = await User.findById(userId);
		return {
			...user._doc,
			_id: user.id,
			createdEvents: event.bind(this, user._doc.createdEvents)
		};
	} catch (err) {
		throw err;
	}
};

module.exports = {
	events: async () => {
		try {
			const events = await Event.find();

			//since mongoDB returns metadata as well, we need to map it to new object for every events
			return events.map(event => {
				return {
					...event._doc,
					_id: event.id,
					date: new Date(event._doc.date).toISOString(),
					creator: user.bind(this, event._doc.creator)
				};
			});
		} catch (err) {
			throw err;
		}
	},

	bookings: async () => {
		try {
			const bookings = await Booking.find();
			return bookings.map(booking => {
				return {
					...booking._doc,
					_id: booking.id,
					user: user.bind(this, booking._doc.user),
					event: singleEvent.bind(this, booking._doc.event),
					createdAt: new Date(booking._doc.createdAt).toISOString(),
					updatedAt: new Date(booking._doc.updatedAt).toISOString()
				};
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

			createdEvent = {
				...result._doc,
				date: new Date(event._doc.date).toISOString(),
				creator: user.bind(this, result._doc.creator)
			};

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
	},

	createUser: async args => {
		try {
			const existingUser = await User.findOne({ email: args.userInput.email });

			if (existingUser) {
				throw new Error("User exists already");
			}
			/*Added extra security to hash password as it will probably not be required to retrieve anywhere. 
            If at all it is needed, then remove the null overide in the then function while returning the result*/
			const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

			//promise for successfull hashing of pwd with 12 rounds of salt value
			const user = new User({
				email: args.userInput.email,
				password: hashedPassword
			});
			const result = await user.save();

			return { ...result._doc, password: null, _id: result.id };
		} catch (err) {
			throw err;
		}
	},
	//access endpoint to book events, user id is hardcoded for the time being, will be changed later
	bookEvent: async args => {
		const fetchedEvent = await Event.findOne({ _id: args.eventId });
		const booking = new Booking({
			user: "5e511b0b03e1ad0778cedc4e",
			event: fetchedEvent
		});
		const result = await booking.save();
		return {
			...result._doc,
			_id: result.id,
			user: user.bind(this, booking._doc.user),
			event: singleEvent.bind(this, booking._doc.event),
			createdAt: new Date(result._doc.createdAt).toISOString(),
			updatedAt: new Date(result._doc.updatedAt).toISOString()
		};
	},
	cancelBooking: async args => {
		try {
			//get the booked event
			const booking = await Booking.findById(args.bookingId).populate("event");
			const event = {
				...booking.event._doc,
				_id: booking.event.id,
				creator: user.bind(this, booking.event._doc.creator)
			};
			await Booking.deleteOne({ _id: args.bookingId });
			return event;
			return;
		} catch (err) {
			throw err;
		}
	}
};
