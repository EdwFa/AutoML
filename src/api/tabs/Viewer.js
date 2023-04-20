import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { variables } from '../Variables.js';



export class Viewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // общая информация о эпикризе
      datasetId: 0,
      dataset: [],
      datasetColumns: [],
      countRows: 0,
      countColumns: 0,
      token: variables.token,
    }
  }

  RefreshDataset() {
    console.log(this.props);
    this.setState({datasetId: this.props.datasetId})
    this.setState({ token: variables.token });
    fetch(variables.API_URL+'main/datasets/' + this.props.datasetId + '/viewer',
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
    this.RefreshDataset();
  }

  componentDidUpdate(prevProps) {
    if (this.props.datasetId !== prevProps.datasetId) {
      this.RefreshDataset();
    }
  }

  render() {
    const {
        datasetId,
        dataset,
        datasetColumns,
        datasetInfo
    } = this.state

    return (
      <div className="rounded-lg bg-sky-50 p-4 shadow dark:bg-gray-700 sm:p-6 xl:p-8">
        <div className="ag-theme-alpine" style={{height: 400}}>
           <AgGridReact
               rowData={dataset}
               columnDefs={datasetColumns}>
           </AgGridReact>
       </div>
      </div >
    )
  }
}