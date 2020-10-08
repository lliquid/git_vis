import React from 'react'
import * as d3 from 'd3'
import axios from 'axios';
import moment from 'moment';

import {join} from 'lodash';

import './App.scss';
import {serverRoot, defaultSelectedFileTypes} from './config.js';

import Graph from './algo/graph.js';

import Matrix from './vis/matrix.js';
import Bubbles from './vis/bubbles.js';
import DirectoryTreeView from './widgets/directory-tree-view_antd.js';
import TreeMap from './vis/treemap.js';
import Tooltip from './widgets/tooltip.js';
import Number from './vis/number.js';
import DateRangePicker from './vis/date-range-picker.js';

import NodeLinkGraph from './vis/node-link-graph.js';
import Select from './widgets/select.js';

import {Layout, Menu, DatePicker} from 'antd';
import 'antd/dist/antd.css';


import {
    CalendarOutlined,
    FileOutlined,
    FileAddOutlined,
    UserOutlined,
    FolderOutlined,
    FireOutlined,
    TeamOutlined,
    MessageOutlined,
    UploadOutlined,
    DiffOutlined,
    AreaChartOutlined,
    ShareAltOutlined
} from '@ant-design/icons';

const {Header, Sider, Content} = Layout;

class App extends React.Component {

    constructor(props) {

        super(props);

        this.fileTypeChart = React.createRef();
        this.developersChart = React.createRef();
        this.directory = React.createRef();

        this.treemap = React.createRef();
        this.coeditgraph = React.createRef();

        this.tooltip = React.createRef();
        this.calendar = React.createRef();


        this.summary = {
            commits: React.createRef(),
            developers: React.createRef(),
            lines_added_and_deleted: React.createRef(),
            changed_files: React.createRef(),
            added_files: React.createRef(),
        };

        this.state = {
            repo_and_branch: {
                repository: '../data/react-redux',
                branch: 'master',
            },
            date_range: {
                start_date: '2020-01-01',
                end_date: '2020-08-29'
            },
            filters: {
                developers: '',
                folders: '',
                file_types: '',
            },
            summary: { // summary statistics
                commits: 0,
                developers: 0,
                lines_added: 0,
                lines_deleted: 0,
                changed_files: 0,
                added_files: 0
            },
            display: 'coeditgraph' // or streamgraph, coeditgraph, collabgraph
        };

    }

    updateCalendar() {
        const self = this;
        self.calendar.current.setLoadingStatus(true);
        axios({
            method: 'get',
            url: serverRoot + 'stats',
            responseType: 'json',
            params: {
                ...self.state.repo_and_branch,
                dimension: 'date',
                metric: 'commits'
            }
        }).then(function (response) {
            self.calendar.current.setLoadingStatus(false);
            self.calendar.current.setData(response.data.json);
            self.calendar.current.setSelection(self.state.date_range.start_date, self.state.date_range.end_date);
        })
    }

    updateSummary() {
        const self = this;

        for (let k in self.summary) {
            self.summary[k].current.setLoadingStatus(true);
        }

        axios({
            method: 'get',
            url: serverRoot + 'stats',
            responseType: 'json',
            params: {
                ...self.state.repo_and_branch,
                ...self.state.date_range,
                dimension: 'none',
            }
        }).then(function (response) {
            self.setState({summary: response.data.json})
            for (let k in self.summary) {
                self.summary[k].current.setLoadingStatus(false);
            }
        })

    }



    //update developer, filetype and directory info
    updateRightCharts() {

        const self = this;

        self.fileTypeChart.current.setLoadingStatus(true);
        axios({
            method: 'get',
            url: serverRoot + 'info',
            responseType: 'json',
            params: {
                ...this.state.repo_and_branch,
                ...this.state.date_range,
                type: 'file_types'
            }
        }).then(function (response) {
            self.fileTypeChart.current.setLoadingStatus(false);
            self.fileTypeChart.current.setData(response.data.json);
        });

        self.developersChart.current.setLoadingStatus(true);
        axios({
            method: 'get',
            url: serverRoot + 'stats',
            responseType: 'json',
            params: {
                ...this.state.repo_and_branch,
                ...this.state.date_range,
                dimension: 'developer',
                metric: 'commits'
            }
        }).then(function (response) {
            self.developersChart.current.setLoadingStatus(false);
            self.developersChart.current.setData(response.data.json);

        });

        axios({
            method: 'get',
            url: serverRoot + 'info',
            responseType: 'json',
            params: {
                ...this.state.repo_and_branch,
                ...this.state.date_range,
                type: 'directory'
            }
        }).then(function (response) {
            self.directory.current.setState(
                {data: response.data.json}
            );
        });


    }

    updateTreemap() {

        const self = this;
        self.treemap.current.setLoadingStatus(true);
        axios({
            method: 'get',
            url: serverRoot + 'stats',
            responseType: 'json',
            params: {
                ...this.state.repo_and_branch,
                ...this.state.date_range,
                ...this.state.filters,
                dimension: 'directory'
            }
        }).then(function (response) {
            self.treemap.current.setLoadingStatus(false);
            self.treemap.current.setData(response.data.json);
        });

    }

