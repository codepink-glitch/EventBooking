import React, { Component } from 'react';
import Spinner from '../components/spinner/Spinner';
import AuthContext from '../context/auth-context';
import BookingsList from '../components/bookings/bookingsList/BookingsList';
import BookingsChart from '../components/bookings/bookingsChart/BookingsChart';
import BookingsControls from '../components/bookings/bookingsControls/BookingsControls';

class BookingsPage extends Component {
   state = {
      isLoading: false,
      bookings: [],
      outputType: "list"
   };

   static contextType = AuthContext;

   componentDidMount() {
      this.fetchBookings();
   };

   fetchBookings = () => {
      this.setState({ isLoading: true });
      const requestBody = {
         query: `
            query {
               bookings {
                  _id
                  createdAt
                  event {
                     _id
                     title
                     date
                     price
                  }
               }
            }
            `
      };

      const token = this.context.token;

      fetch('http://localhost:8080/graphql', {
         method: 'POST',
         body: JSON.stringify(requestBody),
         headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + token
         }
      })
         .then(res => {
            if (res.status !== 200 && res.status !== 201) {
               throw new Error('Failed');
            }
            return res.json();
         })
         .then(resData => {
            const bookings = resData.data.bookings;
            this.setState({ bookings });
         })
         .finally(() => {
            this.setState({ isLoading: false });
         })
   };

   deleteBookingHandler = (bookingId) => {
      this.setState({ isLoading: true });
      const requestBody = {
         query: `
            mutation CancelBooking($id: ID!) {
               cancelBooking(bookingID: $id) {
                  _id
                  title
               }
            }
         `,
         variables: {
            id: bookingId
         }
      }

      const token = this.context.token;

      fetch('http://localhost:8080/graphql', {
         method: 'POST',
         body: JSON.stringify(requestBody),
         headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + token
         }
      })
         .then(res => {
            if (res.status !== 200 && res.status !== 201) {
               throw new Error("Failed.");
            }
            return res.json();
         })
         .then(resData => {
            this.setState(prevState => {
               const bookings = prevState.bookings.filter(booking => booking._id !== bookingId);
               this.setState({bookings});
            });
         })
         .finally(() => this.setState({ isLoading: false }));
   };

   changeOutputTypeHandler = outputType => {
      this.setState({outputType});
   };

   render() {
      let content = <Spinner />;
      if (!this.state.isLoading) {
         content = (
            <React.Fragment>
               <BookingsControls 
               activeType={this.state.outputType} 
               onChange={this.changeOutputTypeHandler}
               />
               <div>
                  {this.state.outputType === 'list' ? 
                  <BookingsList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} /> : 
                  <BookingsChart bookings={this.state.bookings} />}
               </div>
            </React.Fragment>
         );
      }
      return (
         <React.Fragment>
            {content}
         </React.Fragment>
      );
   }
}

export default BookingsPage;