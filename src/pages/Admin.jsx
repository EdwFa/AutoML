import React, { Component, useState, useEffect, createRef } from "react";

import { Navigate, Link } from "react-router-dom";

import InfoPanel from "../components/InfoPanel";

import AsyncSelect from "react-select/async";
import Select from "react-select";
import ReactSelect, { createFilter } from "react-select";

import { Tab } from "@headlessui/react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";

import Aside from "../components/Sidebar";

import { Disclosure } from "@headlessui/react";

import ReactPaginate from "react-paginate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from  "react-datepicker";
import ru from 'date-fns/locale/ru';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../assets/ag-theme-acmecorp.css";

import Plot from "react-plotly.js";

import Gr1 from "../../src/gr1.png";
import Gr2 from "../../src/gr2.png";

import {
  variables,
  GetDatasetParams,
  showDate,
  AG_GRID_LOCALE_RU,
} from "../api/Variables.js";
import CustomDateComponent from '../components/customDateComponent.jsx'
import { PlotGrafic } from "../api/Grafics/InfoGrafics.js";

function markUpPrediction(modelPred) {
  return `<span style=\"color: ${modelPred.max ? "green" : "black"}\">${
    modelPred.value * 100
  } %</span>`;
}

const employmentChoices = [
  { value: "S", label: "Студент" },
  { value: "W", label: "Работник" },
];

registerLocale("ru", ru)

var filterParams = {
  comparator: (filterLocalDateAtMidnight, cellValue) => {
    var dateAsString = cellValue;
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split('/');
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
    return 0;
  }
}

