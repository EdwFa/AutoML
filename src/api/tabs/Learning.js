import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import ReactSelect, { createFilter } from 'react-select';
import AsyncSelect from 'react-select/async';

import { variables } from '../Variables.js';



export class Learner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // общая информация о эпикризе
      datasetId: 0,
      token: variables.token,
      default_models: [],
      labels: [],
      LearnModel: null,
      LearnLabel: null,
      loading: false,
      LearnInfo: null,
    }
  }

  RefreshModels() {
    console.log(this.props);
    this.setState({datasetId: this.props.datasetId})
    this.setState({ token: variables.token });
    fetch(variables.API_URL+'main/datasets/' + this.props.datasetId + '/learner',
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

  componentDidMount() {
    this.RefreshModels();
  }

  componentDidUpdate(prevProps) {
    if (this.props.datasetId !== prevProps.datasetId) {
      this.RefreshModels();
    }
  }

  // Для выбора и обучения моделей
  changeModel = (e) => {
        this.setState({ LearnModel: e })
    }

  changeLabel = (e) => {
        this.setState({ LearnLabel: e.target.value })
    }

  changeParamValue = (param, e) => {
    console.log(param, e)
    const NewLearnModel = this.state.LearnModel;
    for (const elem of NewLearnModel.param){
        if (elem.label === param.label){
            elem.value = e
        }
    }
    console.log(NewLearnModel)
    this.setState({ LearnModel: NewLearnModel })
  }

  LearnModel() {
    console.log(this.state.LearnModel);
    fetch(variables.API_URL+'main/datasets/' + this.props.datasetId + '/learner',
                {
                    method:'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        'Authorization': `Token ${this.state.token}`,
                    },
                    body: JSON.stringify({
                        model: this.state.LearnModel,
                        target: this.state.LearnLabel
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

  render() {
    const {
        datasetId,
        default_models,
        LearnModel,
        labels,
        LearnLabel,
        LearnInfo
    } = this.state

    return (
      <div className="rounded-lg bg-sky-50 p-4 shadow dark:bg-gray-700 sm:p-6 xl:p-8">
        <div>
            <div class="relative w-full mb-6 group">
                <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Доступные модели</label>
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
                <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Выберите поле для обучения</label>
                    <div class="relative z-0 w-full mb-6 group">
                        <select
                            name="floating_gender"
                            id="floating_gender"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                            onChange={e => this.changeLabel(e)}
                            value={LearnLabel}>
                            {labels.map(dp => <option key={dp}>{dp}</option>)}
                        </select>
                    </div>
            </div>
            <div>
                {LearnModel?
                <div>
                    <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Параметры модели</label>
                    {LearnModel.param?.map(param =>
                        <div class="relative w-full mb-6 group">
                            <label for="text" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{param.label}</label>
                            {(param.type_data === 'I' || param.type_data === 'F')?
                                <input
                                    type="number"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    value={param.value}
                                    onChange={e => this.changeParamValue(param, e.target.value)}
                                    defaultValue={null}
                                    placeholder=""
                                />
                            :
                                <div class="relative z-0 w-full mb-6 group">
                                    <select
                                        name="floating_gender"
                                        id="floating_gender"
                                        className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        onChange={e => this.changeParamValue(param, e.target.value)}
                                        value={param.value}>
                                        {param.choices_values.map(dp => <option key={dp}>{dp}</option>)}
                                    </select>
                                </div>
                            }
                        </div>
                        )
                    }
                    <button type="button"
                                    className="flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 ml-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 float-end"
                                    onClick={() => this.LearnModel()}>
                                    Обучить
                            </button>
                    {LearnInfo?
                        <div>
                            <p>Точность на тренировочном наборе = {LearnInfo.train_accuracy}</p>
                            <p>Точность на тестовом наборе = {LearnInfo.test_accuracy}</p>
                            <div className="ag-theme-alpine" style={{height: 300, width: 1000}}>
                               <AgGridReact
                                   rowData={LearnInfo.classification_matrix}
                                   columnDefs={LearnInfo.columns}>
                               </AgGridReact>
                           </div>
                        </div>
                    :null}
                </div>
                :null}
            </div>
        </div>
      </div >
    )
  }
}