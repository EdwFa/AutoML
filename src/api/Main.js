import React, { Component, useState, useEffect } from 'react';

import { Navigate, Link } from 'react-router-dom';

import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';

import ReactPaginate from 'react-paginate';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import Plot from 'react-plotly.js';

import { variables, GetDatasetParams, showDate } from "./Variables.js";
import { PlotGrafic } from './Grafics/InfoGrafics.js';



const AllowedGrafics = [
    {id: 0, name: 'scatter'},
    {id: 1, name: 'histogram'},
]


export class Main extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // user data
            user: variables.user,
            token: variables.token,

            // dataset
            uploaded_file: variables.uploaded_file,
            dataset: [],
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
            loading: false,
            LearnInfo: null,
        }
    }

    // Загрузка датасета

    uploadClick=(e)=> {
        e.preventDefault();
        let format = e.target.files[0].name.split('.').slice(-1)[0]
        console.log(format)
        if (format != 'csv' && format != 'xlsx') {
            alert('Загрузите пожайлуста файлы формата ".csv" или ".xlsx"')
            return;
        }
        const formData=new FormData();
        formData.append("file",e.target.files[0],e.target.files[0].name);

        fetch(variables.API_URL+'main/datasets/upload',{
            headers: {
                        'Authorization': `Token ${this.state.token}`,
                    },
            method:'POST',
            body: formData
        })
            .then((res) => {
                if (res.status == 201) { return res.json() }
                else { throw Error(res.statusText) }
            })
            .then(data=>{
                console.log(data);
                this.setState({uploaded_file:data.name});
                variables.uploaded_file = data.name;
                this.LoadDataset(data.name);
                this.LoadStatistic(data.name)
                this.RefreshModels(data.name)
            })
            .catch((error) => {
                alert('Ошибка')
            })
    }

    // Подгрзка датасета с сервера и его визуализация
    GetDatasets() {
        return ;
    }

    LoadDataset(dataset) {
        let datasetParams = GetDatasetParams(dataset);
        if (datasetParams === null) {
            return ;
        };

        fetch(variables.API_URL+'main/dataset/viewer' + `?datasetName=${datasetParams[0]}&datasetType=${datasetParams[1]}`,
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Authorization': `Token ${this.state.token}`,
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            dataset: data.dataset, datasetColumns: data.columns,
                            countRows: data.count_rows, countColumns: data.count_columns
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({ dataset: [], datasetColumns: [] });
                    });
      }

    componentDidMount() {
        this.GetDatasets();
    }

    // Работа с визализацией данных(графики)

    changeGrafic = (e) => {
        this.setState({ choicedGrafic: e })
    }

    changeX = (e) => {
        this.setState({ x_label: e })
        this.setState({x_data: this.state.dataset.map(el => el[e.field])})
    }

    changeY = (e) => {
        this.setState({ y_label: e })
        this.setState({y_data: this.state.dataset.map(el => el[e.field])})
    }

    changeGroup = (e) => {
        this.setState({ group_label: e })
        this.setState({group_data: this.state.dataset.map(el => el[e.field])})
    }

    resetGrafic() {
        this.setState({
            choicedGrafic: null,
            x_label: null,
            x_data: [],
            y_label: null,
            y_data: [],
            group_label: null,
            group_data: [],
        })
    }

    // Статистика датасета
    LoadStatistic(dataset) {
        let datasetParams = GetDatasetParams(dataset);
        if (datasetParams === null) {
            return ;
        };

        fetch(variables.API_URL+'main/dataset/statistic' + `?datasetName=${datasetParams[0]}&datasetType=${datasetParams[1]}`,
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Authorization': `Token ${this.state.token}`,
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            info: data.data,
                            currentElem: data.data
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({ info: [] });
                    });
      }

    createStatistic(dataset) {
        let datasetParams = GetDatasetParams(dataset);
        if (datasetParams === null) {
            return ;
        };

        fetch(variables.API_URL+'main/statistic/upload' + `?datasetName=${datasetParams[0]}&datasetType=${datasetParams[1]}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Authorization': `Token ${this.state.token}`,
                        },
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json()
                        }
                        throw Error('Ошибка при создании статистических данных')
                    })
                    .then(data => {
                        this.LoadDataset(dataset)
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({ info: [] });
                    });
    }

    // Работа с обучением моделей под датасет
    RefreshModels(dataset) {
        let datasetParams = GetDatasetParams(dataset);
        if (datasetParams === null) {
            return ;
        };
        fetch(variables.API_URL + 'main/dataset/models' + `?datasetName=${datasetParams[0]}&datasetType=${datasetParams[1]}`,
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Authorization': `Token ${this.state.token}`,
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            default_models: data.models?.map((model) => ({'id': model, 'name': model})),
                            labels: data.labels
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({ default_models: [], labels: [] });
                    });
      }

    changeModel = (e) => {
        this.setState({ LearnModel: e })
    }

    changeLabel = (e) => {
        this.setState({ LearnLabel: e })
    }

    LearnModel(dataset) {
        if (!(this.state.LearnModel && this.state.LearnLabel)) {
            alert("Не выбрана модель или поле для обучения");
            return ;
        }
        let datasetParams = GetDatasetParams(dataset);
        if (datasetParams === null) {
            return ;
        };

        fetch(variables.API_URL+'main/dataset/learner' + `?datasetName=${datasetParams[0]}&datasetType=${datasetParams[1]}`,
                    {
                        method:'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Authorization': `Token ${this.state.token}`,
                        },
                        body: JSON.stringify({
                            model: this.state.LearnModel,
                            target: this.state.LearnLabel.name
                        })
                    })
                    .then((res) => {
                        if (res.status == 201) { return res.json() }
                        else { throw Error(res.statusText) }
                    })
                    .then(data=>{
                        console.log(data)
                        this.setState({LearnInfo : data, loading: true});
                    })
                    .catch((error) => {
                        alert('Ошибка')
                    })
    }


    PlotRocCurve(y_scores) {
        var data = [];
        for (const result of y_scores) {
          var trace = {
              type: 'scatter',
              y: result[0],
              x: result[1],
              name: result[2],
            };
          data.push(trace);
        };
        return data
      }

    PlotHeatmap(cm_model, labels) {
        var xValues = labels;

        var yValues = labels;

        var zValues = cm_model;

        var colorscaleValue = [
          [0, '#3D9970'],
          [1, '#001f3f']
        ];

        var data = [{
          x: xValues,
          y: yValues,
          z: zValues,
          type: 'heatmap',
          colorscale: colorscaleValue,
          showscale: false
        }];
        return data
      }

    PlotLayoutHeatmap(cm_model, labels) {

        var xValues = labels;

        var yValues = labels;

        var zValues = cm_model;

        var layout = {
          title: 'Heatmap',
          width: 629,
          height: 500,
          annotations: [],
          xaxis: {
            ticks: '',
            side: 'top'
          },
          yaxis: {
            ticks: '',
            ticksuffix: ' ',
            autosize: false
          }
        };

        for ( var i = 0; i < yValues.length; i++ ) {
          for ( var j = 0; j < xValues.length; j++ ) {
            var currentValue = zValues[i][j];
            if (currentValue != 0.0) {
              var textColor = 'white';
            }else{
              var textColor = 'black';
            }
            var result = {
              xref: 'x1',
              yref: 'y1',
              x: xValues[j],
              y: yValues[i],
              text: zValues[i][j],
              font: {
                family: 'Arial',
                size: 12,
                color: 'rgb(171, 78, 50)'
              },
              showarrow: false,
              font: {
                color: textColor
              }
            };
            layout.annotations.push(result);
          }
        }
        return layout
      }

    render() {
        const {
            token,
            user,
            uploaded_file,
            dataset,
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
            LearnLabel,
            LearnInfo,

        } = this.state;

        if (token == "") {
            return <Navigate push to="/login" />
        } else {
            return (
                <>
                    {/* Страница с датасетом где он выводится в aj-grid и тут его загрузка есть */}
                    <div>
                        <div>
                            {/* загрузка файла */}
                            <div>
                                <p>Dataset loading</p>
                                  <h4><b>Drug and drop file here</b></h4>
                                  <label for="files">{uploaded_file? <>{uploaded_file.slice(0, 5)} ... {uploaded_file.slice(-5)}</>:<>Browse file</>}</label>
                                  <input id="files" class="e11_136" type="file" onChange={this.uploadClick}/>
                            </div>
                            {/* Отображаем файл в виде таблицы */}
                            <div>
                                {uploaded_file?
                                <>
                                    <div className="ag-theme-alpine" style={{height: 600, width: "100%"}}>
                                       <AgGridReact
                                        columnDefs={datasetColumns}
                                        rowData={dataset}
                                       ></AgGridReact>
                                    </div>
                                   {/* общая информация о датасете */}
                                   <p>Count rows = {countRows}</p>
                                   <p>Count columns = {countColumns}</p>
                                </>
                                :null}
                            </div>
                            {/* Графики для датасета */}
                            <div>
                                <span>Dataset grafics</span>
                                {/* Выбор графика и осей */}
                                <div>
                                    <label>Grafic</label>
                                    <Select
                                        className='basic-single'
                                        classNamePrefix='select'
                                        options={AllowedGrafics}
                                        getOptionLabel={(option) => `${option['name']}`}
                                        getOptionValue={(option) => `${option['id']}`}
                                        value={choicedGrafic}
                                        noOptionsMessage={() => "Пусто"}
                                        onChange={this.changeGrafic}
                                        placeholder="Выберите график"
                                    />
                                    <label>X label</label>
                                    <Select
                                        className='basic-single'
                                        classNamePrefix='select'
                                        options={datasetColumns}
                                        getOptionLabel={(option) => `${option['field']}`}
                                        getOptionValue={(option) => `${option['field']}`}
                                        value={x_label}
                                        noOptionsMessage={() => "Пусто"}
                                        onChange={this.changeX}
                                        placeholder="Выберите X"
                                    />
                                    {choicedGrafic?
                                        choicedGrafic.name === 'histogram'?
                                        null
                                        :
                                            <>
                                            <label>Y label</label>
                                            <Select
                                                className='basic-single'
                                                classNamePrefix='select'
                                                options={datasetColumns}
                                                getOptionLabel={(option) => `${option['field']}`}
                                                getOptionValue={(option) => `${option['field']}`}
                                                value={y_label}
                                                noOptionsMessage={() => "Пусто"}
                                                onChange={this.changeY}
                                                placeholder="Выберите Y"
                                            />
                                            </>
                                    :null}
                                    <label>Group label</label>
                                    <Select
                                        className='basic-single'
                                        classNamePrefix='select'
                                        options={datasetColumns}
                                        getOptionLabel={(option) => `${option['field']}`}
                                        getOptionValue={(option) => `${option['field']}`}
                                        value={group_label}
                                        noOptionsMessage={() => "Пусто"}
                                        onChange={this.changeGroup}
                                        placeholder="Выберите Y"
                                    />
                                    <button type="button"
                                        onClick={() => this.resetGrafic()}>
                                        Очистить
                                    </button>

                                </div>
                                {/* Отрисовка графика */}
                                <div>
                                    <PlotGrafic
                                        graffic={choicedGrafic}
                                        x_label={x_label? x_label.field: null}
                                        y_label={y_label? y_label.field: null}
                                        group_label={group_data}
                                        x_data={x_data}
                                        y_data={y_data}
                                    />
                                </div>
                            </div>
                            {/* Статистика для датасета */}
                            <div>
                                {currentElem === null?
                                    <button type="button"
                                                onClick={() => this.createStatistic(uploaded_file)}
                                            >
                                                Создать
                                            </button>
                                :
                                    <iframe srcdoc={currentElem} style={{height: 1000, width: "100%"}}></iframe>
                                }

                            </div>
                            {/* Обучение моделей */}
                            <div>
                                {/* Выбор для обучения */}
                                {uploaded_file?
                                    <div>
                                        <label>Доступные модели</label>
                                        <Select
                                            className='basic-single'
                                            classNamePrefix='select'
                                            options={default_models}
                                            getOptionLabel={(option) => `${option['name']}`}
                                            getOptionValue={(option) => `${option['id']}`}
                                            value={LearnModel}
                                            noOptionsMessage={() => "Пусто"}
                                            onChange={this.changeModel}
                                            placeholder="Выберите модель для обучения"
                                            isSearchable
                                            isClearable
                                        />
                                        <label>Поле для обучения</label>
                                        <Select
                                            className='basic-single'
                                            classNamePrefix='select'
                                            options={labels}
                                            getOptionLabel={(option) => `${option['name']}`}
                                            getOptionValue={(option) => `${option['id']}`}
                                            value={LearnLabel}
                                            noOptionsMessage={() => "Пусто"}
                                            onChange={this.changeLabel}
                                            placeholder="Выберите поле для обучения"
                                            isSearchable
                                            isClearable
                                        />
                                        <div>
                                            <button type="button"
                                                onClick={() => this.LearnModel(uploaded_file)}
                                            >
                                                Обучить
                                            </button>
                                        </div>
                                    </div>
                                :null}
                                {/* Информация об обучении */}
                                {LearnInfo?
                                    <div>
                                        {/* таблица с результатами */}
                                        <div className="ag-theme-alpine" style={{height: "100%", width: "100%"}}>
                                            <AgGridReact
                                                rowData={LearnInfo.classification_matrix}
                                                columnDefs={[
                                                    {field: 'label'},
                                                    {field: 'SE'},
                                                    {field: 'SP'},
                                                    {field: 'PPV'},
                                                    {field: 'NPV'},
                                                ]}>
                                            </AgGridReact>
                                        </div>
                                        {/* Графики обучения */}
                                        <div>
                                            {/* график правилных результатов */}
                                            <div>
                                                <Plot
                                                    data={
                                                    this.PlotHeatmap(LearnInfo.cm_model, LearnInfo.y_onehot)
                                                    }
                                                    layout={this.PlotLayoutHeatmap(LearnInfo.cm_model, LearnInfo.y_onehot)}
                                                  />
                                            </div>
                                            {/* Roc кривая */}
                                            <div>
                                                <Plot
                                                    data={
                                                    this.PlotRocCurve(LearnInfo.y_scores)
                                                    }
                                                    layout={ {width: 629, height: 500, title: 'Roc Curve'} }
                                                  />
                                            </div>
                                        </div>
                                    </div>
                                :null}
                            </div>
                        </div>
                    </div>
                </>
            )
        }
    }
}