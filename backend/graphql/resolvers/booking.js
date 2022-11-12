const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformEvent, transformBooking } = require("./merge");
const { checkAuth } = require('../../helpers/authHandler');

module.exports = {
    bookings: async (args, request) => {
        checkAuth(request);
        try {
            const bookings = await Booking.find({user: request.userId});
            return bookings.map(transformBooking);
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args, request) => {
        checkAuth(request);
        try {
            const targetEvent = await Event.findOne({ _id: args.eventId });

            const booking = new Booking({
                user: request.userId,
                event: targetEvent
            });

            const result = await booking.save(booking);
            return transformBooking(result);
        } catch (err) {
            throw err;
        }
    },
    cancelBooking: async (args, request) => {
        checkAuth(request);
        try {
            const booking = await Booking.findById(args.bookingID).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({_id: args.bookingID});
            return event;
        } catch (err) {
            throw err;
        }
    }
};