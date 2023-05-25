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

import './styles.css';


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
                <div class="e11_446">
                    {/* Начало основного раздела */}
                    <div  class="e11_31932"></div>
                    <div class="e11_31933">
                        <div class="e11_31934">
                            <span  class="e11_31935">Sechenov Machine Learning Change Healthcare</span>
                            <div class="e11_31936">
                                <div  class="e11_31937"></div>
                                <div  class="e11_31938"></div>
                            </div>
                        </div>
                        <div class="e11_31939">
                            <div  class="e11_31940"></div>
                            <span  class="e11_31941">{user != null? user.username: null}</span>
                        </div>
                        <div class="e11_31942">
                            <div class="e11_31943">
                            </div>
                            <div class="e11_31945">
                                <label for="files" class="e11_31946">{uploaded_file? <>{uploaded_file.slice(0, 5)} ... {uploaded_file.slice(-5)}</>: <>Select dataset</>}</label>
                                <input id="files" class="e11_136" type="file" onChange={this.uploadClick}/>
                            </div>
                        </div>
                        <div class="e11_31947_1">
                            <div  class="e11_31948_1"></div>
                            <div class="e11_31949_1">
                                <Link to="/viewer">
                                    <a href="#">
                                        <span  class="e11_31950_1">Go to viewer</span>
                                    </a>
                                </Link>
                            </div>
                        </div>
                        <div class="e11_31947_2">
                            <div  class="e11_31948_2"></div>
                            <div class="e11_31949_2">
                                <Link to="/learning">
                                    <a href="#">
                                        <span  class="e11_31950_2">Learner</span>
                                    </a>
                                </Link>
                            </div>
                        </div>
                        <div class="e11_31947_3">
                            <div  class="e11_31948_3"></div>
                            <div class="e11_31949_3">
                                <Link to="/statistic">
                                    <a href="#">
                                        <span  class="e11_31950_3">Go to statistic</span>
                                    </a>
                                </Link>
                            </div>
                        </div>
                        <div class="e11_31980">
                            <div class="e11_31981"></div>
                            <div class="e11_31982">
                                <div  class="e11_31983"></div>
                                <div  class="e11_31984"></div>
                                <div class="e11_31985">
                                    <div  class="e11_31986"></div>
                                    <div  class="e11_31987"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Начало основного раздела */}

                    <div class="e28_270">
                        <span  class="e28_272">{uploaded_file? "Machine Learning for uploaded dataset": "Before upload dataset"}</span>
                        <div  class="e28_273">
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
                                    <div class="e11_110_1">
                                        <button type="button"
                                            onClick={() => this.LearnModel()}
                                            className="e11_111_1"
                                            >
                                            Обучить
                                        </button>
                                    </div>
                                </div>
                            :null}
                        </div>
                        {LearnInfo?
                            <>
                                <div  class="e28_274">
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
                                    {/*
                                    <div class="e2_695">
                                        <div  class="e2_696"></div>
                                        <div  class="e2_697"></div>
                                        <div class="e2_837">
                                            <div class="e2_838">
                                                <div class="e2_840">
                                                    <div class="e2_841">
                                                        <span  class="ei2_841_2_246">D:</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="e2_1153">
                                                <div class="e2_1154">
                                                    <div class="e2_1155">
                                                        <span  class="ei2_1155_2_246">SE=0.9</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="e2_1424">
                                                <div class="e2_1425">
                                                    <div class="e2_1426">
                                                        <span  class="ei2_1426_2_246">SP=0.03</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="e2_1390">
                                                <div class="e2_1391">
                                                    <div class="e2_1392">
                                                        <span  class="ei2_1392_2_246">PPV=0.95</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="e2_1187">
                                                <div class="e2_1188">
                                                    <div class="e2_1189">
                                                        <span  class="ei2_1189_2_246">NPV=0.95</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ul>
                                    {LearnInfo.classification_matrix.map((label, index) =>
                                        <li key={index}>{label.label}: SE={label.SE} SP={label.SP} PPV={label.PPV} NPV={label.NPV}</li>

                                    )}
                                    </ul>
                                    */}
                                </div>
                                <div  class="e28_275">
                                    <div  class="e28_276">
                                    <Plot
                                        data={
                                        this.PlotHeatmap(LearnInfo.cm_model, LearnInfo.y_onehot)
                                        }
                                        layout={this.PlotLayoutHeatmap(LearnInfo.cm_model, LearnInfo.y_onehot)}
                                      />
                                    </div>
                                    <div  class="e28_277">
                                    <Plot
                                        data={
                                        this.PlotRocCurve(LearnInfo.y_scores)
                                        }
                                        layout={ {width: 629, height: 500, title: 'Roc Curve'} }
                                      />
                                    </div>
                                </div>
                            </>
                        :null}
                    </div>
                </div>

            )
        }
    }
}