    updateCoeditGraph() {
        const self = this;
        self.coeditgraph.current.setLoadingStatus(true);
        axios({
            method: 'get',
            url: serverRoot + 'collab',
            responseType: 'json',
            params: {
                ...this.state.repo_and_branch,
                ...this.state.date_range,
                ...this.state.filters,
                requested_graph: 'coedit'
            }
        }).then(function (response) {
            const graph = new Graph();
            graph.clear();
            graph.load_nx_json(response.data.graph_data);
            self.coeditgraph.current.setLoadingStatus(false);
            self.coeditgraph.current.setData(graph);
        });


    }

    componentDidMount() {

        this.updateCalendar();
        this.updateSummary();
        this.updateRightCharts();
        this.updateTreemap();
        this.updateCoeditGraph();

    }

    render() {

        const self = this;

        return (
            <Layout>
                <Sider trigger={null} collapsible collapsed={true}>
                    <div className="logo" />
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}
                          onSelect={(item, key)=>{
                              self.setState({display: item.key});
                          }}>
                        <Menu.Item key="treemap">
                            <FireOutlined/>
                            <span>HotSpot</span>
                        </Menu.Item>
                        <Menu.Item key="streamgraph">
                            <AreaChartOutlined/>
                            <span>Trend</span>
                        </Menu.Item>
                        <Menu.Item key="coeditgraph">
                            <ShareAltOutlined/>
                            <span>AuthorshipGraph</span>
                        </Menu.Item>
                        <Menu.Item key="collabgraph">
                            <TeamOutlined/>
                            <span>CollabGraph</span>
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{background: '#fff', paddingLeft: 10}}>
                        <div className={'controls-header'}>
                            <div className={'control-widget'}>Log In</div>
                            <Select title={'Repository'} key={'Repository'} defaultValue={'react'} options={['react', 'd3', 'vega']}/>
                            <Select title={'Branch'} key={"Branch"} defaultValue={'master'} options={['master', 'dev']}/>
                        </div>
                    </Header>
                    <Content>
                        <Tooltip ref={this.tooltip}/>

                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <Number title={'Commits'}
                                            icon={<UploadOutlined/>}
                                            ref={this.summary.commits}
                                            number={this.state.summary.commits}/>
                                    <Number title={'Lines'}
                                            icon={<DiffOutlined/>}
                                            ref={this.summary.lines_added_and_deleted}
                                            number={'+' + this.state.summary.lines_added
                                                + '/' + '-' + this.state.summary.lines_deleted}
                                            width={250}/>
                                    <Number title={"Changed Files"}
                                            icon={<FileOutlined/>}
                                            ref={this.summary.changed_files}
                                            width={250}
                                            number={this.state.summary.changed_files}/>
                                    <Number title={"New Files"}
                                            icon={<FileAddOutlined/>}
                                            ref={this.summary.added_files}
                                            number={this.state.summary.added_files}/>
                                    <Number title={'Developers'}
                                            icon={<UserOutlined/>}
                                            ref={this.summary.developers}
                                            number={this.state.summary.developers}/>
                                </div>

                                <TreeMap ref={this.treemap}
                                         width={1200} height={800}
                                         visible={this.state.display === 'treemap'}
                                         display={'standalone'}
                                         tooltip={this.tooltip}/>

                                <NodeLinkGraph ref={this.coeditgraph}
                                               width={1200} height={800}
                                               visible={this.state.display === 'coeditgraph'}
                                               display={'standalone'}
                                               tooltip={this.tooltip}
                                               data={undefined}
                                               title={"CoeditGraph"}/>

                            </div>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <div className={'control-panel'}>
                                <div className={'control-widget'}>
                                    <div className={'title'}><CalendarOutlined/> Date Range</div>
                                    <DateRangePicker
                                        width={420}
                                        ref={this.calendar}
                                        tooltip={this.tooltip}
                                        onRangeChanged={(range)=>{
                                            self.state.date_range.start_date = range.from.toISOString().slice(0, 10);
                                            self.state.date_range.end_date = range.to.toISOString().slice(0,10);
                                            self.updateSummary();
                                            self.updateTreemap();
                                            self.updateCoeditGraph();
                                        }}
                                    />
                                </div>
                                </div>
                                <div className={'control-panel'}>
                                <div className={'control-widget'}>
                                    <div className={'title'}><FolderOutlined/> Directory</div>
                                    <DirectoryTreeView
                                        onCheckUpdate={(directories)=>{
                                            self.state.filters.folders = join(directories, ',');
                                            self.updateTreemap();
                                            self.updateCoeditGraph();

                                        }}
                                        ref={this.directory}
                                        width={420}/>
                                </div>
                                <div className={'control-widget'}>
                                    <div className={'title'}><FileOutlined/> File Types</div>
                                    <Bubbles ref={this.fileTypeChart} width={420} height={250}
                                             display={'embedded'}
                                             padding={{top: 5, bottom: 5, left: 5, right: 5}}
                                             data={[{name: 'a', value: 10}, {name: 'b', value: 40}]}/>
                                </div>
                                <div className={'control-widget'}>
                                    <div className={'title'}><UserOutlined/> Developers</div>
                                    <Bubbles ref={this.developersChart} width={420} height={250}
                                             display={'embedded'}
                                             padding={{top: 5, bottom: 5, left: 5, right: 5}}
                                             data={[{name: 'a', value: 10}, {name: 'b', value: 20}]}/>
                                </div>
                            </div>
                            </div>

                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }


}

export default App;
