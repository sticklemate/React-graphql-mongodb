const bcrypt = require("bcryptjs");
const User = require("../../models/users");

module.exports = {
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
	}
};
