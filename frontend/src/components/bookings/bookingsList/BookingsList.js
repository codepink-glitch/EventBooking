import React from "react";

import "./BookingsList.css";

const bookingsList = props => (
    <ul className="bookings__list">
        {props.bookings.map(booking => {
            return (<li key={booking._id} className="bookings__list-item">
                    <div className="bookings__item-data">
                    {booking.event.title} - {' '} {new Date(booking.createdAt).toLocaleString()}
                    </div>
                    <div className="bookings__item-actions">
                        <button className="btn" onClick={props.onDelete.bind(this, booking._id)}>Cancel</button>
                    </div>
                </li>)
        })}
    </ul>
);

export default bookingsList;