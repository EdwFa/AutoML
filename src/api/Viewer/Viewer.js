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

import { variables, showDate } from '../Variables.js';

import './styles.css';

import { PlotGrafic } from '../Grafics/InfoGrafics.js';


const AllowedGrafics = [
    {id: 0, name: 'scatter'},
    {id: 1, name: 'histogram'},
]


export class Viewer extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: variables.user,
            token: variables.token,
            uploaded_file: variables.uploaded_file,
            dataset: [],
            datasetColumns: [],

            choicedGrafic: null,
            x_label: null,
            x_data: [],
            y_label: null,
            y_data: [],
            group_label: null,
            group_data: [],
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
        fetch(variables.API_URL+'main/dataset/viewer' + `?datasetName=${datasetName}`,
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
        this.LoadDataset(this.state.uploaded_file);
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


    render() {
        const {
            token,
            user,
            uploaded_file,
            dataset,
            datasetColumns,

            allowed_grafics,
            choicedGrafic,
            x_label,
            y_label,
            x_data,
            y_data,
            group_label,
            group_data,

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
                                        <span  class="e11_31950_1">Viewer</span>
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

                    <div class="e11_31963">
                        <div class="e13_440">
                            <div class="e13_441">
                                <div class="e13_442">
                                    <span  class="e13_443">Uploaded dataset</span>
                                    <div  class="e28_281"></div>
                                </div>
                                <div class="e13_448">
                                    <div class="e13_449">
                                        <div class="e13_450">
                                            <div class="e13_451">
                                                <div className="ag-theme-alpine" style={{height: "100%", width: "100%"}}>
                                                   <AgGridReact
                                                        rowData={dataset}
                                                        columnDefs={datasetColumns}>
                                                    </AgGridReact>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span  class="e13_811">Dataset loading</span>
                    </div>
                    <div class="e11_31966">
                        <span  class="e15_64029">Dataset grafics</span>
                        <div  class="e28_377">
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


                </div>

            )
        }
    }
}