import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';

import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';

import { variables } from './Variables.js';
import { Viewer} from './tabs/Viewer.js';
import { Learner } from './tabs/Learning.js';




export class DetailDataset extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // общая информация о эпикризе
      DatasetId: 0,
      datasetInfo: {},
    }
  }

  RefreshDataset() {
    console.log(this.props);
    this.setState({DatasetId: this.props.datasetId})
    this.setState({ token: variables.token });
    fetch(variables.API_URL+'main/datasets/' + this.props.datasetId,
                {
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        'Authorization': `Token ${this.state.token}`,
                    },
                })
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        datasetInfo: data.info
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.setState({ datasetInfo: {} });
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
        DatasetId,
        datasetInfo,
    } = this.state

    return (
      <div className="rounded-lg bg-sky-50 p-4 shadow dark:bg-gray-700 sm:p-6 xl:p-8">
        <div class="flex flex-wrap justify-between items-center dark:border-gray-600 mb-4">
            <h2>Датасет - {datasetInfo? datasetInfo.name: null}</h2>
        </div>
        <div>
          <Tab.Container id="left-tabs-example" defaultActiveKey="first">
            <div className="flex gap-6">
              <Nav variant="pills" className="flex-none space-y-6 lg:space-y-2 border-l border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-400">
                <Nav.Item>
                  <Nav.Link eventKey="first">Датасет</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="second">Статистика</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="third">Графики</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fourth">Обучение</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content className='grow overflow-x-auto rounded-md border border-dashed border-slate-800 dark:border-slate-400'>
                <Tab.Pane eventKey="first">
                  {DatasetId != "" ?
                    <Viewer datasetId={DatasetId} />
                    : null}
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  {DatasetId != "" ?
                    <Viewer datasetId={DatasetId} />
                    : null}
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                  {DatasetId != "" ?
                    <Viewer datasetId={DatasetId} />
                    : null}
                </Tab.Pane>
                <Tab.Pane eventKey="fourth">
                  {DatasetId != "" ?
                    <Learner datasetId={DatasetId} />
                    : null}
                </Tab.Pane>
              </Tab.Content>
            </div>
          </Tab.Container>
        </div>
      </div >
    )
  }
}