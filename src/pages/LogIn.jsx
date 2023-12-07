import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { variables } from "../api/Variables";
import Picture from "../assets/images/logo1.svg";
import PictureD from "../assets/images/logo-sechenov-dark.svg";

export default function LogIn() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [formUsername, setUsername] = useState("");
  const [formPassword, setPassword] = useState("");
  const [token, setToken] = useState("");

  const changeUserNameForm = (e) => {
    setUsername(e.target.value);
  };

  const changePasswordForm = (e) => {
    setPassword(e.target.value);
  };

  const refreshUser = (token) => {
    // Перезапускаем get наших списков
    if (token != "") {
      fetch(variables.API_URL + "accounts/profile", {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.data)
          setUser(data.data)
          setError(null)
          variables.token = token;
          variables.user = data.data;
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
    console.log(user);
  }

  const submitUp = () => {
    fetch("accounts/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        username: formUsername,
        password: formPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if(data.error !== undefined)
            throw Error(`${data.error}`);
        setToken(data.key);
        setError(null);
        refreshUser(data.key);
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
      });
  }

  const SubmitOut = () => {
    if (this.state.token != "") {
      fetch(variables.API_URL + "accounts/logout", {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            setToken("");
            setUser(null);
            variables.token = null;
            variables.user = null;
            return null;
          } else {
            throw Error(`Something went wrong: code ${response.status}`);
          }
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
  }

  useEffect(() => {
    try {
      refreshUser(token);
    } catch (error) {
      console.log(error);
    }
  }, []);


    if (user !== null) {
      navigate("/", {state: {user: user, token: token}})
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
                    onChange={changeUserNameForm}
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
                    onChange={changePasswordForm}
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {/*
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
                */}
                {error !== null?
                <div className="flex justify-between mb-6">
                  <p className="ml-2 text-sm text-red-700 dark:text-red-800">
                      {error}
                  </p>
                </div>
                :null}
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => submitUp()}
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
                Sechenov Machine Learning change healthcare
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
