const Event = require("../../models/event");
const User = require("../../models/users");
const {dateToString} = require("../../helpers/date");

const event = async eventIds => {
	try {
		const event = await Event.find({ _id: { $in: eventIds } });

		return event.map(event => {
			return transformEvent(event);
		});
	} catch (err) {
		throw err;
	}
};

// The only difference from above event is that here we fetch only one event instead of multiple events
const singleEvent = async eventId => {
	try {
		const event = await Event.findById(eventId);
		return transformEvent(event);
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
			createdEvents: event.bind(this, user._doc.createdEvents) //binding create events to event function
		};
	} catch (err) {
		throw err;
	}
};

const transformEvent = event => {
	return {
		...event._doc,
		_id: event.id,
		date: dateToString(event._doc.date),
		creator: user.bind(this, event.creator)
	};
};

const transformBooking = booking => {
	return {
		...booking._doc,
		_id: booking.id,
		user: user.bind(this, booking._doc.user),
		event: singleEvent.bind(this, booking._doc.event),
		createdAt: dateToString(booking._doc.createdAt),
		updatedAt: dateToString(booking._doc.updatedAt)
	};
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

//exports.user =user;
// exports.event =event;
// exports.singleEvent =singleEvent;
