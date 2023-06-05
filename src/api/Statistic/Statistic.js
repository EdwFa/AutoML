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
import Sidebar  from "../Sidebar/Sidebar.js";


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
                <div>
                    {/* Подгружаем боковую панель */}
                    <div>
                        <Sidebar />
                    </div>
                    {/* Начало основного раздела где выводим информацию о столбце */}
                    <div>
                        <span>Dataset Statistic</span>
                                {/* Выбор столбца */}
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
                                {/* Информация о стобце */}
                                <div>
                                        {currentElem !== null?
                                            <div>
                                                {/* название */}
                                                <div>
                                                    <span>{currentElem.column} ({currentElem.type})</span>
                                                </div>
                                                {/* основные данные */}
                                                <div>
                                                            {currentElem.type == 'categorial'?
                                                                <>
                                                                    <table>
                                                                        <tr>
                                                                            <td>Distinct</td>
                                                                            <td>{currentElem.district.length}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Missing</td>
                                                                            <td>{currentElem.count_nan} ({currentElem.persent_nan} %)</td>
                                                                        </tr>
                                                                    </table>
                                                                </>
                                                            :
                                                                <>
                                                                    <table>
                                                                        <tr>
                                                                            <td>Distinct</td>
                                                                            <td>{currentElem.district.length}</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>Missing</td>
                                                                            <td>{currentElem.count_nan} ({currentElem.persent_nan} %)</td>
                                                                        </tr>
                                                                        {moreDetails?
                                                                            <>
                                                                                <tr>
                                                                                    <td>Max</td>
                                                                                    <td>{currentElem.max}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Min</td>
                                                                                    <td>{currentElem.min}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Range</td>
                                                                                    <td>{currentElem.range}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Mean</td>
                                                                                    <td>{currentElem.mean}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>5-th percentile</td>
                                                                                    <td>{currentElem.quantiles[0.05]}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Q1</td>
                                                                                    <td>{currentElem.quantiles[0.25]}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Median</td>
                                                                                    <td>{currentElem.quantiles[0.5]}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Q3</td>
                                                                                    <td>{currentElem.quantiles[0.75]}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>95-th percentile</td>
                                                                                    <td>{currentElem.quantiles[0.95]}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Interquartile range (IQR)</td>
                                                                                    <td>{currentElem.IQR}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Standard deviation</td>
                                                                                    <td>{currentElem.std}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Coefficient of variation (CV)%</td>
                                                                                    <td>{currentElem.CV}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Kurtosis</td>
                                                                                    <td>{currentElem.kurt}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Median Absolute Deviation (MAD)</td>
                                                                                    <td>{currentElem.MAD}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Skewness</td>
                                                                                    <td>{currentElem.skew}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Sum</td>
                                                                                    <td>{currentElem.sum}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Variance</td>
                                                                                    <td>{currentElem.var}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Monotonicity</td>
                                                                                    <td>{currentElem.monotonicy? "Monotonic": "Non monotonic"}</td>
                                                                                </tr>
                                                                            </>
                                                                        :null}
                                                                    </table>
                                                                     <button type="button"
                                                                        onClick={() => this.setState({moreDetails: !this.state.moreDetails})}
                                                                     >{moreDetails? "Hide details" : "More details"}
                                                                    </button>
                                                                </>
                                                            }
                                                </div>

                                                {/* График распределения */}
                                                <div>
                                                    <Plot
                                                        data={
                                                            GetHistogramData(currentElem.data)
                                                        }
                                                        layout={
                                                            GetHistogramLayout(currentElem.column)
                                                        }
                                                    />
                                                </div>

                                                {/* Частота и кол-во встречаемый значений */}
                                                <div className="ag-theme-alpine" style={{height: 600, width: "100%"}}>
                                                   <AgGridReact
                                                       rowData={currentElem.district_appear}
                                                       columnDefs={[
                                                         {field: 'value', sortable: true},
                                                         {field: 'count', sortable: true},
                                                         {field: 'percent', sortable: true}
                                                       ]}>
                                                   </AgGridReact>
                                                </div>
                                            </div>
                                        :null}
                                </div>
                    </div>
                </div>
            )
        }
    }
}