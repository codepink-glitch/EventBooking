import React, { Component } from 'react';
import Modal from '../components/modal/Modal';
import Backdrop from '../components/backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import EventList from '../components/events/eventsList/EventList';
import Spinner from '../components/spinner/Spinner';
import "./Events.css";

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
    };

    isActive = true;
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleEl = React.createRef();
        this.priceEl = React.createRef();
        this.dateEl = React.createRef();
        this.descriptionEl = React.createRef();
    }

    componentDidMount = () => {
        this.isActive = true;
        this.fetchEvents();
    }

    createEventHandler = () => {
        this.setState({ creating: true });
    }

    modalConfirmHandler = () => {
        const title = this.titleEl.current.value;
        const price = +this.priceEl.current.value;
        const date = this.dateEl.current.value;
        const description = this.descriptionEl.current.value;

        if ([title.trim().length, date.trim().length, description.trim().length].some(length => length === 0) || price < 0) {
            return;
        }

        const requestBody = {
            query: `
                mutation CreateEvent($title: String!, $description: String!, $price: Float!, $date: String!) {
                createEvent(eventInput: {title: $title, description: $description, price: $price, date: $date}) {
                    _id
                    title
                    description
                    date
                    price
                    }
                }
            `,
            variables: { title, description, price, date }
        }

        const token = this.context.token;

        fetch('http://localhost:8080/graphql', {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
            .then(response => {
                if (![200, 201].includes(response.status)) {
                    throw new Error('Failed');
                }

                return response.json();
            })
            .then(resData => {
                this.setState(prevState => {
                    const events = [...prevState.events],
                        { _id, title, description, date, price } = resData.data.createEvent;
                    events.push({
                        _id: _id,
                        title: title,
                        description: description,
                        date: date,
                        price: price,
                        creator: {
                            _id: this.context.userId,

                        }
                    });

                    return { events };
                });
            })
            .then(() => this.setState({ creating: false }))
            .catch(err => {
                throw err;
            });

        this.setState({ creating: false });
    };

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null });
    };

    bookEventHandler = () => {
        if (!this.context.token) {
            this.setState({ selectedEvent: null });
            return;
        }

        const requestBody = {
            query: `
                mutation BookEvent($eventId: ID!) {
                    bookEvent(eventId: $eventId) {
                        _id
                        createdAt
                        updatedAt
                    }
                }
            `,
            variables: {
                eventId: this.state.selectedEvent._id
            }
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
                this.setState({ selectedEvent: null });
            })
    };

    fetchEvents = () => {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed');
                }
                return res.json();
            })
            .then(resData => {
                const events = resData.data.events;
                if (this.isActive) {
                    this.setState({ events: events });
                }
            })
            .finally(() => {
                this.setState({ isLoading: false });
            });
    };

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return { selectedEvent };
        });
    };

    componentWillUnmount() {
        this.isActive = false;
    };

    render() {
        return (
            <React.Fragment>
                {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
                {this.state.creating &&
                    (<Modal
                        title='Add Event'
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                        confirmText="Confirm">
                        <form>
                            <div className='form-control'>
                                <label htmlFor='title'>Title</label>
                                <input type='text' id="title" ref={this.titleEl}></input>
                            </div>
                            <div className='form-control'>
                                <label htmlFor='price'>Price</label>
                                <input type='number' id="price" ref={this.priceEl}></input>
                            </div>
                            <div className='form-control'>
                                <label htmlFor='date'>Date</label>
                                <input type='datetime-local' id="date" ref={this.dateEl}></input>
                            </div>
                            <div className='form-control'>
                                <label htmlFor='description'>Description</label>
                                <textarea id="description" rows="4" ref={this.descriptionEl}></textarea>
                            </div>
                        </form>
                    </Modal>)}
                {this.state.selectedEvent && (
                    <Modal
                        title={this.state.selectedEvent.title}
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.bookEventHandler}
                        confirmText={this.context.token ? 'Book' : 'Confirm'}>
                        <h1>{this.state.selectedEvent.title}</h1>
                        <h2>
                            ${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleString()}
                        </h2>
                        <p>{this.state.selectedEvent.description}</p>
                    </Modal>
                )}
                {this.context.token && (<div className="events-control">
                    <p>Share your own events!</p>
                    <button className="btn" onClick={this.createEventHandler}>Create event</button>
                </div>)}
                {this.state.isLoading ?
                    <Spinner /> :
                    <EventList
                        events={this.state.events}
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler}
                    />}
            </React.Fragment>
        );
    }
}

export default EventsPage;