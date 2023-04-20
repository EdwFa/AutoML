import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { variables } from './Variables'


export class SignUp extends Component {

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
    console.log(this.state);
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
          console.log(data);
          this.setState({
            username: data.data.username,
            email: data.data.email,
            is_staff: data.data.is_staff,
            is_admin: data.data.is_superuser,
            error: null,
          });
          variables.username = data.data.username
          variables.email = data.data.email
          variables.is_staff = data.data.is_staff
          variables.is_admin = data.data.is_superuser
        })
        .catch(error => {
          console.log(error);
          this.setState({ error: error });
        });
    }
  }

  submitUp() {
    console.log('Start login...')
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
            variables.token = "";
            variables.admin = false;
            variables.is_staff = false;
            variables.username = "";
            variables.email = "";
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

    return (
        <div>
          {error ?
            <div id="toast-warning" className="fixed top-5 right-5 flex items-center w-full max-w-xs p-4 text-gray-500 bg-slate-50 rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
              <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                <span className="sr-only">Warning icon</span>
              </div>
              <div className="ml-3 text-sm font-normal">{error}</div>
              <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-slate-50 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </button>
            </div>
            : null}
          {token == "" ?
              <form className="space-y-4 md:space-y-6">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Войдите в аккаунт
                </h1>
                <div>
                  <label for="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white float-start">Ваш логин</label>
                  <input type="text"
                    name="username"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={formUsername}
                    onChange={this.changeUserNameForm}
                    placeholder="" />
                </div>
                <div>
                  <label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white float-start">Ваш пароль</label>
                  <input type="password"
                    name="password"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={formPassword}
                    onChange={this.changePasswordForm}
                    placeholder="••••••••" />
                </div>
                <div className="flex items-center justify-between">

                  <a href="#" className="text-sm font-medium text-gray-900 dark:text-white hover:underline">Забыли пароль?</a>
                  <Link to="/registration">
                    <a href="#" className="text-sm font-medium text-gray-900 dark:text-white hover:underline">Регистрация?</a>
                  </Link>
                </div>
                <button type="button"
                    className="text-slate-100 dark:text-slate-200 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={() => this.submitUp()}>
                        Зайти
                </button>
              </form>
            :
              <div>
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-3">
                  Вы успешно авторизовались
                </h1>
                <p className='text-gray-900 dark:text-white'>Добро пожаловать, {username}!</p>
                <form className="mt-6 flex items-center space-x-4 text-gray-900 dark:text-white" onSubmit={this.SubmitOut}>
                  <Link to="/main">
                    <button type="submit" className="text-slate-100 dark:text-slate-200 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                      Начать работу
                    </button>
                  </Link>
                  <button type="button"
                    className="text-slate-100 dark:text-slate-200 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                    onClick={() => this.SubmitOut()}>
                        Выйти
                  </button>
                </form>
              </div>
          }
        </div>)
    }
}