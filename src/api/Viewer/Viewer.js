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


import { variables } from "../Variables.js";
import Sidebar  from "../Sidebar/Sidebar.js";

import "./viewer_styles.css";


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

    render() {
        const {
            token,
            user,
            uploaded_file,
            dataset,
            datasetColumns,
            countColumns,
            countRows,
        } = this.state;

        if (token == "") {
            return <Navigate push to="/" />
        } else {
            return (
                <>
                    {/* Страница с датасетом где он выводится в aj-grid и тут его загрузка есть */}
                    <div>
                        {/* Подгружаем боковую панель */}
                        <div>
                            <Sidebar />
                        </div>
                        {/* Основной блок кода с таблицей и загрузкой */}
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

                        </div>
                    </div>
                </>
            )
        }
    }
}