import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  Navigate
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { variables, showDate } from './Variables.js';
import Sidebar from '../components/Sidebar'
import { Topbar } from "../components/Topbar";


export class Account extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: null,
      token: variables.token,
      formUsername: "",
      formPassword: "",
      email: "",
      dateJoined: "",
      firstName: "",
      lastName: "",
      username: "",
      is_staff: false,
      is_admin: false,
      is_boss: false,
      organization: null,
    }
  }

  refreshList() {
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
          console.log(data);
          this.setState({
            firstName: data.data.first_name,
            lastName: data.data.last_name,
            username: data.data.username,
            email: data.data.email,
            dateJoined: showDate(data.data.date_joined),
            organization: data.data.organization,
            is_staff: data.data.is_staff,
            is_admin: data.data.is_superuser,
            is_boss: data.data.is_boss,
            error: null,
          });
        })
        .catch(error => {
          console.log(error);
          this.setState({ messages: [], error: error });
        });
    }
  }

  componentDidMount() {
    this.refreshList();
  }

  render() {
    const {
      loading,
      error,
      token,
      formUsername,
      formPassword,
      email,
      dateJoined,
      firstName,
      lastName,
      username,
      organization,
      is_staff,
      is_admin,
      is_boss
    } = this.state;

    if (token == "") {
      return <Navigate push to="/" />
    } else {
      return (
        <div className='flex items-start pt-16'>
          <Topbar />
          <Sidebar />
          <main className="overflow-y-auto relative w-full h-full bg-gray-100 dark:bg-gray-900 lg:ml-64">
            <div className="px-4 pt-4">
              <div className='rounded-lg bg-slate-50 p-4 shadow dark:bg-gray-800 sm:p-6 xl:p-8'>
                {error ?
                  <div className="ml-3 text-sm font-normal">{error}</div>
                  : null}
                {!token ?
                  loading ? "Загрузка..." :
                    null
                  :
                  !error ?
                    <div className="text-start space-y-4 md:space-y-6">
                      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white mb-3">
                        Личный кабинет: {username}
                      </h1>
                      <p className="text-gray-900 dark:text-white">Имя Фамилия: {firstName}  {lastName}</p>
                      <p className="text-gray-900 dark:text-white">email: {email}</p>
                      <p className="text-gray-900 dark:text-white">Профиль создан {dateJoined}</p>
                      <p className="text-gray-900 dark:text-white">Права пользователя: {is_admin? "Администратор": is_staff? "Эксперт": is_boss? "Управляющий": "Обычный"}</p>

                      {organization != null ?
                        <div className="organization text-gray-900 dark:text-white">
                          <h2><b>Организация:</b></h2>
                          <p>{organization.full_name}</p>
                          <p>{organization.str_address}</p>
                          <p>{organization.region}</p>
                          <p>{organization.contact}</p>
                          <p>{organization.email}</p>
                        </div>
                        : null}

                    </div>
                    :
                    null
                }
              </div>
            </div>
            <div class="mx-4 mt-4">
              <footer data-testid="flowbite-footer" className="w-full rounded-lg bg-slate-50 shadow dark:bg-gray-800 md:flex md:items-center md:justify-between w-full p-6">
                <div class="flex w-full flex-col gap-y-6 lg:flex-row lg:justify-between lg:gap-y-0">
                  <ul data-testid="footer-groupLink" class="flex flex-wrap text-sm text-gray-500 dark:text-white">
                    <li class="last:mr-0 md:mr-6 mr-3">
                      <a href="#" class="hover:underline">Cookie Policy</a>
                    </li>
                    <li class="last:mr-0 md:mr-6">
                      <a href="#" class="hover:underline">Контакты</a>
                    </li>
                  </ul>
                  <ul data-testid="footer-groupLink" class="flex flex-wrap text-sm text-gray-500 dark:text-white">
                    <div class="flex gap-x-1">
                      <li class="last:mr-0 md:mr-6 hover:[&amp;>*]:text-black dark:hover:[&amp;>*]:text-gray-300">
                        <a href="#" class="hover:underline">
                          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 496 512" class="text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z">
                            </path>
                          </svg>
                        </a>
                      </li>
                      <li class="last:mr-0 md:mr-6 hover:[&amp;>*]:text-black dark:hover:[&amp;>*]:text-gray-300">
                        <a href="#" class="hover:underline">
                          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 8C119.252 8 8 119.252 8 256s111.252 248 248 248 248-111.252 248-248S392.748 8 256 8zm163.97 114.366c29.503 36.046 47.369 81.957 47.835 131.955-6.984-1.477-77.018-15.682-147.502-6.818-5.752-14.041-11.181-26.393-18.617-41.614 78.321-31.977 113.818-77.482 118.284-83.523zM396.421 97.87c-3.81 5.427-35.697 48.286-111.021 76.519-34.712-63.776-73.185-116.168-79.04-124.008 67.176-16.193 137.966 1.27 190.061 47.489zm-230.48-33.25c5.585 7.659 43.438 60.116 78.537 122.509-99.087 26.313-186.36 25.934-195.834 25.809C62.38 147.205 106.678 92.573 165.941 64.62zM44.17 256.323c0-2.166.043-4.322.108-6.473 9.268.19 111.92 1.513 217.706-30.146 6.064 11.868 11.857 23.915 17.174 35.949-76.599 21.575-146.194 83.527-180.531 142.306C64.794 360.405 44.17 310.73 44.17 256.323zm81.807 167.113c22.127-45.233 82.178-103.622 167.579-132.756 29.74 77.283 42.039 142.053 45.189 160.638-68.112 29.013-150.015 21.053-212.768-27.882zm248.38 8.489c-2.171-12.886-13.446-74.897-41.152-151.033 66.38-10.626 124.7 6.768 131.947 9.055-9.442 58.941-43.273 109.844-90.795 141.978z">
                            </path>
                          </svg>
                        </a>
                      </li>
                    </div>
                  </ul>
                </div>
              </footer>
              <p class="my-8 text-center text-sm text-gray-500 dark:text-gray-300">© 2016-2023 datamed.pro</p>
            </div>
          </main>
        </div>
      )
    }
  }
}