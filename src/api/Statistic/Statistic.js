import React, { Component } from 'react';

import { Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';

import ReactPaginate from 'react-paginate';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import Plot from 'react-plotly.js';

import { variables, showDate } from '../Variables.js';

import './styles.css';


function GetHistogramData(x_data) {

    var trace1 = [
//    {
//      histnorm: "percent",
//      x: x_data,
//      mode: 'markers',
//      type: 'histogram',
//      name: 'Percents',
//
//      marker: { size: 8 },
//    },
    {
      x: x_data,
      mode: 'markers',
      type: 'histogram',
      name: 'Count',

      marker: { size: 8 },
    }
    ];

    var data = trace1

    return data;
}

function GetHistogramLayout(x_label) {
    console.log(x_label)
    var layout = {

      title:x_label,
      width:476,
	  height:476,
    };

    return layout;
}

export class Statistic extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: variables.user,
            token: variables.token,
            uploaded_file: variables.uploaded_file,
            info: [],
            elemPerPage: 0,
            currentElem: null,
            moreDetails: false,
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
            })
            .catch((error) => {
                alert('Ошибка')
            })
    }

    // Подгрзка датасета с сервера и его визуализация

    LoadDataset(datasetName) {
        if (datasetName == null) {
            return ;
        }
        fetch(variables.API_URL+'main/dataset/statistic' + `?datasetName=${datasetName}`,
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
                            currentElem: data.data[0]
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({ info: [] });
                    });
      }

    componentDidMount() {
        this.LoadDataset(this.state.uploaded_file);
      }


    handleElem(move_dir) {
        if (this.state.info.length == 0) {
            return
        }

        var nextElem = this.state.elemPerPage;
        if (move_dir == 1) {
            if (nextElem == this.state.info.length - 1)
                nextElem = 0;
            else
                nextElem += 1;
        } else {
            if (nextElem == 0)
                nextElem = this.state.info.length - 1;
            else
                nextElem -= 1;
        }
        this.setState({ elemPerPage: nextElem, moreDetails: false, currentElem: this.state.info[nextElem]});
      }
    selectColumn = (e) => {
        this.setState({ currentElem: e })
    }

    render() {
        const {
            token,
            user,
            uploaded_file,
            info,
            elemPerPage,
            currentElem,
            moreDetails

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
                                        <span  class="e11_31950_2">Go to learner</span>
                                    </a>
                                </Link>
                            </div>
                        </div>
                        <div class="e11_31947_3">
                            <div  class="e11_31948_3"></div>
                            <div class="e11_31949_3">
                                <Link to="/statistic">
                                    <a href="#">
                                        <span  class="e11_31950_3">Statistic</span>
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

                    <div class="e11_31963_1">
                        <div class="e13_440">
                            <div class="e13_441">
                                <div class="e13_442">
                                    <span  class="e13_443">Dataset Statistic</span>
                                    <div  class="e28_281"></div>
                                    <Select
                                            className='basic-single'
                                            classNamePrefix='select'
                                            options={info}
                                            getOptionLabel={(option) => `${option['column']}`}
                                            getOptionValue={(option) => `${option['column']}`}
                                            value={currentElem}
                                            noOptionsMessage={() => "Пусто"}
                                            onChange={this.selectColumn}
                                            placeholder="Выберите cтолбец датасета"
                                            isSearchable
                                            isClearable
                                        />
                                </div>
                                <div class="e13_448">
                                    <div class="e13_449">
                                        <div class="e13_450">
                                            <div class="e13_451_1">
                                                {currentElem !== null?
                                                    <>
                                                        <div class="e13_452_1">
                                                            <div class="e3_1135">
                                                                <div class="e3_1136">
                                                                    <div class="e3_1137">
                                                                        <span  class="ei3_1137_2_118">{currentElem.column} ({currentElem.type})</span>
                                                                    </div>
                                                                    {moreDetails?
                                                                        currentElem.type == 'categorial'?
                                                                        <div class="e3_1138">
                                                                            <div class="e3_1139">
                                                                                <span  class="ei3_1139_2_246">Distinct:</span>
                                                                            </div>
                                                                            <div class="e3_1140">
                                                                                <span  class="ei3_1140_2_246">Missing:</span>
                                                                            </div>
                                                                            <div class="e3_1141_1">
                                                                                <button type="button"
                                                                                    onClick={() => this.setState({moreDetails: !this.state.moreDetails})}
                                                                                    class="ei3_1477_2_246_1">
                                                                                    {moreDetails? "Hide details" : "More details"}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        :
                                                                        <div class="e3_1138">
                                                                            <div class="e3_1139">
                                                                                <span  class="ei3_1139_2_246">Distinct:</span>
                                                                            </div>
                                                                            <div class="e3_1140">
                                                                                <span  class="ei3_1140_2_246">Missing:</span>
                                                                            </div>
                                                                            <div class="e3_1141">
                                                                                <span  class="ei3_1141_2_246">Max:</span>
                                                                            </div>
                                                                            <div class="e3_1481">
                                                                                <span  class="ei3_1481_2_246">Min:</span>
                                                                            </div>
                                                                            <div class="e3_1142">
                                                                                <span  class="ei3_1142_2_246">Range:</span>
                                                                            </div>
                                                                            <div class="e3_1143">
                                                                                <span  class="ei3_1143_2_246">Mean:</span>
                                                                            </div>
                                                                            <div class="e3_1144">
                                                                                <span  class="ei3_1144_2_246">5-th percentile:</span>
                                                                            </div>
                                                                            <div class="e3_1145">
                                                                                <span  class="ei3_1145_2_246">Q1:</span>
                                                                            </div>
                                                                            <div class="e3_1146">
                                                                                <span  class="ei3_1146_2_246">Median:</span>
                                                                            </div>
                                                                            <div class="e3_1147">
                                                                                <span  class="ei3_1147_2_246">Q3: </span>
                                                                            </div>
                                                                            <div class="e3_1148">
                                                                                <span  class="ei3_1148_2_246">95-th percentile: </span>
                                                                            </div>
                                                                            <div class="e3_1149">
                                                                                <span  class="ei3_1149_2_246">Interquartile range (IQR):</span>
                                                                            </div>
                                                                            <div class="e3_1150">
                                                                                <span  class="ei3_1150_2_246">Standard deviation: </span>
                                                                            </div>
                                                                            <div class="e3_1151">
                                                                                <span  class="ei3_1151_2_246">Coefficient of variation (CV)%</span>
                                                                            </div>
                                                                            <div class="e3_1152">
                                                                                <span  class="ei3_1152_2_246">Kurtosis: </span>
                                                                            </div>
                                                                            <div class="e3_1153">
                                                                                <span  class="ei3_1153_2_246">Median Absolute Deviation (MAD): </span>
                                                                            </div>
                                                                            <div class="e3_1154">
                                                                                <span  class="ei3_1154_2_246">Skewness:</span>
                                                                            </div>
                                                                            <div class="e3_1501">
                                                                                <span  class="ei3_1501_2_246">Sum: </span>
                                                                            </div>
                                                                            <div class="e3_1475">
                                                                                <span  class="ei3_1475_2_246">Variance:</span>
                                                                            </div>
                                                                            <div class="e3_1477">
                                                                                <span  class="ei3_1477_2_246">Monotonicity:</span>
                                                                            </div>
                                                                            <div class="e3_1477_1">
                                                                                <button type="button"
                                                                                    onClick={() => this.setState({moreDetails: !this.state.moreDetails})}
                                                                                    class="ei3_1477_2_246_1">
                                                                                    {moreDetails? "Hide details" : "More details"}
                                                                                </button>
                                                                            </div>
                                                                            {/*
                                                                                <ul>
                                                                                    <li>Max: {currentElem.max}</li>
                                                                                    <li>Min: {currentElem.min}</li>
                                                                                    <li>Range: {currentElem.range}</li>
                                                                                    <li>Mean: {currentElem.mean}</li>
                                                                                    <li>5-th percentile: {currentElem.quantiles[0.05]}</li>
                                                                                    <li>Q1: {currentElem.quantiles[0.25]}</li>
                                                                                    <li>Median: {currentElem.median}</li>
                                                                                    <li>Q3: {currentElem.quantiles[0.75]}</li>

                                                                                    <li>95-th percentile: {currentElem.quantiles[0.95]}</li>
                                                                                    <li>Interquartile range (IQR): {currentElem.IQR}</li>
                                                                                    <li>Standard deviation: {currentElem.std}</li>
                                                                                    <li>Coefficient of variation (CV): {currentElem.CV}</li>
                                                                                    <li>Kurtosis: {currentElem.kurt}</li>
                                                                                    <li>Median Absolute Deviation (MAD): {currentElem.MAD}</li>
                                                                                    <li>Skewness: {currentElem.skew}</li>
                                                                                    <li>Sum: {currentElem.sum}</li>
                                                                                    <li>Variance: {currentElem.var}</li>
                                                                                    <li>Monotonicity: {currentElem.monotonicy? "Monotonic": "Non monotonic"}</li>
                                                                                </ul>
                                                                            */}
                                                                        </div>
                                                                    :
                                                                    <>
                                                                        <div class="e3_1138">
                                                                            <div class="e3_1139">
                                                                                <span  class="ei3_1139_2_246">Distinct:</span>
                                                                            </div>
                                                                            <div class="e3_1140">
                                                                                <span  class="ei3_1140_2_246">Missing:</span>
                                                                            </div>
                                                                            <div class="e3_1141_1">
                                                                                <button type="button"
                                                                                    onClick={() => this.setState({moreDetails: !this.state.moreDetails})}
                                                                                    class="ei3_1477_2_246_1">
                                                                                    {moreDetails? "Hide details" : "More details"}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                    }
                                                                </div>
                                                                {moreDetails?
                                                                    currentElem.type == 'categorial'?
                                                                     <div class="e3_1439">
                                                                        <div class="e3_1441">
                                                                            <div class="e3_1442">
                                                                                <span  class="ei3_1442_2_246">{currentElem.district.length}</span>
                                                                            </div>
                                                                            <div class="e3_1443">
                                                                                <span  class="ei3_1443_2_246">{currentElem.count_nan} ({currentElem.persent_nan} %)</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                   :
                                                                    <div class="e3_1439">
                                                                        <div class="e3_1441">
                                                                            <div class="e3_1442">
                                                                                <span  class="ei3_1442_2_246">{currentElem.district.length}</span>
                                                                            </div>
                                                                            <div class="e3_1443">
                                                                                <span  class="ei3_1443_2_246">{currentElem.count_nan} ({currentElem.persent_nan} %)</span>
                                                                            </div>
                                                                            <div class="e3_1444">
                                                                                <span  class="ei3_1444_2_246">{currentElem.max}</span>
                                                                            </div>
                                                                            <div class="e3_1445">
                                                                                <span  class="ei3_1445_2_246">{currentElem.min}</span>
                                                                            </div>
                                                                            <div class="e3_1446">
                                                                                <span  class="ei3_1446_2_246">{currentElem.range}</span>
                                                                            </div>
                                                                            <div class="e3_1447">
                                                                                <span  class="ei3_1447_2_246">{currentElem.mean}</span>
                                                                            </div>
                                                                            <div class="e3_1448">
                                                                                <span  class="ei3_1448_2_246">{currentElem.quantiles[0.05]}</span>
                                                                            </div>
                                                                            <div class="e3_1449">
                                                                                <span  class="ei3_1449_2_246">{currentElem.quantiles[0.25]}</span>
                                                                            </div>
                                                                            <div class="e3_1450">
                                                                                <span  class="ei3_1450_2_246">{currentElem.median}</span>
                                                                            </div>
                                                                            <div class="e3_1451">
                                                                                <span  class="ei3_1451_2_246">{currentElem.quantiles[0.75]}</span>
                                                                            </div>
                                                                            <div class="e3_1452">
                                                                                <span  class="ei3_1452_2_246">{currentElem.quantiles[0.95]}</span>
                                                                            </div>
                                                                            <div class="e3_1453">
                                                                                <span  class="ei3_1453_2_246">{currentElem.IQR}</span>
                                                                            </div>
                                                                            <div class="e3_1454">
                                                                                <span  class="ei3_1454_2_246">{currentElem.std}</span>
                                                                            </div>
                                                                            <div class="e3_1455">
                                                                                <span  class="ei3_1455_2_246">{currentElem.CV}</span>
                                                                            </div>
                                                                            <div class="e3_1456">
                                                                                <span  class="ei3_1456_2_246">{currentElem.kurt}</span>
                                                                            </div>
                                                                            <div class="e3_1457">
                                                                                <span  class="ei3_1457_2_246">{currentElem.MAD}</span>
                                                                            </div>
                                                                            <div class="e3_1483">
                                                                                <span  class="ei3_1483_2_246">{currentElem.skew}</span>
                                                                            </div>
                                                                            <div class="e3_1485">
                                                                                <span  class="ei3_1485_2_246">{currentElem.sum}</span>
                                                                            </div>
                                                                            <div class="e3_1489">
                                                                                <span  class="ei3_1489_2_246">{currentElem.var}</span>
                                                                            </div>
                                                                            <div class="e3_1495">
                                                                                <span  class="ei3_1495_2_246">{currentElem.monotonicy? "Monotonic": "Non monotonic"}</span>
                                                                            </div>
                                                                    </div>
                                                                 </div>
                                                                :
                                                                    <div class="e3_1439">
                                                                        <div class="e3_1441">
                                                                            <div class="e3_1442">
                                                                                <span  class="ei3_1442_2_246">{currentElem.district.length}</span>
                                                                            </div>
                                                                            <div class="e3_1443">
                                                                                <span  class="ei3_1443_2_246">{currentElem.count_nan} ({currentElem.persent_nan} %)</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                }

                                                            </div>
                                                        </div>
                                                        <div class="e13_453_1">
                                                            {currentElem.type === 'categorial'?
                                                                <Plot
                                                                    data={
                                                                        GetHistogramData(currentElem.data)
                                                                    }
                                                                    layout={
                                                                        GetHistogramLayout(currentElem.column)
                                                                    }
                                                                />
                                                            :
                                                                <Plot
                                                                    data={
                                                                        GetHistogramData(currentElem.data)
                                                                    }
                                                                    layout={
                                                                        GetHistogramLayout(currentElem.column)
                                                                    }
                                                                />
                                                            }
                                                        </div>

                                                    </>
                                                :null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span  class="e13_811">Dataset statistic</span>
                    </div>

                </div>

            )
        }
    }
}