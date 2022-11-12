import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import './Auth.css';


class AuthPage extends Component {
   state = {
      isLogin: true
   };

   static contextType = AuthContext;

   constructor(props) {
      super(props);
      this.emailEl = React.createRef();
      this.passwordEl = React.createRef();
   }

   switchModeHandler = () => {
      this.setState(prevState => {
         return { isLogin: !prevState.isLogin };
      });
   };

   submitHandler = (event) => {
      event.preventDefault();
      const email = this.emailEl.current.value;
      const password = this.passwordEl.current.value;

      if (email.trim() === 0 || password.trim() === 0) {
         return;
      }

      let requestBody;

      if (this.state.isLogin) {
         requestBody = {
            query: `
            query Login($email: String!, $password: String!) {
               login(email: $email, password: $password) {
                  userId
                  token
                  tokenExpiration
               }
            }
            `,
            variables: {email, password}
         };
      } else {
         requestBody = {
            query: `
               mutation CreateUser($email: String!, $password: String!) {
                  createUser(userInput: {email: $email, password: $password}) {
                     _id
                     email
                  }
               }
            `,
            variables: {email, password}
         };
      }

      fetch('http://localhost:8080/graphql', {
         method: 'POST',
         body: JSON.stringify(requestBody),
         headers: {
            'Content-type': 'application/json'
         }
      })
      .then(response => {
         if (![200, 201].includes(response.status)) {
            throw new Error("Failed!");
         }

         return response.json();
      })
      .then(responseData => {
         if (responseData.data.login.token) {
            this.context.login(responseData.data.login.token,
                responseData.data.login.userId,
                responseData.data.login.tokenExpiration);
         }
      })
      .catch(err => {
         throw err;
      });
   };

   render() {
      return (
         <form className="auth-form" onSubmit={this.submitHandler}>
            <div className="form-control">
               <label htmlFor="email">E-Mail</label>
               <input type="email" id="email" ref={this.emailEl}></input>
            </div>
            <div className="form-control">
               <label htmlFor="password">Password</label>
               <input type="password" id="password" ref={this.passwordEl}></input>
            </div>
            <div className="form-actions">
               <button type="submit">Submit</button>
               <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'Signup' : 'Login'}</button>
            </div>
         </form>
      );
   }
}

export default AuthPage;