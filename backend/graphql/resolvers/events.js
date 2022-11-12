const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');
const { checkAuth } = require('../../helpers/authHandler');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(transformEvent);
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args, request) => {
        checkAuth(request);

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: request.userId
        });
        
        try {
            const result = await event.save();
            const creatorUser = await User.findById(request.userId);

            if (!creatorUser) {
                throw new Error("Creator not found by id.");
            }

            creatorUser.createdEvents.push(event);
            await creatorUser.save();

            return transformEvent(result);
        } catch (err) {
            throw err;
        }
    }
};