export class Admin extends Component {
  constructor(props) {
    super(props);

    this.gridRef = createRef();
    this.datasetGridRef = createRef();
    this.state = {
      // user data
      user: variables.user,
      token: variables.token,
      loadingAdmin: false,

      users: [],
      usersDef: [
                {field: 'id', headerName: 'Номер', filter: 'agNumberColumnFilter'},
                {field: 'date_joined', headerName: 'Дата создания', filter: 'agDateColumnFilter', inRangeFloatingFilterDateFormat: "dd/mm/yyyy", filterParams: filterParams, cellRenderer: (params) => <div>{params.data === undefined? null: showDate(params.data.date_joined)}</div>},
                {field: 'email', headerName: 'Email', filter: 'agTextColumnFilter'},
                {field: 'username', headerName: 'Имя пользователя', filter: 'agTextColumnFilter'},
                {field: 'first_name', headerName: 'Имя', filter: 'agTextColumnFilter'},
                {field: 'last_name', headerName: 'Фамилия', filter: 'agTextColumnFilter'},
                {field: 'last_login', headerName: 'Использовал приложение', filter: 'agDateColumnFilter', inRangeFloatingFilterDateFormat: "dd/mm/yyyy", filterParams: filterParams, cellRenderer: (params) => <div>{params.data === undefined? null: showDate(params.data.last_login)}</div>},
                {field: 'employment', headerName: 'Род деятельности', filter: 'agTextColumnFilter'},
                {field: 'city', headerName: 'Аффиляция', filter: 'agTextColumnFilter'},
                {field: 'info', headerName: 'Описание', filter: 'agTextColumnFilter'},
                {field: 'count', headerName: 'Права', filter: 'agNumberColumnFilter'},
                {field: 'allow_date', headerName: 'Подписка до...', filter: 'agDateColumnFilter', inRangeFloatingFilterDateFormat: "dd/mm/yyyy", filterParams: filterParams, cellRenderer: (params) => <div>{params.data === undefined? null: showDate(params.data.allow_date)}</div>},
                {field: 'is_superuser', headerName: 'Администратор', filter: 'agBoooleanColumnFilter', cellRenderer: (params) => <div><input type="checkbox" checked={params.data === undefined? false: params.data.is_superuser} /></div>},
                {field: 'id', headerName: "Действия", filter: false, cellRenderer: (params) => <div className='flex'>
                                                    <button
                                                        type="button"
                                                        className="flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2.5 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#exampleModal"
                                                        onClick={() => this.editClick(params.data)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-2.5 py-2.5 ml-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800"
                                                        onClick={() => this.deleteClick(params.data.id)}
                                                        disabled={this.state.loadingAdmin}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                                        </svg>
                                                    </button>
                                                </div>

                }
            ],
      UserId: 0,

      created: false,
      modalTitle: "",

      username: "",
      firstName: "",
      lastName: "",
      email: "",
      city: "",
      employment: "",
      info: "",
      count: 10000,
      allowDate: new Date(),
    };
  }

  // настройка грида
  autoGroupColumnDef = () => {
    return {
      minWidth: 200,
    };
  };

  frameworkComponents = {
    agDateInput: CustomDateComponent
  };

  // датасеты их выбор и удаление
  getUsers() {
    fetch(variables.API_URL + "accounts/users", {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Token ${this.state.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw Error("Dataset doesnt delete");
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({
          users: data,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ models: [] });
      });
  }

  componentDidMount() {
    console.log(variables);
    this.getUsers();
  }

  addClick() {
        this.setState({
            userId: 0,
            modalTitle: "Создать пользователя",
            allowDate: new Date(),
            username: "",
            firstName: "",
            lastName: "",
            email: "",
            city: "",
            employment: "",
            info: "",
            count: 10000,
        });
  }

  editClick(params) {
        this.setState({
            userId: params.id,
            modalTitle: "Обновить данные пользователя",
            allowDate: new Date(params.allow_date),
            firstName: params.first_name,
            lastName: params.last_name,
            city: params.city,
            employment: employmentChoices.filter(function(obj) {
                if(obj.value === params.employment)
                    return obj;
            })[0],
            info: params.info,
            count: params.count,
        });
  }

  checkFormat() {
        if(this.state.email === null || this.state.email === '')
            return false;
        if(this.state.username === null || this.state.username === '')
            return false;
        return true;
    }

  createClick = async () => {
        if(!this.checkFormat()) {
            alert("Заполните поля")
            return ;
        }
        this.setState({loadingAdmin: true})
        fetch(variables.API_URL + "accounts/users", {
            method: 'POST',
            headers: {
              "Content-Type": "application/json;charset=utf-8",
              Authorization: `Token ${this.state.token}`,
            },
            body: JSON.stringify({
                username: this.state.username,
                email: this.state.email,
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                count: this.state.count,
                city: this.state.city,
                allow_date: this.state.allowDate,
                info: this.state.info,
                employment: this.state.employment.value
            })
        })
        .then((res) => {
            if (res.status == 201) { return res.json() }
                else { throw Error(res.statusText) }
        })
        .then((result) => {
            this.setState({users: [result, ...this.state.users], loadingAdmin: false});
        })
        .catch((error) => {
            console.log(error);
            alert('Ошибка');
            this.setState({loadingAdmin: false})
        })
    }


    updateClick = async (userId) => {
        this.setState({loadingAdmin: true})
        fetch(variables.API_URL + `accounts/users?id=${userId}` , {
              method: 'PUT',
              headers: {
                "Content-Type": "application/json;charset=utf-8",
                Authorization: `Token ${this.state.token}`,
              },
              body: JSON.stringify({
                username: this.state.username,
                email: this.state.email,
                first_name: this.state.firstName,
                last_name: this.state.lastName,
                count: this.state.count,
                city: this.state.city,
                allow_date: this.state.allowDate,
                info: this.state.info,
                employment: this.state.employment.value,
              })
            })
            .then((res) => {
                if (res.status == 201) { return res.json() }
                    else { throw Error(res.statusText) }
            })
            .then((result) => {
                let newData = new Array();
                console.log(result);
                const returnData = result;
                for(let i of this.state.users) {
                    if(i.id === returnData.id) {
                        newData.push(returnData);
                    } else {
                        newData.push(i);
                    }
                }
                this.setState({users: newData, loadingAdmin: false});
            })
            .catch((error) => {
                console.log(error)
                this.setState({loadingAdmin: false})
                alert('Ошибка')
            })
    }

    deleteClick = async(userId) => {
        if (window.confirm('Вы уверены?')) {
                this.setState({loadingAdmin: true})
                fetch(variables.API_URL + `accounts/users?id=${userId}`, {
                  method: 'DELETE',
                  headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    Authorization: `Token ${this.state.token}`,
                  },
                })
                .then((res) => {
                    if (res.status === 201) { return res.json() }
                    else { throw Error(res.statusText) }
                })
                .then((result) => {
                    let newData = new Array();
                    for(let i of this.state.users) {
                        if(i.id !== userId)
                            newData.push(i);
                    }
                    this.setState({users: newData, loadingAdmin: false});
                })
                .catch((error) => {
                    alert('Ошибка')
                    this.setState({loadingAdmin: false})
                })
        }
    }

  render() {
    const {
      token,
      user,
      loadingAdmin,

      users,
      usersDef,
      userId,

      modalTitle,
      created,
      error,
      username,
      firstName,
      lastName,
      email,
      city,
      employment,
      info,
      count,
      allowDate,
    } = this.state;

    if (token === null && user === null) {
      return <Navigate push to="/login" />;
    } else if (!user.is_superuser) {
      return <Navigate push to="/" />;
    } else {
      return (
        <div className="flex h-screen overflow-hidden">
          {/*Боковое меню*/}
          <Aside user={user} />
          {/*Контент*/}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/*Хлебные крошки*/}
            <header className="bg-white px-4 py-1 dark:bg-gray-800 border-b border-gray-200">
              <nav class="flex" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                  <li class="inline-flex items-center">
                    <a
                      href="#"
                      class="p-2 rounded-lg inline-flex items-center text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                      <svg
                        class="w-3 h-3 mr-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                      </svg>
                      Главная
                    </a>
                  </li>
                  <li>
                    <Link to="/models">
                      <div class="flex items-center">
                        <svg
                          class="w-3 h-3 text-gray-400 mx-1"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 9 4-4-4-4"
                          />
                        </svg>
                        <a
                          href="#"
                          class="p-2 rounded-lg ml-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                        >
                          Модели
                        </a>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin">
                      <div class="flex items-center">
                        <svg
                          class="w-3 h-3 text-gray-400 mx-1"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 9 4-4-4-4"
                          />
                        </svg>
                        <a
                          href="#"
                          class="p-2 rounded-lg ml-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                        >
                          Админ-панель
                        </a>
                      </div>
                    </Link>
                  </li>
                </ol>
              </nav>
            </header>
            <div className="rounded-lg bg-slate-50 p-4 shadow dark:bg-gray-800 sm:p-6 xl:p-8">
                    <div class="flex flex-wrap justify-between items-center dark:border-gray-600 mb-4">
                        <h2 class="flex text-lg font-semibold text-gray-900 dark:text-white">
                            Административная панель
                        </h2>
                        <div className='flex items-end'>
                            <button type="button"
                                className="flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 float-end"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal"
                                onClick={() => this.addClick()}>
                                Добавить
                            </button>
                        </div>
                    </div>
                    <div className='overflow-x-auto'>
                        <div style={{ height: 800, width: '100%' }} className="ag-theme-alpine ag-theme-acmecorp" >
                            <AgGridReact
                              rowData={users}
                              columnDefs={usersDef}
                              defaultColDef={
                                {
                                  flex: 1,
                                  minWidth: 100,
                                  sortable: true,
                                  // allow every column to be aggregated
                                  enableValue: true,
                                  // allow every column to be grouped
                                  enableRowGroup: true,
                                  // allow every column to be pivoted
                                  filter: 'agTextColumnFilter',
                                  resizable: true,
                                  enableRowGroup: true,
                                }
                              }
                              autoGroupColumnDef={{ minWidth: 200, filter: 'agGroupColumnFilter' }}
                              groupDisplayType={'multipleColumns'}
                              frameworkComponents={this.frameworkComponents}
                              animateRows={true}
                              pagination={true}
                              paginationPageSize={100}
                              loadingCellRendererParams={{
                                  loadingMessage: 'Загрузка...',
                                }}
                              localeText={AG_GRID_LOCALE_RU}
                              sideBar={{
                                  toolPanels: [
                                    {
                                      id: 'columns',
                                      labelDefault: 'Columns',
                                      labelKey: 'columns',
                                      iconKey: 'columns',
                                      toolPanel: 'agColumnsToolPanel',
                                      minWidth: 225,
                                      width: 225,
                                      maxWidth: 225,
                                    },
                                    {
                                      id: 'filters',
                                      labelDefault: 'Filters',
                                      labelKey: 'filters',
                                      iconKey: 'filter',
                                      toolPanel: 'agFiltersToolPanel',
                                      minWidth: 180,
                                      maxWidth: 400,
                                      width: 250,
                                    },
                                  ],
                                  position: 'left',
                                  defaultToolPanel: 'filters',
                                }
                              }
                            ></AgGridReact>
                          </div>
                    </div>
                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-md modal-dialog-centered">
                            <div className="modal-content bg-slate-50 rounded-lg drop-shadow-md dark:bg-gray-800">
                                <div className="modal-header border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600">
                                    <h5 className="text-xl font-medium text-gray-900 dark:text-white">{modalTitle}</h5>
                                    <button type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                                        <svg aria-hidden="true" class="w-5 h-5" data-bs-dismiss="modal" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                        <span class="sr-only">Закрыть диалог</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {userId == 0 ?
                                    <>
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
                                        name="username"
                                        value={username}
                                        onChange={(e) => this.setState({username: e.target.value})}
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
                                        value={email}
                                        onChange={(e) => this.setState({email: e.target.value})}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    </>
                                    :null}
                                    <div class="mb-6">
                                      <label
                                        for="firstName"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Имя
                                      </label>
                                      <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={firstName}
                                        onChange={(e) => this.setState({firstName: e.target.value})}
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
                                        Фамилия
                                      </label>
                                      <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={lastName}
                                        onChange={(e) => this.setState({lastName: e.target.value})}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div class="mb-6">
                                      <label
                                        for="employment"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Род занятий
                                      </label>
                                      <Select
                                        classNamePrefix="select"
                                        id="employment"
                                        name="employment"
                                        options={employmentChoices}
                                        getOptionLabel={(option) => `${option["label"]}`}
                                        getOptionValue={(option) => `${option["label"]}`}
                                        value={employment}
                                        noOptionsMessage={() => "Пусто"}
                                        onChange={(e) => this.setState({employment: e})}
                                        placeholder="Select employment"
                                        isSearchable
                                        isClearable
                                      />
                                    </div>
                                    <div class="mb-6">
                                        <label
                                            for="allowDate"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                        >
                                            Подписка до...
                                        </label>
                                        <DatePicker
                                            locale="ru"
                                            id="allowDate"
                                            name="allowDate"
                                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                            selected={allowDate}
                                            dateFormat="dd/MM/yyyy"
                                            onChange={(date) => this.setState({allowDate: date})}
                                        />
                                    </div>
                                    <div class="mb-6">
                                      <label
                                        for="count"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Кол-во наблюдедений для обучения
                                      </label>
                                      <input
                                        type="number"
                                        id="count"
                                        name="count"
                                        min="1"
                                        max="10000"
                                        step="1"
                                        value={count}
                                        onChange={(e) => this.setState({count: parseInt(e.target.value) > 10000? 10000 : parseInt(e.target.value)})}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div class="mb-6">
                                      <label
                                        for="city"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Аффиляция
                                      </label>
                                      <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={city}
                                        onChange={(e) => this.setState({city: e.target.value})}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div class="mb-6">
                                      <label
                                        for="info"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Описание
                                      </label>
                                      <textarea
                                        id="info"
                                        name="info"
                                        value={info}
                                        onChange={(e) => this.setState({info: e.target.value})}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    {userId == 0 ?
                                        <button type="button"
                                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            onClick={() => this.createClick()}
                                            disabled={loadingAdmin}
                                        >
                                            {loadingAdmin ? (
                                                <>
                                                  <svg
                                                    aria-hidden="true"
                                                    role="status"
                                                    class="inline w-4 h-4 mr-3 text-white animate-spin"
                                                    viewBox="0 0 100 101"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <path
                                                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                      fill="#E5E7EB"
                                                    />
                                                    <path
                                                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                      fill="currentColor"
                                                    />
                                                  </svg>
                                                  Сохранение
                                                </>
                                              ) : (
                                                "Создать"
                                              )}
                                        </button>
                                        : null}

                                    {userId != 0 ?
                                        <button type="button"
                                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            onClick={() => this.updateClick(userId)}
                                            disabled={loadingAdmin}

                                        >
                                            {loadingAdmin ? (
                                                <>
                                                  <svg
                                                    aria-hidden="true"
                                                    role="status"
                                                    class="inline w-4 h-4 mr-3 text-white animate-spin"
                                                    viewBox="0 0 100 101"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <path
                                                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                      fill="#E5E7EB"
                                                    />
                                                    <path
                                                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                      fill="currentColor"
                                                    />
                                                  </svg>
                                                  Сохранение
                                                </>
                                              ) : (
                                                "Обновить"
                                              )}
                                        </button>
                                        : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

          </div>
        </div>
      );
    }
  }
}
