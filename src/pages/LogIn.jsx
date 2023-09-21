import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { variables } from "../api/Variables";
import Picture from "../assets/images/logo1.svg";
import PictureD from "../assets/images/logo-sechenov-dark.svg";

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
    };
  }

  changeUserNameForm = (e) => {
    this.setState({ formUsername: e.target.value });
  };

  changePasswordForm = (e) => {
    this.setState({ formPassword: e.target.value });
  };

  refreshUser() {
    // Перезапускаем get наших списков
    this.setState({ token: variables.token });
    if (this.state.token != "") {
      fetch(variables.API_URL + "accounts/profile", {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.setState({
            username: data.data.username,
            email: data.data.email,
            is_staff: data.data.is_staff,
            is_admin: data.data.is_superuser,
            error: null,
          });
          variables.user = data.data;
        })
        .catch((error) => {
          console.log(error);
          this.setState({ error: error });
        });
    }
  }

  submitUp() {
    console.log("some");
    fetch("accounts/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        username: this.state.formUsername,
        password: this.state.formPassword,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error(`Something went wrong: code ${response.status}`);
        }
      })
      .then(({ key }) => {
        variables.token = key;
        this.setState({ error: null, token: key });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: "Ошибка, подробности в консоли" });
      });
    this.refreshUser();
  }

  SubmitOut() {
    if (this.state.token != "") {
      fetch(variables.API_URL + "accounts/logout", {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            this.setState({
              token: "",
              username: "",
              email: "",
              is_staff: false,
              is_admin: false,
            });
            variables.user = null;

            this.refreshUser();
            return null;
          } else {
            throw Error(`Something went wrong: code ${response.status}`);
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({ error: "Ошибка, подробности в консоли", token: "" });
        });
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
      return <Navigate push to="/" />;
    } else {
      return (
        <div className="flex flex-row min-h-screen">
          <div className="flex flex-col items-center justify-center basis-full xl:basis-1/2">
            {/* Авторизация пользователя */}
            <div className="w-full px-10 max-w-lg">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-6">
                Войти в систему
              </h1>
              <form className="">
                <div class="mb-6">
                  <label
                    for="username"
                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Имя пользователя или Email
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formUsername}
                    onChange={this.changeUserNameForm}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="name@datamed.pro"
                    required
                  />
                </div>
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
                <div className="flex justify-between mb-6">
                  <div className="flex items-start">
                    <Link
                      to="/sign-up"
                      className="text-sm font-medium text-blue-700 dark:text-blue-800"
                    >
                      Не зарегистрированы?
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <Link className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-800">
                      Забыли пароль?
                    </Link>
                  </div>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => this.submitUp()}
                    className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Войти
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div class="hidden xl:flex flex-col justify-center xl:basis-1/2 login_bg text-gray-100 ">
            <div className="w-full relative px-24 flex flex-col items-center -mt-36">
              <img class="h-36" src={PictureD} alt="" />
              <h1 className="text-4xl font-bold text-center max-w-xl uppercase">
                Sechenov Machine Learning change helthcare
              </h1>
              <div className="absolute mt-72 text-gray-100 text-xs">
                <h2 class="whitespace-pre-wrap">Последние обновления:</h2>
                <div class="text-gray-200 mb-4">13 сентября 2023 г.</div>
                <ul class="max-w-md space-y-1 text-gray-200 list-inside dark:text-gray-300">
                  <li class="flex items-center">
                    <svg
                      class="w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                    Добавлена возможность редактирования датасета.
                  </li>
                  <li class="flex items-center">
                    <svg
                      class="w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                    Добавлен раздел "Статистика".
                  </li>
                  <li class="flex items-center">
                    <svg
                      class="w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                    </svg>
                    Обновлен функционал построения гистограмм и графиков с
                    точечным распределением.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
