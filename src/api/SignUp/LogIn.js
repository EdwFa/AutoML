import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { variables } from '../Variables'

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
            <div class="e11_88">
                <div  class="e11_89"></div>
                <div  class="e11_90"></div>
                <div class="e11_91">
                    <div  class="e11_92"></div>
                    <div  class="e11_93"></div>
                    <div  class="e11_94"></div>
                    <div  class="e11_95"></div>
                    <div  class="e11_96"></div>
                    <div  class="e11_97"></div>
                    <div  class="e11_98"></div>
                    <div  class="e11_99"></div>
                    <div  class="e11_100"></div>
                    <div  class="e11_101"></div>
                </div>
                <div  class="e11_105"></div>
                <div  class="e11_106"></div>
                <span  class="e11_107">LOGIN</span>
                    <span  class="e11_108">Username
                        <input type="text"
                            name="username"
                            value={formUsername}
                            onChange={this.changeUserNameForm}
                            placeholder=""
                        />
                    </span>
                    <span  class="e11_109">Password
                        <input type="password"
                            name="password"
                            value={formPassword}
                            onChange={this.changePasswordForm}
                            placeholder="••••••••"
                        />
                    </span>
                <div class="e11_110">
                    <button type="button"
                        className="e11_111"
                        onClick={() => this.submitUp()}
                        >login
                    </button>
                </div>
                <div class="e11_112">
                    <span  class="e11_113">Sechenov Machine Learning Change Healthcare</span>
                </div>
                <div class="e11_128">
                    <div class="e11_129"></div>
                    <div class="e11_130">
                        <div  class="e11_131"></div>
                        <div  class="e11_132"></div>
                        <div class="e11_133">
                        <div  class="e11_134">
                    </div>
                    <div  class="e11_135"></div>
                </div>
            </div>
            </div>
            </div>
        )
    }
  }
}
