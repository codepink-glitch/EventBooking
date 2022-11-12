const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
    users: async () => {
        try {
            const users = await User.find();
            return users.map(userRecord => {
                return { ...userRecord._doc, password: null };
            });
        } catch (err) {
            throw err;
        }
    },
    createUser: async args => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });

            if (existingUser) {
                throw new Error("User exists already.");
            }

            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            // const result = await User.save({ email: args.userInput.email, password: hashedPassword });

            const result = await new User({
                email: args.userInput.email,
                password: hashedPassword
            }).save();

            return { ...result._doc, password: null };
        } catch (err) {
            throw err;
        }
    },
    login: async ({email, password}) => {
        const user = await User.findOne({ email: email });

        if (!user) {
            throw new Error("Invalid credentials.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
        }

        const token = jwt.sign({ userId: user.id, email: user.email },
             'somesupersecretkey', 
             { expiresIn: '1h', });
        
        return { userId: user.id, token: token, tokenExpiration: 1 };
    }
};