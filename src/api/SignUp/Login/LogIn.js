import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { variables } from '../../Variables'

import './styles.css';


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
            <div class="e1_64">
                <div class="e1_65"></div>
                <div class="e1_95">
                    <div class="e1_96">
                        <div  class="e1_97"></div>
                        <div  class="e1_98"></div>
                        <span  class="e1_99">Account</span>
                    </div>
                    {/*<span  class="e1_100">Username</span>*/}
                    <input type="text"
                            className="e1_100"
                            name="username"
                            value={formUsername}
                            onChange={this.changeUserNameForm}
                            placeholder="Username"
                        />
                    <input type="password"
                            className="e1_101"
                            name="password"
                            value={formPassword}
                            onChange={this.changePasswordForm}
                            placeholder="••••••••"
                        />
                    <div class="e1_102">
                        <div class="e1_103">
                            <button type="button"
                                className="e1_104"
                                onClick={() => this.submitUp()}
                                >Log in
                            </button>
                        </div>
                    </div>
                    <div class="e1_106">
                        <div class="e1_107">
                            <span  class="e1_110">Don’t have an account yet?</span>
                            <Link to="/sign-up">
                                <a href="#">
                                    <span  class="e1_111">Register here</span>
                                </a>
                            </Link>
                            {/* <span  class="e1_112">Forgot your password?</span> */}
                        </div>
                    </div>
                    <div  class="e1_113"></div>
                    <div  class="e1_114"></div>
                    <div  class="e1_115"></div>
                </div>
                <span  class="e1_116">Log in</span>
                <div  class="e1_118"></div>
                <div class="e1_119">
                    <span  class="e1_120">Sechenov Machine Learning Change Healthcare</span>
                    <div  class="e1_121"></div>
                </div>
            </div>
        )
    }
  }
}
