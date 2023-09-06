import React, { Component, useState, useEffect, createRef } from "react";

import { Navigate, Link } from "react-router-dom";

import AsyncSelect from "react-select/async";
import Select from "react-select";
import ReactSelect, { createFilter } from "react-select";

import { Tab } from "@headlessui/react";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";

import Switcher from "../components/Switcher";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

import ReactPaginate from "react-paginate";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ag-theme-acmecorp.css";

import Plot from "react-plotly.js";

import {
  variables,
  GetDatasetParams,
  showDate,
  AG_GRID_LOCALE_RU,
} from "./Variables.js";
import { PlotGrafic } from "./Grafics/InfoGrafics.js";

const AllowedGrafics = [
  { id: 0, name: "scatter" },
  { id: 1, name: "histogram" },
];

const links = [
  { href: "/account-settings", label: "Настройки аккаунта" },
  { href: "/support", label: "Поддержка" },
  { href: "/sign-out", label: "Выход" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export class Main extends Component {
  constructor(props) {
    super(props);

    this.gridRef = createRef();
    this.datasetGridRef = createRef();
    this.state = {
      // user data
      user: variables.user,
      token: variables.token,
      loading: false,

      // dataset
      uploaded_file: null,
      datasets: [],
      dataset: null,
      datasetRows: [],
      datasetColumns: [],

      // graphics
      choicedGrafic: null,
      x_label: null,
      x_data: [],
      y_label: null,
      y_data: [],
      group_label: null,
      group_data: [],

      // statistic
      currentElem: null,

      // learner
      default_models: [],
      labels: [],
      LearnModel: null,
      LearnLabel: null,
      NumberLabels: [],
      CategoricalLabels: [],
      LearnInfo: null,
    };
  }

  // настройка грида
  autoGroupColumnDef = () => {
    return {
      minWidth: 200,
    };
  };

  // датасеты их выбор и удаление
  GetDatasets() {
    fetch(variables.API_URL + "main/datasets", {
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
          datasets: data.datasets,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ datasets: [] });
      });
  }

  onSelectionChanged = () => {
    const selectedRows = this.gridRef.current.api.getSelectedRows();
    this.setState({
      dataset: selectedRows.length === 1 ? selectedRows[0] : null,
    });
  };

  deleteDataset(dataset) {
    fetch(
      variables.API_URL + "main/dataset/delete" + `?datasetId=${dataset.id}`,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
        method: "DELETE",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw Error("Dataset doesnt delete");
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ dataset: null });
        this.GetDatasets();
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  // Загрузка датасета

  uploadClick = (e) => {
    e.preventDefault();
    let format = e.target.files[0].name.split(".").slice(-1)[0];
    console.log(format);
    if (format != "csv" && format != "xlsx" && format != "xls") {
      alert('Загрузите пожайлуста файлы формата ".csv" или ".xlsx"');
      return;
    }
    const formData = new FormData();
    formData.append("file", e.target.files[0], e.target.files[0].name);

    fetch(variables.API_URL + "main/datasets/upload", {
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (res.status == 201) {
          return res.json();
        } else {
          throw Error(res.statusText);
        }
      })
      .then((data) => {
        console.log(data);
        this.setState({ uploaded_file: data.name });
        variables.uploaded_file = data.name;
        this.GetDatasets();
      })
      .catch((error) => {
        alert("Ошибка");
      });
  };

  updateClick(dataset) {
    const formData = new FormData();

    var myblob = new Blob([this.datasetGridRef.current.api.getDataAsCsv()], {
      type: "text/plain",
    });
    formData.append("file", myblob, "update.csv");

    fetch(variables.API_URL + `main/dataset/update?datasetId=${dataset.id}`, {
      headers: {
        Authorization: `Token ${this.state.token}`,
      },
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (res.status == 201) {
          return res.json();
        } else {
          throw Error(res.statusText);
        }
      })
      .then((data) => {
        console.log(data);
        this.setState({ uploaded_file: data.name });
        variables.uploaded_file = data.name;
        this.LoadDataset(dataset);
      })
      .catch((error) => {
        alert("Ошибка");
      });
  }

  // Подгрзка датасета с сервера и его визуализация

  LoadDataset(dataset) {
    fetch(
      variables.API_URL + "main/dataset/viewer" + `?datasetId=${dataset.id}`,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          datasetRows: data.dataset,
          datasetColumns: data.columns,
          countRows: data.count_rows,
          countColumns: data.count_columns,
        });
        this.LoadStatistic(dataset);
        this.RefreshModels(dataset);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          datasetRows: [],
          datasetColumns: [],
          countRows: 0,
          countColumns: 0,
        });
      });
  }

  componentDidMount() {
    this.GetDatasets();
  }

  // Работа с визализацией данных(графики)

  changeGrafic = (e) => {
    this.setState({ choicedGrafic: e });
  };

  changeX = (e) => {
    this.setState({ x_label: e });
    this.setState({ x_data: this.state.datasetRows.map((el) => el[e.field]) });
  };

  changeY = (e) => {
    this.setState({ y_label: e });
    this.setState({ y_data: this.state.datasetRows.map((el) => el[e.field]) });
  };

  changeGroup = (e) => {
    this.setState({ group_label: e });
    this.setState({
      group_data: this.state.datasetRows.map((el) => el[e.field]),
    });
  };

  resetGrafic() {
    this.setState({
      choicedGrafic: null,
      x_label: null,
      x_data: [],
      y_label: null,
      y_data: [],
      group_label: null,
      group_data: [],
    });
  }

  // Статистика датасета
  LoadStatistic(dataset) {
    fetch(
      variables.API_URL + "main/dataset/statistic" + `?datasetId=${dataset.id}`,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      }
    )
      .then((response) => {
        if (response.status > 299) {
          throw Error(response.status);
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          info: data.data,
          currentElem: data.data,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ info: [] });
      });
  }

  createStatistic(dataset) {
    console.log(this.state.loading);
    this.setState({ loading: true });

    fetch(
      variables.API_URL + "main/statistic/upload" + `?datasetId=${dataset.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw Error("Ошибка при создании статистических данных");
      })
      .then((data) => {
        this.setState({ loading: false });
        this.LoadStatistic(dataset);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
        this.setState({ info: [], loading: false });
      });
  }

  // Работа с обучением моделей под датасет
  RefreshModels(dataset) {
    fetch(
      variables.API_URL + "main/dataset/models" + `?datasetId=${dataset.id}`,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          default_models: data.models?.map((model) => ({
            id: model,
            name: model,
          })),
          labels: data.labels,
          CategoricalLabels: data.labels.filter((label) => !label.number),
          NumberLabels: data.labels.filter((label) => label.number),
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ default_models: [], labels: [], UseLabels: [] });
      });
  }

  changeModel = (e) => {
    this.setState({ LearnModel: e });
  };

  changeLabel = (e) => {
    this.setState({
      LearnLabel: e,
      NumberLabels: this.state.NumberLabels.filter((x) => x.id !== e.id).map(
        (x) => x
      ),
      CategoricalLabels: this.state.CategoricalLabels.filter(
        (x) => x.id !== e.id
      ).map((x) => x),
    });
  };

  changeNumberLabels = (e) => {
    this.setState({
      NumberLabels: e.map((label) => label),
      LearnLabel: this.state.LearnLabel
        ? e.map((label) => label.id).includes(this.state.LearnLabel.id)
          ? null
          : this.state.LearnLabel
        : null,
      CategoricalLabels: this.state.CategoricalLabels.filter(
        (x) => !e.map((label) => label.id).includes(x.id)
      ).map((x) => x),
    });
  };

  changeCategoricalLabels = (e) => {
    this.setState({
      CategoricalLabels: e.map((label) => label),
      LearnLabel: this.state.LearnLabel
        ? e.map((label) => label.id).includes(this.state.LearnLabel.id)
          ? null
          : this.state.LearnLabel
        : null,
      NumberLabels: this.state.NumberLabels.filter(
        (x) => !e.map((label) => label.id).includes(x.id)
      ).map((x) => x),
    });
  };

  LearnModel(dataset) {
    if (!(this.state.LearnModel && this.state.LearnLabel)) {
      alert("Не выбрана модель или поле для обучения");
      return;
    }

    fetch(
      variables.API_URL + "main/dataset/learner" + `?datasetId=${dataset.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
        body: JSON.stringify({
          model: this.state.LearnModel,
          target: this.state.LearnLabel.name,
          categorical_columns: this.state.CategoricalLabels.map(
            (label) => label.name
          ),
          number_columns: this.state.NumberLabels.map((label) => label.name),
        }),
      }
    )
      .then((res) => {
        if (res.status == 201) {
          return res.json();
        } else {
          throw Error(res.statusText);
        }
      })
      .then((data) => {
        console.log(data);
        this.setState({ LearnInfo: data, loading: false });
      })
      .catch((error) => {
        alert("Ошибка");
      });
  }

  PlotRocCurve(y_scores) {
    var data = [];
    for (const result of y_scores) {
      var trace = {
        type: "scatter",
        y: result[0],
        x: result[1],
        name: result[2],
      };
      data.push(trace);
    }
    return data;
  }

  PlotHeatmap(cm_model, labels) {
    var xValues = labels;

    var yValues = labels;

    var zValues = cm_model;

    var colorscaleValue = [
      [0, "#3D9970"],
      [1, "#001f3f"],
    ];

    var data = [
      {
        x: xValues,
        y: yValues,
        z: zValues,
        type: "heatmap",
        colorscale: colorscaleValue,
        showscale: false,
      },
    ];
    return data;
  }

  PlotLayoutHeatmap(cm_model, labels) {
    var xValues = labels;

    var yValues = labels;

    var zValues = cm_model;

    var layout = {
      title: "Heatmap",
      width: 629,
      height: 500,
      annotations: [],
      xaxis: {
        ticks: "",
        side: "top",
      },
      yaxis: {
        ticks: "",
        ticksuffix: " ",
        autosize: false,
      },
    };

    for (var i = 0; i < yValues.length; i++) {
      for (var j = 0; j < xValues.length; j++) {
        var currentValue = zValues[i][j];
        if (currentValue != 0.0) {
          var textColor = "white";
        } else {
          var textColor = "black";
        }
        var result = {
          xref: "x1",
          yref: "y1",
          x: xValues[j],
          y: yValues[i],
          text: zValues[i][j],
          font: {
            family: "Arial",
            size: 12,
            color: "rgb(171, 78, 50)",
          },
          showarrow: false,
          font: {
            color: textColor,
          },
        };
        layout.annotations.push(result);
      }
    }
    return layout;
  }

  render() {
    const {
      token,
      user,
      loading,
      uploaded_file,

      datasets,
      dataset,
      datasetRows,
      datasetColumns,
      countColumns,
      countRows,

      allowed_grafics,
      choicedGrafic,
      x_label,
      y_label,
      x_data,
      y_data,
      group_label,
      group_data,

      currentElem,

      default_models,
      LearnModel,
      labels,
      NumberLabels,
      CategoricalLabels,
      LearnLabel,
      LearnInfo,
    } = this.state;

    if (token == "") {
      return <Navigate push to="/login" />;
    } else {
      return (
        <div>
          <Tab.Group>
            <header>
              <div className="min-h-full">
                <Disclosure
                  as="nav"
                  className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800"
                >
                  {({ open }) => (
                    <>
                      <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex">
                              <img
                                src="https://flowbite.com/docs/images/logo.svg"
                                class="h-8 mr-3"
                                alt="Datamed LOGO"
                              />
                              <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                                ML_Datamed
                              </span>
                            </div>

                            <div className="hidden md:block">
                              <div className="ml-10 flex items-baseline space-x-4">
                                <Tab.List className="flex space-x-4 rounded-xl p-4 text-gray-500 dark:text-gray-300">
                                  <Tab
                                    className={({ selected }) =>
                                      classNames(
                                        "dark:bg-gray-800",
                                        "block rounded-md px-3 py-2 text-base font-medium",
                                        selected
                                          ? "bg-gray-100 dark:bg-gray-600"
                                          : "hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                                      )
                                    }
                                  >
                                    Загрузка данных
                                  </Tab>
                                  <Tab
                                    className={({ selected }) =>
                                      classNames(
                                        "dark:bg-gray-800",
                                        "block rounded-md px-3 py-2 text-base font-medium",
                                        selected
                                          ? "bg-gray-100 dark:bg-gray-600"
                                          : "hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                                      )
                                    }
                                  >
                                    Просмотр
                                  </Tab>
                                  <Tab
                                    className={({ selected }) =>
                                      classNames(
                                        "dark:bg-gray-800",
                                        "block rounded-md px-3 py-2 text-base font-medium",
                                        selected
                                          ? "bg-gray-100 dark:bg-gray-600"
                                          : "hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                                      )
                                    }
                                  >
                                    Графики
                                  </Tab>
                                  <Tab
                                    className={({ selected }) =>
                                      classNames(
                                        "dark:bg-gray-800",
                                        "block rounded-md px-3 py-2 text-base font-medium",
                                        selected
                                          ? "bg-gray-100 dark:bg-gray-600"
                                          : "hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                                      )
                                    }
                                  >
                                    Статистика
                                  </Tab>
                                  <Tab
                                    className={({ selected }) =>
                                      classNames(
                                        "dark:bg-gray-800",
                                        "block rounded-md px-3 py-2 text-base font-medium",
                                        selected
                                          ? "bg-gray-100 dark:bg-gray-600"
                                          : "hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                                      )
                                    }
                                  >
                                    Обучение
                                  </Tab>
                                </Tab.List>
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                              <Switcher />
                              {/* Profile dropdown */}
                              <Menu
                                as="div"
                                className="relative inline-block text-left"
                              >
                                <Menu.Button className="relative flex max-w-xs items-center rounded-full bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                  <span className="absolute -inset-1.5" />
                                  <span className="sr-only">
                                    Open user menu
                                  </span>
                                  <img
                                    className="h-8 w-8 rounded-full"
                                    src="https://img.icons8.com/?size=512&id=108296&format=png"
                                    alt=""
                                  />
                                </Menu.Button>
                                <Transition
                                  as={Fragment}
                                  enter="transition ease-out duration-100"
                                  enterFrom="transform opacity-0 scale-95"
                                  enterTo="transform opacity-100 scale-100"
                                  leave="transition ease-in duration-75"
                                  leaveFrom="transform opacity-100 scale-100"
                                  leaveTo="transform opacity-0 scale-95"
                                >
                                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:divide-gray-800 dark:text-gray-400">
                                    {links.map((link) => (
                                      <div className="px-1 py-1 ">
                                        <Menu.Item
                                          as="a"
                                          key={link.href}
                                          href={link.href}
                                          className="group flex w-full items-center rounded-md px-2 py-2 text-sm dark:hover:bg-gray-600"
                                        >
                                          {link.label}
                                        </Menu.Item>
                                      </div>
                                    ))}
                                  </Menu.Items>
                                </Transition>
                              </Menu>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Мобильное меню 
                    <Disclosure.Panel className="md:hidden">
                      <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                        {navigation.map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "block rounded-md px-3 py-2 text-base font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 pb-3 pt-4">
                        <div className="flex items-center px-5">
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.imageUrl}
                              alt=""
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-base font-medium leading-none text-white">
                              {user.name}
                            </div>
                            <div className="text-sm font-medium leading-none text-gray-400">
                              {user.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="relative ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                          >
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="mt-3 space-y-1 px-2">
                          {userNavigation.map((item) => (
                            <Disclosure.Button
                              key={item.name}
                              as="a"
                              href={item.href}
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              {item.name}
                            </Disclosure.Button>
                          ))}
                        </div>
                      </div>
                    </Disclosure.Panel>
                    */}
                    </>
                  )}
                </Disclosure>
              </div>
            </header>
            {/* Страница с датасетом где он выводится в aj-grid и тут его загрузка есть */}
            <main className="w-full p-4">
              <Tab.Panels className="">
                <Tab.Panel
                  className={classNames(
                    "min-h-screen rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg",
                    "focus:outline-none"
                  )}
                >
                  {/* загрузка файла */}
                  <div>
                    <h2 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Загрузка данных
                    </h2>
                    {/* просмотр и выбо датасетов */}
                    <div
                      className="mt-4 flex text-sm leading-6 text-gray-600"
                      style={{ height: 300, width: 1000 }}
                    >
                      <div
                        className="ag-theme-alpine ag-theme-acmecorp"
                        style={{ height: "100%", width: "100%" }}
                      >
                        <AgGridReact
                          ref={this.gridRef}
                          rowData={datasets}
                          columnDefs={[
                            { field: "id" },
                            { field: "name" },
                            { field: "format" },
                            { field: "size" },
                            { field: "statistic" },
                            { field: "upload_date" },
                            { field: "user" },
                          ]}
                          rowSelection={"single"}
                          onSelectionChanged={this.onSelectionChanged}
                        ></AgGridReact>
                      </div>
                    </div>
                    <div>
                      {dataset ? (
                        <>
                          <p>{dataset.name}</p>
                          <button
                            type="button"
                            onClick={() => this.deleteDataset(dataset)}
                          >
                            Удалить
                          </button>
                          <br />
                          <button
                            type="button"
                            onClick={() => this.LoadDataset(dataset)}
                          >
                            Выгрузить
                          </button>
                        </>
                      ) : null}
                    </div>
                    <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                      <label
                        htmlFor="cover-photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      ></label>
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                          <PhotoIcon
                            className="mx-auto h-12 w-12 text-gray-300"
                            aria-hidden="true"
                          />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="files"
                              className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              <span>
                                {uploaded_file ? (
                                  <>
                                    {uploaded_file.slice(0, 5)} ...{" "}
                                    {uploaded_file.slice(-5)}
                                  </>
                                ) : (
                                  <>Загрузить файл</>
                                )}
                              </span>
                              <input
                                id="files"
                                type="file"
                                className="sr-only"
                                onChange={this.uploadClick}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            XLS, XLSX, CSV up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    "min-h-screen rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg",
                    "focus:outline-none"
                  )}
                >
                  {/* Отображаем файл в виде таблицы */}
                  <h2 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Просмотр
                  </h2>
                  <div>
                    {datasetRows.length !== 0 ? (
                      <>
                        <div
                          className="ag-theme-alpine ag-theme-acmecorp"
                          style={{ height: 600, width: "100%" }}
                        >
                          <AgGridReact
                            ref={this.datasetGridRef}
                            columnDefs={datasetColumns}
                            rowData={datasetRows}
                            autoGroupColumnDef={this.autoGroupColumnDef}
                            localeText={AG_GRID_LOCALE_RU}
                            sideBar={{
                              toolPanels: [
                                {
                                  id: "columns",
                                  labelDefault: "Columns",
                                  labelKey: "columns",
                                  iconKey: "columns",
                                  toolPanel: "agColumnsToolPanel",
                                  minWidth: 225,
                                  width: 225,
                                  maxWidth: 225,
                                },
                                {
                                  id: "filters",
                                  labelDefault: "Filters",
                                  labelKey: "filters",
                                  iconKey: "filter",
                                  toolPanel: "agFiltersToolPanel",
                                  minWidth: 180,
                                  maxWidth: 400,
                                  width: 250,
                                },
                              ],
                              position: "left",
                            }}
                          ></AgGridReact>
                        </div>
                        {/* общая информация о датасете */}
                        <p>Count rows = {countRows}</p>
                        <p>Count columns = {countColumns}</p>
                        <button
                          type="button"
                          onClick={() => this.updateClick(dataset)}
                        >
                          Обновить
                        </button>
                      </>
                    ) : null}
                  </div>
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    "min-h-screen rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg",
                    "focus:outline-none"
                  )}
                >
                  {/* Графики для датасета */}
                  <h2 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Графики
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Выбор графика и осей */}
                    {datasetRows.length !== 0 ? (
                      <>
                        <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            График
                          </label>
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            options={AllowedGrafics}
                            getOptionLabel={(option) => `${option["name"]}`}
                            getOptionValue={(option) => `${option["id"]}`}
                            value={choicedGrafic}
                            noOptionsMessage={() => "Пусто"}
                            onChange={this.changeGrafic}
                            placeholder="Выберите график"
                          />
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            X label
                          </label>
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            options={datasetColumns}
                            getOptionLabel={(option) => `${option["field"]}`}
                            getOptionValue={(option) => `${option["field"]}`}
                            value={x_label}
                            noOptionsMessage={() => "Пусто"}
                            onChange={this.changeX}
                            placeholder="Выберите X"
                          />
                          {choicedGrafic ? (
                            choicedGrafic.name === "histogram" ? null : (
                              <>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Y label
                                </label>
                                <Select
                                  className="basic-single"
                                  classNamePrefix="select"
                                  options={datasetColumns}
                                  getOptionLabel={(option) =>
                                    `${option["field"]}`
                                  }
                                  getOptionValue={(option) =>
                                    `${option["field"]}`
                                  }
                                  value={y_label}
                                  noOptionsMessage={() => "Пусто"}
                                  onChange={this.changeY}
                                  placeholder="Выберите Y"
                                />
                              </>
                            )
                          ) : null}
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Group label
                          </label>
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            options={datasetColumns}
                            getOptionLabel={(option) => `${option["field"]}`}
                            getOptionValue={(option) => `${option["field"]}`}
                            value={group_label}
                            noOptionsMessage={() => "Пусто"}
                            onChange={this.changeGroup}
                            placeholder="Выберите Y"
                          />
                          <button
                            class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            type="button"
                            onClick={() => this.resetGrafic()}
                          >
                            Очистить
                          </button>
                        </div>
                        {/* Отрисовка графика */}
                        <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                          <PlotGrafic
                            graffic={choicedGrafic}
                            x_label={x_label ? x_label.field : null}
                            y_label={y_label ? y_label.field : null}
                            group_label={group_data}
                            x_data={x_data}
                            y_data={y_data}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    "min-h-screen rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg",
                    "focus:outline-none"
                  )}
                >
                  {/* Статистика для датасета */}
                  <h2 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Статистика
                  </h2>
                  {datasetRows.length !== 0 ? (
                    <>
                      <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        {currentElem === null ? (
                          loading ? (
                            "Загрузка..."
                          ) : (
                            <button
                              type="button"
                              onClick={() => this.createStatistic(dataset)}
                            >
                              Создать
                            </button>
                          )
                        ) : (
                          <>
                            <iframe
                              srcdoc={currentElem}
                              style={{ height: 1000, width: "100%" }}
                            ></iframe>
                            <button
                              type="button"
                              onClick={() => this.createStatistic(dataset)}
                            >
                              Обновить
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : null}
                </Tab.Panel>
                <Tab.Panel
                  className={classNames(
                    "min-h-screen rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg",
                    "focus:outline-none"
                  )}
                >
                  {/* Обучение моделей */}
                  <h2 class="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Обучение
                  </h2>
                  {/* Выбор для обучения */}
                  {datasetRows.length !== 0 ? (
                    <div className="mb-4 block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Доступные модели
                      </label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        options={default_models}
                        getOptionLabel={(option) => `${option["name"]}`}
                        getOptionValue={(option) => `${option["id"]}`}
                        value={LearnModel}
                        noOptionsMessage={() => "Пусто"}
                        onChange={this.changeModel}
                        placeholder="Выберите модель для обучения"
                        isSearchable
                        isClearable
                      />
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Поле для обучения
                      </label>
                      <Select
                        className="basic-single"
                        classNamePrefix="select"
                        options={labels}
                        getOptionLabel={(option) => `${option["name"]}`}
                        getOptionValue={(option) => `${option["id"]}`}
                        value={LearnLabel}
                        noOptionsMessage={() => "Пусто"}
                        onChange={(e) => this.changeLabel(e)}
                        placeholder="Выберите поле для обучения"
                        isSearchable
                        isClearable
                      />
                      <label
                        for="date"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Категориальные данные
                      </label>
                      <Select
                        className="basic-multi-select"
                        classNamePrefix="select"
                        options={labels}
                        getOptionLabel={(option) => `${option["name"]}`}
                        getOptionValue={(option) => `${option["id"]}`}
                        value={CategoricalLabels}
                        onChange={(e) => this.changeCategoricalLabels(e)}
                        placeholder="Выберите поля на который будете обучать"
                        isSearchable
                        isClearable
                        isMulti
                      />
                      <label
                        for="date"
                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Числовые данные
                      </label>
                      <Select
                        className="basic-multi-select"
                        classNamePrefix="select"
                        options={labels}
                        getOptionLabel={(option) => `${option["name"]}`}
                        getOptionValue={(option) => `${option["id"]}`}
                        value={NumberLabels}
                        onChange={(e) => this.changeNumberLabels(e)}
                        placeholder="Выберите поля на который будете обучать"
                        isSearchable
                        isClearable
                        isMulti
                      />
                      <div>
                        <button
                          type="button"
                          class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                          onClick={() => this.LearnModel(dataset)}
                        >
                          Обучить
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {/* Информация об обучении */}

                  {LearnInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                      {/* таблица с результатами */}
                      <div className="mb-4 block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                        <div
                          className="ag-theme-alpine ag-theme-acmecorp"
                          style={{ height: "100%", width: "100%" }}
                        >
                          <AgGridReact
                            rowData={LearnInfo.classification_matrix}
                            columnDefs={[
                              { field: LearnLabel.name },
                              { field: "SE" },
                              { field: "SP" },
                              { field: "PPV" },
                              { field: "NPV" },
                              { field: "FPR" },
                              { field: "FNR" },
                              { field: "Overall accuracy" },
                              { field: "LR+" },
                              { field: "LR-" },
                              { field: "DOR" },
                            ]}
                          ></AgGridReact>
                        </div>
                      </div>
                      {/* Графики обучения */}
                      <div>
                        {/* график правилных результатов */}
                        <div className="mb-4 block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                          <Plot
                            data={this.PlotHeatmap(
                              LearnInfo.cm_model,
                              LearnInfo.y_onehot
                            )}
                            layout={this.PlotLayoutHeatmap(
                              LearnInfo.cm_model,
                              LearnInfo.y_onehot
                            )}
                          />
                        </div>
                        {/* Roc кривая */}
                        <div className="mb-4 block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                          <Plot
                            data={this.PlotRocCurve(LearnInfo.y_scores)}
                            layout={{
                              width: "100%",
                              height: "100%",
                              title: "Roc Curve",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Tab.Panel>
              </Tab.Panels>
            </main>
          </Tab.Group>
        </div>
      );
    }
  }
}
