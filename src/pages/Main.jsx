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

const AllowedGrafics = [
  { id: 0, name: "scatter" },
  { id: 1, name: "histogram" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function GetLearnInfo(props) {
  console.log("get info...");
  return <p>Loading</p>;
  fetch(
    variables.API_URL +
      "main/dataset/learner_info" +
      `?datasetId=${props.datasetId}&${props.LearnModel}`,
    {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Token ${props.token}`,
      },
    }
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then((data) => {
      console.log(data);
      return <p>Learning</p>;
    })
    .catch((error) => {
      alert("Ошибка");
    });
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
      loadingStat: false,
      loadingLearn: false,
      learnInfo: null,

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
    console.log(variables);
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
    this.setState({ loadingStat: true });
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
    this.setState({ loadingStat: false });
  }

  createStatistic(dataset) {
    this.setState({ loadingStat: true });

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
        this.LoadStatistic(dataset);
        this.setState({ loadingStat: false });
      })
      .catch((error) => {
        console.log(error);
        alert(error);
        this.setState({ loadingStat: false });
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
          LearnLabel: null,
          LearnInfo: null,
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

    this.setState({ loadingLearn: true });
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
        this.setState({ LearnInfo: data });
        this.setState({ loadingLearn: false });
      })
      .catch((error) => {
        alert("Ошибка");
        this.setState({ loadingLearn: false });
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

    var yValues = [...labels].reverse();

    var zValues = [...cm_model].reverse();

    var colorscaleValue = [
      [0, "#FFFFFF"],
      [1, "#191970"],
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

    var yValues = [...labels].reverse();

    var zValues = [...cm_model].reverse();
    var SumValues = 0;
    for (let i = 0; i < zValues.length; i++) {
      for (let j = 0; j < zValues.length; j++) {
        SumValues = SumValues + zValues[i][j];
      }
    }

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
        autosize: true,
      },
    };

    for (var i = 0; i < yValues.length; i++) {
      for (var j = 0; j < xValues.length; j++) {
        var currentValue = zValues[i][j];
        if (currentValue > SumValues * 0.25) {
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

  // Графики для отрисовки по каджому label

  PlotMetricsLabel(row) {
    var metrics = ["Se", "Sp", "PPV", "NPV", "FPR", "FNR"];
    var rowData = [row.SE, row.SP, row.PPV, row.NPV, row.FPR, row.FNR];
    var data = [
      {
        x: metrics,
        y: rowData,
        name: "metric",
        error_y: {
          type: "data",
          array: [
            row.SE - row.SE_min,
            row.SP - row.SP_min,
            row.PPV - row.PPV_min,
            row.NPV - row.NPV_min,
            row.FPR - row.FPR_min,
            row.FNR - row.FNR_min,
          ],
          visible: true,
        },
        type: "bar",
      },
    ];
    return data;
  }

  PlotIntervalsLabel(row) {
    var metrics = ["Se", "Sp", "PPV", "NPV", "FPR", "FNR"];
    var textList = [
      `${row.SE_max.toFixed(2)}<br>${row.SE_min.toFixed(2)}`,
      `${row.SP_max.toFixed(2)}<br>${row.SP_min.toFixed(2)}`,
      `${row.PPV_max.toFixed(2)}<br>${row.PPV_min.toFixed(2)}`,
      `${row.NPV_max.toFixed(2)}<br>${row.NPV_min.toFixed(2)}`,
      `${row.FPR_max.toFixed(2)}<br>${row.FPR_min.toFixed(2)}`,
      `${row.FNR_max.toFixed(2)}<br>${row.FNR_min.toFixed(2)}`,
    ];
    var data = [
      {
        x: metrics,
        y: [
          row.SE_min,
          row.SP_min,
          row.PPV_min,
          row.NPV_min,
          row.FPR_min,
          row.FNR_min,
        ],
        name: "Control2",
        marker: {
          color: "rgba(1,1,1,0.0)",
        },
        type: "bar",
      },
      {
        x: metrics,
        y: [
          row.SE_max - row.SE_min,
          row.SP_max - row.SP_min,
          row.PPV_max - row.PPV_min,
          row.NPV_max - row.NPV_min,
          row.FPR_max - row.FPR_min,
          row.FNR_max - row.FNR_min,
        ],
        text: textList,
        name: "Interval",
        type: "bar",
        marker: {
          line: {
            color: "black",
            width: 2,
          },
        },
      },
    ];
    return data;
  }

  PlotHeatmapLabel(row) {
    var xValues = ["True", "False"];

    var yValues = ["True", "False"].reverse();

    var zValues = [
      [row.TP, row.FN],
      [row.FP, row.TN],
    ].reverse();

    var colorscaleValue = [
      [0, "#FFFFFF"],
      [1, "#191970"],
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

  PlotHeatmapLabelLayOut(row) {
    var xValues = ["True", "False"];

    var yValues = ["True", "False"].reverse();

    var zValues = [
      [row.TP, row.FN],
      [row.FP, row.TN],
    ].reverse();

    var SumValues = row.TP + row.FN + row.FP + row.TN;

    var layout = {
      title: `${this.state.LearnLabel.name} ${
        row[this.state.LearnLabel.name]
      }: Se = ${row.SE} Sp = ${row.SP}`,
      annotations: [],
      xaxis: {
        ticks: "",
        side: "top",
      },
      yaxis: {
        ticks: "",
        ticksuffix: " ",
        autosize: true,
      },
    };

    for (var i = 0; i < yValues.length; i++) {
      for (var j = 0; j < xValues.length; j++) {
        var currentValue = zValues[i][j];
        if (currentValue > SumValues * 0.25) {
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
      loadingStat,
      loadingLearn,
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
          {/*Контент*/}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/*Хлебные крошки*/}
            <header className="bg-white px-4 lg:px-6 py-1 dark:bg-gray-800 border-b border-gray-200">
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
                        href=""
                        class="p-2 rounded-lg ml-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                      >
                        AutoML
                      </a>
                    </div>
                  </li>
                </ol>
              </nav>
            </header>
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
                          <div className="flex items-baseline space-x-1">
                            <Tab.List className="flex text-sm font-medium text-center">
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
                      <p className="mt-2 text-xs leading-5 text-gray-600">
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
                              field: "format",
                              sortable: true,
                              enableRowGroup: true,
                              enableValue: true,
                              resizable: true,
                              headerName: "Формат файла",
                            },
                            {
                              field: "size",
                              sortable: true,
                              enableRowGroup: true,
                              enableValue: true,
                              resizable: true,
                              headerName: "Размер(в байтах)",
                            },
                            {
                              field: "upload_date",
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
                    <div>
                      {dataset ? (
                        <>
                          <p className="mt-4">
                            Выбран датасет: {dataset.name}.{dataset.format}
                          </p>
                          <p className="mt-4">Описание: {dataset.info} </p>
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
                            autosize={true}
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
                            <>
                              <button
                                type="button"
                                disabled={loadingStat}
                                className="mt-4 px-3 py-2 text-sm font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={() => this.createStatistic(dataset)}
                              >
                                {loadingStat ? (
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
                                    Вычисление
                                  </>
                                ) : (
                                  "Вычислить статистичекие значения по датасету"
                                )}
                              </button>
                              {loadingStat ? (
                                <div>
                                  <h2 className="mb-2">
                                    Подсчитываем статистические парметры...
                                  </h2>
                                  <p className="mb-2">
                                    Считаем кол-во пропущеных, пустых и
                                    уникальных значений...
                                  </p>
                                  <p className="mb-2">
                                    Считаем данные по каждому столбцу...
                                  </p>
                                  <p className="mb-2">
                                    Вычисляем корреляции между столбцами...
                                  </p>
                                  <p className="mb-2">
                                    Пожайлуста дождитесь ее окончания.
                                  </p>
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <>
                              <div class="w-full bg-gray-50">
                                <div class="relative overflow-hidden">
                                  <div class="flex-row items-center justify-between my-2">
                                    <button
                                      type="button"
                                      disabled={loadingStat}
                                      className="mt-4 px-3 py-2 text-sm font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                      onClick={() =>
                                        this.createStatistic(dataset)
                                      }
                                    >
                                      {loadingStat ? (
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
                                          Вычисление
                                        </>
                                      ) : (
                                        "Обновить"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {loadingStat ? (
                                <div>
                                  <h2 className="mb-2">
                                    Подсчитываем статистические парметры...
                                  </h2>
                                  <p className="mb-2">
                                    Считаем кол-во пропущеных, пустых и
                                    уникальных значений...
                                  </p>
                                  <p className="mb-2">
                                    Считаем данные по каждому столбцу...
                                  </p>
                                  <p className="mb-2">
                                    Вычисляем корреляции между столбцами...
                                  </p>
                                  <p className="mb-2">
                                    Пожайлуста дождитесь ее окончания.
                                  </p>
                                </div>
                              ) : (
                                <iframe
                                  srcdoc={currentElem}
                                  style={{
                                    height: 1000,
                                    width: "100%",
                                  }}
                                ></iframe>
                              )}
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
                            disabled={loadingLearn}
                            class="mt-4 flex items-center justify-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            onClick={() => this.LearnModel(dataset)}
                          >
                            {loadingLearn ? (
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
                                Обучение
                              </>
                            ) : (
                              "Обучить"
                            )}
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {/* Информация об обучении */}
                    {loadingLearn ? (
                      <GetLearnInfo
                        token={token}
                        datasetId={dataset.id}
                        LearnModel={LearnModel.name}
                      />
                    ) : LearnInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* таблица с результатами */}
                        <div className="h-96 col-span-2">
                          {/*
                          <div
                            className="ag-theme-alpine ag-theme-acmecorp"
                            style={{ height: "100%", width: "100%" }}
                          >
                            <AgGridReact
                              rowData={LearnInfo.classification_matrix}
                              columnDefs={[
                                { field: LearnLabel.name, width: 90, minWidth: 50, maxWidth: 150, resizable: true},
                                { field: "accuracy", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "precision", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "recall", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "f1-score", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "SE", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "SP", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "PPV", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "NPV", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "FPR", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "FNR", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "Overall accuracy", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "LR+", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "LR-", width: 90, minWidth: 50, maxWidth: 150 },
                                { field: "DOR", width: 90, minWidth: 50, maxWidth: 150 },
                              ]}
                            ></AgGridReact>
                          </div>
                          */}
                          <div class="relative overflow-x-auto">
                            <table className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr className="table-row">
                                  <th className="table-cell text-left px-6 py-3">
                                    {LearnLabel.name}
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    accuracy
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    precision
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    recall
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    f1-score
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    SE
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    SP
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    PPV
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    NPV
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    FPR
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    FNR
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    Overall accuracy
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    LR+
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    LR-
                                  </th>
                                  <th className="table-cell text-left px-6 py-3">
                                    DOR
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="table-row-group">
                                {LearnInfo.classification_matrix?.map((row) => (
                                  <tr
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    key={row[LearnLabel.name]}
                                  >
                                    <td>{row[`${LearnLabel.name}`]}</td>
                                    <td className="table-cell px-6 py-4">
                                      {row.accuracy}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.precision}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.recall}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row[`f1-score`]}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.SE}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.SP}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.PPV}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.NPV}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.FPR}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.FNR}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row[`Overall accuracy`]}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row[`LR+`]}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row[`LR-`]}
                                    </td>
                                    <td className="table-cell px-6 py-4">
                                      {row.DOR}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
                            style={{ height: "100%", width: "100%" }}
                          />
                        </div>
                        {/* Roc кривая */}
                        <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                          <Plot
                            data={this.PlotRocCurve(LearnInfo.y_scores)}
                            layout={{
                              title: "Roc Curve",
                              autosize: true,
                            }}
                            style={{ height: "100%", width: "100%" }}
                          />
                        </div>
                        {/* Вывод по каждому значению target столбца */}
                        {LearnInfo.classification_matrix?.map((row) => (
                          <>
                            <div className="col-span-2 grid grid-cols-3 gap-4">
                              <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                {/* Метрики */}
                                <Plot
                                  data={this.PlotMetricsLabel(row)}
                                  layout={{
                                    autosize: true,
                                    title: `${this.state.LearnLabel.name} ${
                                      row[this.state.LearnLabel.name]
                                    }: Метрики`,
                                    yaxis: { range: [0, 1] },
                                  }}
                                  style={{ height: "100%", width: "100%" }}
                                />
                              </div>
                              <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                {/* Доверительные интервалы */}
                                <Plot
                                  data={this.PlotIntervalsLabel(row)}
                                  layout={{
                                    title: `${this.state.LearnLabel.name} ${
                                      row[this.state.LearnLabel.name]
                                    }: Интервалы`,
                                    barmode: "stack",
                                    showlegend: false,
                                    autosize: true,
                                    annotations: [],
                                    yaxis: { range: [0, 1] },
                                  }}
                                  style={{ height: "100%", width: "100%" }}
                                />
                              </div>
                              <div className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                {/* Матрица ошибок */}
                                <Plot
                                  data={this.PlotHeatmapLabel(row)}
                                  layout={this.PlotHeatmapLabelLayOut(row)}
                                  style={{ height: "100%", width: "100%" }}
                                />
                              </div>
                            </div>
                          </>
                        ))}
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
