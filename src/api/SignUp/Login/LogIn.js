import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { variables } from '../../Variables'


export class LogIn extends Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      token: variables.token,
      formUsername: "",
      formPassword: "",
      email: "",
      username: "",
      is_staff: false,
      is_admin: false,
    }
  }

  changeUserNameForm = (e) => {
        this.setState({ formUsername: e.target.value });
  }

  changePasswordForm = (e) => {
        this.setState({ formPassword: e.target.value });
  }

  refreshUser() {
    // Перезапускаем get наших списков
    this.setState({ token: variables.token });
    if (this.state.token != "") {
      fetch(variables.API_URL + 'accounts/profile',
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Token ${this.state.token}`,
          },
        })
        .then(response => response.json())
        .then(data => {
          this.setState({
            username: data.data.username,
            email: data.data.email,
            is_staff: data.data.is_staff,
            is_admin: data.data.is_superuser,
            error: null,
          });
          variables.user = data.data;
        })
        .catch(error => {
          console.log(error);
          this.setState({ error: error });
        });
    }
  }

  submitUp() {
    console.log('some');
    fetch(
      'accounts/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          username: this.state.formUsername,
          password: this.state.formPassword,
        })
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw Error(`Something went wrong: code ${response.status}`)
        }
      })
      .then(({ key }) => {
        variables.token = key
        this.setState({ error: null, token: key })
      })
      .catch(error => {
        console.log(error)
        this.setState({ error: 'Ошибка, подробности в консоли' })
      })
      this.refreshUser();
  }

  SubmitOut() {
    if (this.state.token != "") {
      fetch(
        variables.API_URL + 'accounts/logout',
        {
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `Token ${this.state.token}`,
          },
        }
      )
        .then(response => {
          if (response.ok) {
            this.setState({ token: "", username: "", email: "", is_staff: false, is_admin: false })
            variables.user = null;

            this.refreshUser();
            return null
          } else {
            throw Error(`Something went wrong: code ${response.status}`)
          }
        })
        .catch(error => {
          console.log(error)
          this.setState({ error: 'Ошибка, подробности в консоли', token: "" })
        })
    }
  }

  componentDidMount() {
    this.refreshUser();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.token !== prevState.token) {
      this.refreshUser();
    }
  }



  render() {
    const {
      loading,
      error,
      token,
      formUsername,
      formPassword,
      email,
      username,
      is_staff,
      is_admin,
    } = this.state;

    if (token != "") {
        return <Navigate push to="/viewer" />
    } else {
        return (
                <div>
                    {/* Авторизация пользователя */}
                    <input
                            type="text"
                            name="username"
                            value={formUsername}
                            onChange={this.changeUserNameForm}
                            placeholder="Username"
                        />
                    <input
                            type="password"
                            name="password"
                            value={formPassword}
                            onChange={this.changePasswordForm}
                            placeholder="••••••••"
                        />
                    <button type="button"
                        onClick={() => this.submitUp()}
                        >Log in
                    </button>
                    {/* Ссылка на регистрацию */}
                    <Link to="/sign-up">
                        <a href="#">
                            <span>Register here</span>
                        </a>
                    </Link>
            </div>
        )
    }
  }
}
