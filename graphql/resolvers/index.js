const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/users");

const event = eventIds => {
	return Event.find({ _id: { $in: eventIds } })
		.then(events => {
			return events.map(event => {
				return {
					...event._doc,
					_id: event.id,
					creator: user.bind(this, event.creator)
				};
			});
		})
		.catch(err => {
			throw err;
		});
};

//replace with functions so query can call the function and return value of property

const user = userId => {
	return User.findById(userId)
		.then(user => {
			return {
				...user._doc,
				_id: user.id,
				createdEvents: event.bind(this, user._doc.createdEvents)
			};
		})
		.catch(err => {
			throw err;
		});
};

module.exports = {
	events: () => {
		return Event.find()
			.then(events => {
				//since mongoDB returns metadata as well, we need to map it to new object for every events
				return events.map(event => {
					return {
						...event._doc,
						_id: event.id,
						creator: user.bind(this, event._doc.creator)
					};
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
				createdEvent = {
					...result._doc,
					creator: user.bind(this, result._doc.creator)
				};
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
};
