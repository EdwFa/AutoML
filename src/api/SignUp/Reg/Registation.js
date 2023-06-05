import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { variables } from '../../Variables'

import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';

import { Button } from "@chakra-ui/react";


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

    if (token != "") {
        return (
            <div>
                {/* окно после успешной регистации там приветсвие и кнопка на главную страницу */}
                <span>You have successfully created your new account.</span>
                <br />
                <span>We welcome to our machine learning simplification site! </span>
                <br />
                <span>Success</span>
                <br />
                 <Button as={Link} to={'/viewer'}>Start</Button>
            </div>
        )
    } else {
        return (
                <div>
                    {/* регистрация пользоваля */}
                    <span>First name</span>
                        <input type="text"
                            value={firstName}
                            onChange={this.changeFirstName}
                            placeholder="..."
                        />
                    <br />
                    <span>Last name</span>
                        <input type="text"
                            value={lastName}
                            onChange={this.changeLastName}
                            placeholder="..."
                        />
                    <br />
                    <span>Password</span>
                        <input type="password"
                            value={formPassword}
                            onChange={this.changePasswordForm}
                            placeholder="*********"
                        />
                    <br />
                    <span>Repeat Password</span>
                        <input type="password"
                            value={formPasswordDual}
                            onChange={this.changePasswordDualForm}
                            placeholder="*********"
                        />
                    <br />
                    <span>Employment</span>
                        <Select
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
                    <br />
                    <span>Email</span>
                        <input type="email"
                            value={Email}
                            onChange={this.changeEmail}
                            placeholder="..."
                        />
                    <br />
                    <span>Username</span>
                        <input type="text"
                            name="username"
                            value={formUsername}
                            onChange={this.changeUserNameForm}
                            placeholder="..."
                        />
                    <br />
                        <button type="button"
                            onClick={() => this.SignUp()}
                        >Registration
                        </button>
                </div>

        )
    }
  }
}
