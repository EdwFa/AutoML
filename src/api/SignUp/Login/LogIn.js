import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { variables } from "../../Variables";
import Picture from "../../../Picture.png";

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
        <div className="flex min-h-screen">
          <div className="w-full xl:w-1/2 flex items-center">
            <div className="w-full max-w-lg mx-auto px-4 py-15">
              {/* Авторизация пользователя */}
              <div className="grid grid-cols-1 grid-rows-2 mt-28">
                <div>
                  <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-6">
                    Войти в систему
                  </h1>
                  <form className="self-center">
                    <div class="mb-6">
                      <label
                        for="username"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
                        <div className="flex items-center">
                          <input
                            id="remember"
                            type="checkbox"
                            value=""
                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            required
                          />
                        </div>
                        <label
                          for="remember"
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                          Запомнить меня
                        </label>
                      </div>
                      <div className="flex items-center">
                        <Link className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-800">
                          Забыли пароль?
                        </Link>
                      </div>
                    </div>
                    <div className="flex">
                      <button
                        type="submit"
                        onClick={() => this.submitUp()}
                        className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Войти
                      </button>
                    </div>
                    <div className="flex items-start">
                      <Link
                        to="/sign-up"
                        className="mt-5 ml-2 text-sm font-medium text-blue-700 dark:text-blue-800">
                        Не зарегистрированы?
                      </Link>
                    </div>
                  </form>
                </div>
                <div className="text-gray-800 text-xs mt-20">
                  {" "}
                  <h5 className="text-sm font-semibold pt-4">
                    Последние обновления:
                  </h5>{" "}
                  <p className="pt-3">13 сентября 2023 г.</p>
                  <p className="pt-3">
                    1. Добавлена возможность редактирования датасета.
                  </p>
                  <p className="">2. Добавлен раздел "Статистика". </p>
                  <p className="">
                    3. Обновлен функционал построения гистограмм и графиков с
                    точечным распределением.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="login_bg hidden xl:block w-1/2">
            <img class="center" src={Picture} alt="" />
          </div>
        </div>
      );
    }
  }
}
