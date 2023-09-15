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
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

import ReactPaginate from "react-paginate";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ag-theme-acmecorp.css";

import Plot from "react-plotly.js";

import Gr1 from "../../src/gr1.png";
import Gr2 from "../../src/gr2.png";

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
        alert("Датасет загружен");
      })
      .catch((error) => {
        console.log(error);
        alert("Ошибка при загрузке");
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
        this.setState({ info: [], currentElem: null });
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
      [0, "#60a5fa"],
      [1, "#1d4ed8"],
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
      width: 550,
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
        <div className="flex h-screen overflow-hidden">
          {/*Боковое меню*/}
          <Aside />
          {/*Хлебные крошки*/}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Tab.Group>
              <div>
                <Disclosure
                  as="nav"
                  className="bg-white border-gray-200 px-4 lg:px-6 dark:bg-gray-800"
                >
                  {({ open }) => (
                    <div className="flex h-16 items-center justify-between">
                      <div className="flex items-center">
                        <div className="hidden md:block">
                          <div className="flex items-baseline space-x-4">
                            <Tab.List className="flex space-x-4 text-sm font-medium text-center">
                              <Tab
                                className={({ selected }) =>
                                  classNames(
                                    "",
                                    "inline-block p-2 border-b-2 rounded-t-lg",
                                    selected
                                      ? "focus:outline-none text-blue-600 border-b-2 border-blue-600"
                                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                  )
                                }
                              >
                                Загрузка данных
                              </Tab>
                              <Tab
                                className={({ selected }) =>
                                  classNames(
                                    "",
                                    "inline-block p-2 border-b-2 rounded-t-lg",
                                    selected
                                      ? "focus:outline-none text-blue-600 border-b-2 border-blue-600"
                                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                  )
                                }
                              >
                                Просмотр
                              </Tab>
                              <Tab
                                className={({ selected }) =>
                                  classNames(
                                    "",
                                    "inline-block p-2 border-b-2 rounded-t-lg",
                                    selected
                                      ? "focus:outline-none text-blue-600 border-b-2 border-blue-600"
                                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                  )
                                }
                              >
                                Графики
                              </Tab>
                              <Tab
                                className={({ selected }) =>
                                  classNames(
                                    "",
                                    "inline-block p-2 border-b-2 rounded-t-lg",
                                    selected
                                      ? "focus:outline-none text-blue-600 border-b-2 border-blue-600"
                                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                  )
                                }
                              >
                                Статистика
                              </Tab>
                              <Tab
                                className={({ selected }) =>
                                  classNames(
                                    "",
                                    "inline-block p-2 border-b-2 rounded-t-lg",
                                    selected
                                      ? "focus:outline-none text-blue-600 border-b-2 border-blue-600"
                                      : "hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                  )
                                }
                              >
                                Обучение
                              </Tab>
                            </Tab.List>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Disclosure>
                {/* Страница с датасетом где он выводится в aj-grid и тут его загрузка есть */}
                <Tab.Panels className={classNames("px-4")}>
                  <Tab.Panel
                    className={classNames(
                      "h-dvh flex flex-col bg-white dark:bg-gray-800",
                      "focus:outline-none"
                    )}
                  >
                    {/* загрузка файла */}
                    <InfoPanel>
                      <span class="sr-only">Info</span>
                      <div class="ml-3 text-sm">
                        Это стартовая страница. Чтобы начать работу в системе,
                        загрузите файл с датасетом. Обратите внимание, что файл
                        должен соответствовать следующим параметрам:{" "}
                        <p>• Допустимый формат: XLS, XLSX, CSV </p>
                        <p>• Допустимый размер: до 10 MB</p>
                        <p>
                          Если вы хотите протестировать работу системы, но у вас
                          нет готового датасета, вы можете воспользоваться
                          нашими тестовыми датасетами. Для этого кликните одну
                          из строк ниже и нажмите кнопку "Анализировать"
                        </p>
                      </div>
                    </InfoPanel>

                    <div className="">
                      <span>
                        {uploaded_file ? (
                          <>
                            {uploaded_file.slice(0, 5)} ...{" "}
                            {uploaded_file.slice(-5)}
                          </>
                        ) : (
                          <label
                            class="px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            for="files"
                          >
                            Загрузить датасет
                          </label>
                        )}
                      </span>
                      <input
                        className="hidden"
                        id="files"
                        type="file"
                        onChange={this.uploadClick}
                      />
                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        XLS, XLSX, CSV не более 10MB
                      </p>
                    </div>

                    {/* просмотр и выбо датасетов */}
                    <div className="mt-4 grow w-full flex text-sm leading-6 text-gray-600">
                      <div
                        className="ag-theme-alpine ag-theme-acmecorp"
                        style={{ height: "100%", width: "100%" }}
                      >
                        <AgGridReact
                          ref={this.gridRef}
                          rowData={datasets}
                          pagination={true}
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
                          <p className="mt-4">Выбран датасет: {dataset.name}</p>
                          <div className="mt-4 flex justify-start">
                            <button
                              type="button"
                              className="mr-2 px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                              onClick={() => this.deleteDataset(dataset)}
                            >
                              Удалить датасет
                            </button>
                            <br />
                            <button
                              type="button"
                              className="px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              onClick={() => this.LoadDataset(dataset)}
                            >
                              Открыть
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </Tab.Panel>
                  <Tab.Panel
                    className={classNames(
                      "h-dvh flex flex-col bg-white dark:bg-gray-800",
                      "focus:outline-none"
                    )}
                  >
                    {/* Отображаем файл в виде таблицы */}
                    <InfoPanel>
                      <span class="sr-only">Info</span>
                      <div class="ml-3 text-sm">
                        В этом разделе отображается содержание файла. Здесь вы
                        можете просматривать и редактировать данные.
                      </div>
                    </InfoPanel>
                    {datasetRows.length !== 0 ? (
                      <div className="mt-4 grow w-full flex flex-col text-sm leading-6 text-gray-600">
                        <div
                          className="ag-theme-alpine ag-theme-acmecorp flex flex-col"
                          style={{ height: "100%", width: "100%" }}
                        >
                          <AgGridReact
                            ref={this.datasetGridRef}
                            columnDefs={datasetColumns}
                            rowData={datasetRows}
                            autoGroupColumnDef={this.autoGroupColumnDef}
                            localeText={AG_GRID_LOCALE_RU}
                            pagination={true}
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
                        <div className="flex items-baseline space-x-4">
                          {/* общая информация о датасете */}
                          <p> Количество строк: {countRows}</p>
                          <p>Количество колонок: {countColumns}</p>
                          <button
                            type="button"
                            className="mt-4 px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => this.updateClick(dataset)}
                          >
                            Сохранить изменения
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </Tab.Panel>
                  <Tab.Panel
                    className={classNames(
                      "h-full bg-white dark:bg-gray-800",
                      "focus:outline-none"
                    )}
                  >
                    {/* Графики для датасета */}
                    <InfoPanel>
                      <span class="sr-only">Info</span>
                      <div class="ml-3 text-sm">
                        Данный раздел содержит функционал для графического
                        отображения данных. После загрузки датасета на странице
                        "Загрузка данных", здесь отобразится панель настройки
                        графиков.
                      </div>
                    </InfoPanel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Выбор графика и осей */}
                      {datasetRows.length !== 0 ? (
                        <>
                          <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
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
                          <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
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
                    <div className="flex mt-28">
                      <img className="ml-16 h-full w-80" src={Gr1} alt="" />
                      <img className="ml-16 h-full w-80" src={Gr2} alt="" />
                    </div>
                  </Tab.Panel>

                  <Tab.Panel
                    className={classNames(
                      "h-dvh flex flex-col bg-white dark:bg-gray-800",
                      "focus:outline-none"
                    )}
                  >
                    {/* Статистика для датасета */}
                    <InfoPanel>
                      <span class="sr-only">Info</span>
                      <div class="ml-3 text-sm">
                        Данный раздел отображает сводный анализ данных,
                        содержащихся в датасете.
                      </div>
                    </InfoPanel>
                    {datasetRows.length !== 0 ? (
                      <>
                        <div className="">
                          {currentElem === null ? (
                            loading ? (
                              "Загрузка..."
                            ) : (
                              <button
                                type="button"
                                className="mt-4 px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={() => this.createStatistic(dataset)}
                              >
                                Создать
                              </button>
                            )
                          ) : (
                            <>
                              <iframe
                                srcdoc={currentElem}
                                style={{
                                  height: 1000,
                                  width: "100%",
                                }}
                              ></iframe>
                              <button
                                type="button"
                                className="mt-4 px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                      "h-dvh flex flex-col bg-white dark:bg-gray-800",
                      "focus:outline-none"
                    )}
                  >
                    {/* Обучение моделей */}
                    <InfoPanel>
                      <span class="sr-only">Info</span>
                      <div class="ml-3 text-sm">
                        Этот раздел позволяет обучить нейросеть для дальнейшей
                        работы с данными.
                      </div>
                    </InfoPanel>
                    {/* Выбор для обучения */}
                    {datasetRows.length !== 0 ? (
                      <div className="mb-4">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* таблица с результатами */}
                        <div className="h-96 col-span-2">
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
                        {/* график правилных результатов */}
                        <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
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
                        <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
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
                    ) : null}
                  </Tab.Panel>
                </Tab.Panels>
              </div>
            </Tab.Group>
          </div>
        </div>
      );
    }
  }
}
