import React, { Component } from 'react';

import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';

import Plot from 'react-plotly.js';

import ReactPaginate from 'react-paginate';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { variables, showDate } from '../Variables.js';
import Sidebar  from "../Sidebar/Sidebar.js";


export class Learning extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: variables.user,
            token: variables.token,
            uploaded_file: variables.uploaded_file,
            default_models: [],
            labels: [],
            LearnModel: null,
            LearnLabel: null,
            loading: false,
            LearnInfo: null,
        }
    }

    RefreshModels() {
        this.setState({ token: variables.token });
        fetch(variables.API_URL+'main/dataset/learner' + `?datasetName=${this.state.uploaded_file}`,
                    {
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Authorization': `Token ${this.state.token}`,
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            default_models: data.models,
                            labels: data.labels
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({ default_models: [], labels: [] });
                    });
      }

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
            })
            .catch((error) => {
                alert('Ошибка')
            })
    }

    componentDidMount() {
        this.RefreshModels();
      }

    // Для выбора и обучения моделей
    changeModel = (e) => {
        this.setState({ LearnModel: e })
    }

    changeLabel = (e) => {
        this.setState({ LearnLabel: e })
    }

    LearnModel() {
        if (!(this.state.LearnModel && this.state.LearnLabel)) {
            alert("Не выбрана модель или поле для обучения");
            return ;
        }
        console.log(this.state.LearnModel);
        fetch(variables.API_URL+'main/dataset/learner' + `?datasetName=${this.state.uploaded_file}`,
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
                        this.setState({LearnInfo : data, loading: true});
                    })
                    .then((result) => {
                        this.RefreshModels();
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
            default_models,
            LearnModel,
            labels,
            LearnLabel,
            LearnInfo,
        } = this.state;

        if (token == "") {
            return <Navigate push to="/" />
        } else {
            return (
                <div>
                    {/* Подгружаем боковую панель */}
                    <div>
                        <Sidebar />
                    </div>

                    {/* Начало основного раздела */}
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
                                        onClick={() => this.LearnModel()}
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
            )
        }
    }
}