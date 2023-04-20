import React, { Component } from 'react';

import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { variables, showDate } from './Variables.js';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';
import SearchModalBtn from "../components/SearchModalBtn";
import ReactPaginate from 'react-paginate';
import {DetailDataset} from './DetailDataset.js'


export class Datasets extends Component {

    constructor(props) {
        super(props);

        this.state = {
            datasets: [], // Полученный список всех эпикризов
            dataCount: 0,
            token: variables.token,
            dataPerPage: 1,
            dataOffset: 0,
            dataFile: {},
            DatasetId: 0,
        }
    }

    refreshList() {
        // Перезапускаем get наших списков
        this.setState({ token: variables.token });
        if (this.state.token != "") {
            fetch(variables.API_URL + 'main/datasets',
                {
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        'Authorization': `Token ${this.state.token}`,
                    },
                })
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        datasets: data.datasets, dataCount: data.count,
                    });
                    variables.epicCount = this.state.epicCount
                })
                .catch(error => {
                    console.log(error);
                    this.setState({ datasets: [], dataCount: 0 });
                });
        }
    }

    componentDidMount() {
        this.refreshList();
    }

    addClick() {
        this.setState({
            dataFile: {},
        });
        console.log(this.state);
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
                this.setState({dataFile:data});
            })
            .then((result) => {
                this.refreshList();
            })
            .catch((error) => {
                alert('Ошибка')
            })
    }

    // Ф-и для получения информации о эпикризе
    DetailClick(dId) {
        this.setState({
            DatasetId: dId
        })
    }

    pageCount() {
        return Math.ceil(this.state.datasets.length / this.state.dataPerPage);
    }

    // Invoke when user click to request another page.
    handlePageClick = (event) => {
        const newOffset = (event.selected * this.state.dataPerPage) % this.state.datasets.length;
        console.log(
            `User requested page number ${event.selected}, which is offset ${newOffset}`
        );
        this.setState({ dataOffset: newOffset });
    };

    handleEpics() {
        const endOffset = this.state.dataOffset + this.state.dataPerPage;
        return this.state.datasets.slice(this.state.dataOffset, endOffset);
    }

    render() {
        const {
            datasets,
            dataCount,
            token,
            inputRef,
            dataFile,
            DatasetId
        } = this.state;

        if (token == "") {
            return <Navigate push to="/" />
        } else {
            return (
                <div className="rounded-lg bg-slate-50 p-4 shadow dark:bg-gray-800 sm:p-6 xl:p-8">
                    <div class="flex flex-wrap justify-between items-center dark:border-gray-600 mb-4">
                        <h2 class="flex text-lg font-semibold text-gray-900 dark:text-white">
                            Датасеты
                        </h2>
                        <div className='flex items-end'>

                            <button type="button"
                                className="flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 float-end"
                                data-bs-toggle="modal"
                                data-bs-target="#datasetModal"
                                onClick={() => this.addClick()}>
                                Загрузить датасет
                            </button>
                        </div>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className="mb-3 w-full text-sm text-left text-gray-500 dark:text-gray-400 shadow-md sm:rounded-lg">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Название
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Формат
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Размер
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Пользователь-обладатель
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Дата загрузки
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.handleEpics()?.map(dataset =>
                                        <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600' key={dataset.id} onClick={() => this.DetailClick(dataset.id)}>
                                            <td className="px-6 py-4" >{dataset.name}</td>
                                            <td className="px-6 py-4" >{dataset.format}</td>
                                            <td className="px-6 py-4" >{dataset.size}</td>
                                            <td className="px-6 py-4" >{dataset.user.username}</td>
                                            <td className="px-6 py-4" >{showDate(dataset.upload_date)}</td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex flex-wrap justify-between items-center dark:border-gray-600 my-6">
                        <nav class="flex">
                            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Всего датасетов: <span class="font-semibold text-gray-900 dark:text-white">{datasets.length}</span></span>
                        </nav>
                        <div className='flex items-end'>
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel=">>"
                                onPageChange={this.handlePageClick}
                                pageRangeDisplayed={5}
                                pageCount={this.pageCount()}
                                previousLabel="<<"
                                renderOnZeroPageCount={null}
                                pageLinkClassName="px-3 py-2 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 active:bg-blue-50 active:text-blue-600 focus:bg-blue-50 focus:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:active:bg-gray-700 dark:focus:bg-gray-700 dark:active:text-blue-600 dark:focus:text-blue-600"
                                previousLinkClassName="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 active:bg-blue-50 active:text-blue-600 focus:bg-blue-50 focus:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:active:text-blue-600 dark:focus:text-blue-600"
                                nextLinkClassName="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 active:bg-blue-50 active:text-blue-600 focus:bg-blue-50 focus:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:active:text-blue-600 dark:focus:text-blue-600"
                                breakLinkClassName="px-3 py-2 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 active:bg-blue-50 active:text-blue-600 focus:bg-blue-50 focus:text-blue-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:active:text-blue-600 dark:focus:text-blue-600"
                                className="inline-flex -space-x-px"
                                activeLinkClassName="!bg-blue-50 !text-blue-600"
                            />
                        </div>
                    </div>
                    <div className="modal fade" id="datasetModal" tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-md modal-dialog-centered">
                            <div className="modal-content bg-slate-50 rounded-lg drop-shadow-md dark:bg-gray-800">
                                <div className="modal-header border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600">
                                    <h5 className="text-xl font-medium text-gray-900 dark:text-white">Загрузить датасет</h5>
                                    <button type="button" class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                                        <svg aria-hidden="true" class="w-5 h-5" data-bs-dismiss="modal" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                        <span class="sr-only">Закрыть диалог</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="p-2 w-50 bd-highlight">
                                         <input className="m-2" type="file" onChange={this.uploadClick}/>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {DatasetId != 0?
                    <DetailDataset datasetId={DatasetId} />
                    :null
                    }
                </div >
            )
        }
    }
}