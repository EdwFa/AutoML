import React, { Component } from 'react';

import Plot from 'react-plotly.js';

import { GetScatterData, GetScatterLayout } from './Scatter.js';
import { GetHistogramData, GetHistogramLayout } from './Histogram.js'

import "../Viewer/styles.css"


export class PlotGrafic extends Component {

    constructor(props) {
        super(props);

        this.state = {
        graffic: null,
        x_data: null,
        y_data: null,
        group_data: null,
        x_label: null,
        y_label: null,
        }
    }

    componentDidMount() {
        this.setState({graffic: this.props.graffic})
    }

    componentDidUpdate(prevProps) {
        if (this.props.graffic != prevProps.graffic) {
            this.setState({ graffic: this.props.graffic})
        }
        if (this.props.x_data != prevProps.x_data) {
            this.setState({ x_data: this.props.x_data, x_label: this.props.x_label })
        }
        if (this.props.y_data != prevProps.y_data) {
            this.setState({ y_data: this.props.y_data, y_label: this.props.y_label })
        }
        if (this.props.group_label != prevProps.group_label) {
            this.setState({ group_data: this.props.group_label})
        }
    }

    render() {
        const {
        graffic,
        x_data,
        y_data,
        group_data,
        y_label,
        x_label
        } = this.state;

        console.log(this.state);
        if (graffic == null){
            return ;
        }

        if ( graffic.name == 'scatter' ){
            return (
                <div class="e28_378">
                    <Plot
                        data={
                            GetScatterData(x_data, y_data, group_data)
                        }
                        layout={
                            GetScatterLayout(y_label, x_label)
                        }
                        />
                </div>
            )
        }
        if ( graffic.name == 'histogram' ){
            return (
                <div class="e28_378">
                    <Plot
                        data={
                            GetHistogramData(x_data, group_data)
                        }
                        layout={
                            GetHistogramLayout(x_label)
                        }
                        />
                </div>
            )
        }
    }
}