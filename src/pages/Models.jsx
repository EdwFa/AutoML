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
import { PlotGrafic } from "../api/Grafics/InfoGrafics.js";

function markUpPrediction(modelPred) {
  return `<span style=\"color: ${modelPred.max ? "green" : "black"}\">${
    modelPred.value * 100
  } %</span>`;
}

export class Models extends Component {
  constructor(props) {
    super(props);

    this.gridRef = createRef();
    this.datasetGridRef = createRef();
    this.state = {
      // user data
      user: variables.user,
      token: variables.token,
      loading: false,
      model: null,
      models: [],

      newName: "",
      newInfo: "",

      modelInfo: null,
      predictInfo: [],
      prediction: null,
      softmax: null,
    };
  }

  // настройка грида
  autoGroupColumnDef = () => {
    return {
      minWidth: 200,
    };
  };

  // датасеты их выбор и удаление
  GetModels() {
    fetch(variables.API_URL + "main/models", {
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
          models: data.models,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ models: [] });
      });
  }

  deleteModel(model) {
    fetch(
      variables.API_URL + "main/models/model/delete" + `?modelId=${model.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.GetModels();
        this.setState({ model: null });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ model: null });
      });
  }

  changeModelName = (e) => {
    this.setState({ newName: e });
  };

  changeModelInfo = (e) => {
    this.setState({ newInfo: e });
  };

  onSelectionChanged = () => {
    const selectedRows = this.gridRef.current.api.getSelectedRows();
    let model_info = selectedRows.length === 1 ? selectedRows[0] : null;
    if (model_info === null) return;
    this.setState({
      model: model_info,
      newName: model_info.name,
      newInfo: model_info.info,
      modelInfo: null,
    });
  };

  componentDidMount() {
    console.log(variables);
    this.GetModels();
  }

  // Работа с загрузкой и использованием моделей
  GetModelInfo(model) {
    fetch(variables.API_URL + "main/models/model" + `?modelId=${model.id}`, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Token ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          modelInfo: data.configs,
          predictInfo: data.configs
            .slice(0, -1)
            .map((param) => [param.label, null]),
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  UpdateModel(model) {
    fetch(
      variables.API_URL + "main/models/model/update" + `?modelId=${model.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
        body: JSON.stringify({
          modelName: this.state.newName,
          modelInfo: this.state.newInfo,
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.GetModels();
        this.setState({ model: null });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  changeModelName = (e) => {
    this.setState({ newName: e.target.value });
  };

  changeModelInfo = (e) => {
    this.setState({ newInfo: e.target.value });
  };

  changeNumber = (e, index) => {
    let newInfo = this.state.predictInfo;
    newInfo[index][1] = parseFloat(e.target.value);
    this.setState({ predictInfo: [...newInfo] });
  };

  changeCategorical = (e, index) => {
    let newInfo = this.state.predictInfo;
    newInfo[index][1] = e;
    this.setState({ predictInfo: [...newInfo] });
  };

  predictModel(model) {
    for (let i of this.state.predictInfo)
      if (i[1] === null) {
        alert("заполните все поля!");
        return;
      }

    this.setState({ loadingLearn: true });
    fetch(
      variables.API_URL + "main/models/model/predict" + `?modelId=${model.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Token ${this.state.token}`,
        },
        body: JSON.stringify({
          params: this.state.predictInfo,
        }),
      }
    )
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status == 504) throw Error("Время ожидания вышло");
        else throw Error(res.statusText);
      })
      .then((data) => {
        if (data.status == 200) {
          console.log(data);
          this.setState({ loadingLearn: false, prediction: data.prediction });
        } else {
          throw Error(data.message);
        }
      })
      .catch((error) => {
        alert(error);
        this.setState({ loadingLearn: false });
      });
  }

  plotPred(prediction) {
    console.log(
      prediction.map((x) => x.value),
      prediction.map((x) => x.target)
    );
    var data = [
      {
        x: prediction.map((x) => `${x.target}<br />`),
        y: prediction.map((x) => x.value),
        type: "bar",
      },
    ];
    return data;
  }

  render() {
    const {
      token,
      user,
      loading,

      models,
      model,

      newName,
      newInfo,

      modelInfo,
      predictInfo,

      prediction,
    } = this.state;

    if (token == "") {
      return <Navigate push to="/login" />;
    } else {
      return (
        <div className="flex h-screen overflow-hidden">
          {/*Боковое меню*/}
          <Aside />
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
                </ol>
              </nav>
            </header>
            <div className="bg-white border-gray-200 px-4 dark:bg-gray-800">
              <div className="h-dvh flex flex-col bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="mt-4 font-bold">Ваши Модели</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div
                      className="mt-4 grow w-full flex text-sm leading-6 text-gray-600"
                      style={{ height: 300, width: "100%" }}
                    >
                      <div
                        className="ag-theme-alpine ag-theme-acmecorp"
                        style={{ height: "100%", width: "100%" }}
                      >
                        <AgGridReact
                          ref={this.gridRef}
                          rowData={models}
                          pagination={true}
                          columnDefs={[
                            {
                              field: "info",
                              sortable: true,
                              enableRowGroup: true,
                              enableValue: true,
                              resizable: true,
                              headerName: "Описание",
                            },
                            {
                              field: "name",
                              sortable: true,
                              enableRowGroup: true,
                              enableValue: true,
                              resizable: true,
                              headerName: "Название файла",
                            },
                            {
                              field: "date",
                              sortable: true,
                              enableRowGroup: true,
                              enableValue: true,
                              resizable: true,
                              headerName: "Дата загрузки",
                            },
                            {
                              field: "user",
                              sortable: true,
                              enableRowGroup: true,
                              enableValue: true,
                              resizable: true,
                              headerName: "Владелец",
                            },
                          ]}
                          rowSelection={"single"}
                          onSelectionChanged={this.onSelectionChanged}
                        ></AgGridReact>
                      </div>
                    </div>
                  </div>
                  {model === null ? null : (
                    <>
                      {/* Обновление описание и название модели */}
                      <div>
                        <p className="mt-4">
                          Выбрана модель:{" "}
                          <span className="font-bold">{model.name}</span>
                        </p>
                        <div className="mt-4 flex justify-start">
                          <button
                            type="button"
                            disabled={loading}
                            className="mr-2 px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                            onClick={() => this.deleteModel(model)}
                          >
                            Удалить датасет
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            className="px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => this.GetModelInfo(model)}
                          >
                            {loading ? (
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
                                Загрузка
                              </>
                            ) : (
                              "Открыть"
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Использование модели */}
                      {/* Изменение общей информации модели */}
                      <div className="">
                        <label
                          for="message"
                          class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Название модели
                        </label>
                        <input
                          value={newName}
                          onChange={this.changeModelName}
                          placeholder="Введите название модели"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <label
                          for="message"
                          class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Описание модели
                        </label>
                        <textarea
                          value={newInfo}
                          onChange={this.changeModelInfo}
                          placeholder="Заполните описание"
                          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        <button
                          type="button"
                          disabled={loading}
                          className="px-3 mt-2 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          onClick={() => this.UpdateModel(model)}
                        >
                          Обновить
                        </button>
                      </div>
                      {/* Использование модели как предсказательной модели */}
                      {modelInfo ? (
                        <div className="col-span-2">
                          {modelInfo?.slice(0, -1).map((modelParam, index) =>
                            modelParam.type === "num" ? (
                              <div>
                                {/* Если данные числовые */}
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {modelParam.label}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={predictInfo[index][1]}
                                  onChange={(e) => this.changeNumber(e, index)}
                                  placeholder="Введите значени поля"
                                />
                              </div>
                            ) : (
                              <div>
                                {/* Если данные категориальные */}
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {modelParam.label}
                                </label>
                                <Select
                                  className="basic-single"
                                  classNamePrefix="select"
                                  options={modelParam.params}
                                  getOptionLabel={(option) =>
                                    `${option["cat"]}`
                                  }
                                  getOptionValue={(option) =>
                                    `${option["val"]}`
                                  }
                                  value={predictInfo[index][1]}
                                  noOptionsMessage={() => "Пусто"}
                                  onChange={(e) =>
                                    this.changeCategorical(e, index)
                                  }
                                  placeholder="Выберите значение поля"
                                  isSearchable
                                  isClearable
                                />
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            disabled={loading}
                            className="px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => this.predictModel(model)}
                          >
                            Предсказать
                          </button>
                          {/* Вывод результатов по предсказанию */}
                          {prediction === null ? null : (
                            <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                              {/* Метрики */}
                              <Plot
                                data={this.plotPred(prediction)}
                                layout={{
                                  autosize: true,
                                  title: `Предсказание модели для ${prediction[0].label}`,
                                  yaxis: { range: [0, 1] },
                                }}
                                style={{ height: "100%", width: "100%" }}
                              />
                            </div>
                          )}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
