import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { variables } from "../../Variables";

import Select from "react-select";
import ReactSelect, { createFilter } from "react-select";

import { Button } from "@chakra-ui/react";

const employmentChoices = [
  { value: "S", label: "Student" },
  { value: "W", label: "Worker" },
];

export class Registration extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      created: false,
      formUsername: "",
      formPassword: "",
      formPasswordDual: "",
      firstName: "",
      lastName: "",
      Email: "",
      City: "",
      Employment: "",

    };
  }

  changeUserNameForm = (e) => {
    this.setState({ formUsername: e.target.value });
  };
  changePasswordForm = (e) => {
    this.setState({ formPassword: e.target.value });
  };
  changePasswordDualForm = (e) => {
    this.setState({ formPasswordDual: e.target.value });
  };
  changeFirstName = (e) => {
    this.setState({ firstName: e.target.value });
  };
  changeLastName = (e) => {
    this.setState({ lastName: e.target.value });
  };
  changeEmail = (e) => {
    this.setState({ Email: e.target.value });
  };
  changeCity = (e) => {
    this.setState({ City: e.target.value });
  };
  changeEmployment = (e) => {
    this.setState({ Employment: e });
  };

  SignUp() {
    fetch("accounts/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        username: this.state.formUsername,
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.Email,
        city: this.state.City,
        employment: this.state.Employment.value,
      }),
    })
      .then((response) => {
        if (response.status < 404) {
          return response.json();
        } else {
          throw Error(`Something went wrong: code ${response.status}`);
        }
      })
      .then((data) => {
        console.log(data);
        if (data.error !== null)
            throw Error(data.error);
        else
            this.setState({ error: null, created: true });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: "Ошибка, при регистрации" });
        alert(error)
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.created) {
      return <Navigate push to="/login" />;
    }
  }

  render() {
    const {
      loading,
      created,
      error,
      formUsername,
      formPassword,
      formPasswordDual,
      firstName,
      lastName,
      Email,
      City,
      Employment,
    } = this.state;

    if (created) {
      return (
        <div>
          {/* окно после успешной регистации там приветсвие и кнопка на главную страницу */}
          <span>You have successfully created your new account.</span>
          <br />
          <span>We welcome to our machine learning simplification site! </span>
          <br />
          <span>Ваш пароль выслан на почту указаную при регистрации! </span>
          <br />
          <Button as={Link} to={"/login"}>
            Start
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex min-h-screen">
          <div className="w-full xl:w-1/2 flex items-center">
            <div className="w-full max-w-lg mx-auto px-4 py-15">
              {/* регистрация пользоваля */}
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-6">
                Регистрация пользователя
              </h1>
              <form className="self-center">
                <div class="mb-6">
                  <label
                    for="username"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formUsername}
                    onChange={this.changeUserNameForm}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                    required
                  />
                </div>
                <div class="mb-6">
                  <label
                    for="email"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email адрес
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={Email}
                    onChange={this.changeEmail}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                    required
                  />
                </div>
                <div class="mb-6">
                  <label
                    for="firstName"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Ваше Имя
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={this.changeFirstName}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                    required
                  />
                </div>
                <div class="mb-6">
                  <label
                    for="lastName"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Ваша Фамилия
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={this.changeLastName}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder=""
                    required
                  />
                </div>
                <div class="mb-6">
                  <label
                    for="password"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Род занятий
                  </label>
                  <Select
                    classNamePrefix="select"
                    options={employmentChoices}
                    getOptionLabel={(option) => `${option["label"]}`}
                    getOptionValue={(option) => `${option["label"]}`}
                    value={Employment}
                    noOptionsMessage={() => "Пусто"}
                    onChange={this.changeEmployment}
                    placeholder="Select employment"
                    isSearchable
                    isClearable
                  />
                </div>
                {/*
                <div class="mb-6">
                  <label
                    for="password"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Пароль
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formPassword}
                    onChange={this.changePasswordForm}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div class="mb-6">
                  <label
                    for="password"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Подтвердждение
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formPasswordDual}
                    onChange={this.changePasswordDualForm}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />

                </div>
                */}
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => this.SignUp()}
                    class="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Зарегистрироваться
                  </button>
                </div>
                <div className="flex items-start">
                  <Link
                    to="/login"
                    className="mt-5 ml-2 text-sm font-medium text-blue-700 dark:text-blue-800"
                  >
                    Уже зарегистрированы?
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="bg-blue-700 w-full md:w-1/2 items-center hidden xl:flex"></div>
        </div>
      );
    }
  }
}
