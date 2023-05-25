import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { variables } from '../../Variables'

import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';

import { Button } from "@chakra-ui/react";

import './styles.css';


const employmentChoices = [
    {value: 'S', label: 'Student'},
    {value: 'W', label: 'Worker'}
];

export class Registration extends Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      token: variables.token,
      formUsername: "",
      formPassword: "",
      formPasswordDual: "",
      firstName: "",
      lastName: "",
      Email: "",
      City: "",
      Employment: "",
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
  changePasswordDualForm = (e) => {
        this.setState({ formPasswordDual: e.target.value });
  }
  changeFirstName = (e) => {
        this.setState({ firstName: e.target.value });
  }
  changeLastName = (e) => {
        this.setState({ lastName: e.target.value });
  }
  changeEmail = (e) => {
        this.setState({ Email: e.target.value });
  }
  changeCity = (e) => {
        this.setState({ City: e.target.value });
  }
  changeEmployment = (e) => {
        this.setState({ Employment: e });
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

  SignUp() {
    if (!(this.state.formPassword || this.state.formUsername)) {
        alert('Заполните поля!');
        return ;
    }
    if (this.state.formPassword != this.state.formPasswordDual){
        alert('Пароли не совпадают!');
        return ;
    }
    fetch(
      'accounts/sign-up',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          username: this.state.formUsername,
          password: this.state.formPassword,
          first_name: this.state.firstName,
          last_name: this.state.lastName,
          email: this.state.Email,
          city: this.state.City,
          employment: this.state.Employment.value,
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
        this.refreshUser()
      })
      .catch(error => {
        console.log(error)
        this.setState({ error: 'Ошибка, подробности в консоли' })
      })
      this.refreshUser();
  }

  componentDidMount() {
    this.refreshUser();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.token !== prevState.token) {
      this.refreshUser();
    }
  }

  nextPath() {
    return <Navigate push to="/viewer" />
  }

  render() {
    const {
      loading,
      error,
      token,
      formUsername,
      formPassword,
      formPasswordDual,
      firstName,
      lastName,
      Email,
      City,
      Employment,
      email,
      username,
      is_staff,
      is_admin,
    } = this.state;

    if (token != "2") {
        return (
            <div class="e9_523">
                <div  class="e9_524"></div>
                <div class="e9_525"></div>
                <div class="e9_530">
                    <div class="e9_531">
                        <div class="e9_532">
                            <div  class="e9_533"></div>

                            <Button className="e9_534" as={Link} to={'/viewer'}>Start</Button>
                        </div>
                    </div>
                </div>
                <span  class="e9_537">You have successfully created your new account.</span>
                <span  class="e9_538">We welcome to our machine learning simplification site! </span>
                <span  class="e9_539">Success</span>
                <div  class="e9_550"></div>
                <div class="e9_551">
                    <div class="e9_552">
                    </div>
                </div>

            </div>
        )
    } else {
        return (
            <div class="e1_336">
                <div class="e1_337"></div>
                <div  class="e1_361"></div>
                <div class="e1_362">
                    <span  class="e1_363">Sechenov Machine Learning Change Healthcare</span>
                    <div  class="e1_364"></div>
                </div>
                <div class="e1_365">
                    <div class="e1_366">
                        <div class="e1_367">
                            <span  class="e1_368">First name</span>
                        </div>
                        <div class="e1_369">
                            <div  class="e1_370"></div>
                            <input type="text"
                                className="e1_371"
                                value={firstName}
                                onChange={this.changeFirstName}
                                placeholder="..."
                            />
                        </div>
                        <div  class="e1_372"></div>
                    </div>
                    <div class="e1_373">
                        <div class="e1_374">
                            <span  class="e1_375">Last name</span>
                        </div>
                        <div class="e1_376">
                            <div  class="e1_377"></div>
                            <input type="text"
                                className="e1_371"
                                value={lastName}
                                onChange={this.changeLastName}
                                placeholder="..."
                            />
                        </div>
                        <div  class="e1_379"></div>
                    </div>
                    <div class="e1_380">
                        <div class="e1_381">
                            <span  class="e1_382">Password</span>
                        </div>
                        <div class="e1_383">
                            <div  class="e1_384">
                                <input type="password"
                                    className="e1_397"
                                    value={formPassword}
                                    onChange={this.changePasswordForm}
                                    placeholder="*********"
                                />
                            </div>
                        </div>
                        <div  class="e1_385"></div>
                    </div>
                    <div class="e1_386">
                        <div class="e1_387">
                            <span  class="e1_388">Confirm password</span>
                        </div>
                        <div class="e1_389">
                            <div  class="e1_390">
                                <input type="password"
                                    className="e1_397"
                                    value={formPasswordDual}
                                    onChange={this.changePasswordDualForm}
                                    placeholder="*********"
                                />
                            </div>
                        </div>
                        <div  class="e1_391"></div>
                    </div>
                    <div class="e1_392">
                        <div class="e1_393">
                            <span  class="e1_394">Employment</span>
                        </div>
                        <div class="e1_395">
                            <div  class="e1_396">
                                <Select
                                className="e1_397_1"
                                classNamePrefix='select'
                                options={employmentChoices}
                                getOptionLabel={(option) => `${option['label']}`}
                                getOptionValue={(option) => `${option['label']}`}
                                value={Employment}
                                noOptionsMessage={() => "Пусто"}
                                onChange={this.changeEmployment}
                                placeholder="Select employment"
                                isSearchable
                                isClearable
                            />
                            </div>

                        </div>
                        <div  class="e1_398"></div>
                    </div>
                    <div class="e1_399">
                        <div class="e1_400">
                            <span  class="e1_401">Email</span>
                        </div>
                        <div class="e1_402">
                            <div  class="e1_403"></div>
                            <input type="email"
                                className="e1_404"
                                value={Email}
                                onChange={this.changeEmail}
                                placeholder="..."
                            />
                        </div>
                        <div  class="e1_405"></div>
                    </div>
                    <div class="e1_406">
                        <div class="e1_407">
                            <span  class="e1_408">Username</span>
                        </div>
                        <div class="e1_409">
                            <div  class="e1_410"></div>
                            <input type="text"
                                className="e1_378"
                                name="username"
                                value={formUsername}
                                onChange={this.changeUserNameForm}
                                placeholder="..."
                            />
                        </div>
                        <div  class="e1_413"></div>
                    </div>
                </div>
                <span  class="e1_414">Input your information</span>
                <div class="e1_415">
                    <button type="button"
                        className="e1_416"
                        onClick={() => this.SignUp()}
                        >Register
                    </button>
                </div>
            </div>
        )
    }
  }
}
