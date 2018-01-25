import cookie from 'js-cookie';
import moment from 'moment';
import React, { Component } from 'react';
import { Select, message, Table, Input, DatePicker } from 'antd';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import Bread from 'Common/Bread';
import { DC_HOMEWORK_LIST_SALES } from 'config/permission';
import { subject as subjectMap } from 'config/enmu';
import '../style/workList.less';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

@connect(({ user }) => ({ user }))
@withRouter
class List extends Component {
    constructor(props) {
        super(props);
        this.forSales = props.user.permissions.some(code => code === DC_HOMEWORK_LIST_SALES);
        const workListData = cookie.get('workListData') ? JSON.parse(cookie.get('workListData')) : null;
        this.state = {
            req: {
                page: workListData ? workListData.req.page : 1,
                size: workListData ? workListData.req.size : 25,
                homework_id: workListData ? workListData.req.homework_id : '',
                subject: workListData ? workListData.req.subject : '',
                school: workListData ? workListData.req.school : '',
                teacher: workListData ? workListData.req.teacher : '',
                begin_time: workListData ? workListData.req.begin_time : Date.parse(this.GetDateStr(-1)) / 1000,
                end_time: workListData ? workListData.req.end_time : Date.parse(this.GetDateStr(1)) / 1000,
                class_id: workListData ? workListData.req.class_id : '',
                status: '0,1,2',
            },
            data: {
                total: '',
                current_page: '',
                data: [],
            },
            searchType: workListData ? workListData.searchType : 'homework_id',
            content: workListData ? workListData.content : '',
            searchSchoolId: workListData ? workListData.searchSchoolId : '', // 搜索的学校ID
            classArr: [], // 搜索学校下班级列表
            classOnoff: workListData ? workListData.classOnoff : false,
            seleceClassName: workListData ? workListData.seleceClassName : '',
        };
        this.columns = [
            {
                title: '作业名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '作业ID',
                dataIndex: 'homework_id',
                key: 'homework_id',
            },
            {
                title: '截止时间',
                dataIndex: 'stop_time_string',
                key: 'stop_time_string',
            },
            {
                title: '学科',
                dataIndex: 'subject',
                key: 'subject',
                render: (v, item) => (
                    item.subject != null ? this.subject_arr[item.subject] : '暂无'
                ),
            },
            {
                title: '学校',
                dataIndex: 'school',
                key: 'school',
            },
            {
                title: '班级',
                dataIndex: 'classes',
                key: 'classes',
                render: (v, item) => (
                    item.classes && item.classes.length > 0 ?
                        item.classes.map(v => v.name).join(',')
                        : '暂无'
                ),
            },
            {
                title: '布置教师',
                dataIndex: 'teacher',
                key: 'teacher',

            },
            {
                title: '操作',
                key: 't',
                render: (v, item) => (
                    <div>
                        <a onClick={() => this.goView(item)} >查看作业</a>
                        &nbsp;&nbsp;
                        <a onClick={() => this.goReport(item)} disabled={item.status != 1}>查看报告</a>
                    </div>
                ),
            },
        ];
    }
    // 查看
    goView(item) {
        this.$go(`/data/quemng/workdetail/${item.homework_id}`);
    }
    goReport(item) {
        this.$go(`/data/quemng/newAnalyse/${item.homework_id}?user=${item.teacher_id}&subject=${item.subject}&department=${item.grade_id}`);
    }
    componentDidMount() {
        this.props.router.setRouteLeaveHook(this.props.route, (data) => {
            if (data.pathname.substr(0, 24) == '/data/quemng/workdetail/') {
                // 设置cookie
                const workListData = this.state;
                delete workListData.classArr;
                delete workListData.data;
                cookie.set('workListData', workListData);
            } else {
                // 清除cookie
                cookie.remove('workListData');
            }
            return true;
        });
        this.getData();
    }
    // 获取学校下班级列表
    getClass() {
        const that = this;
        const req = {
            school_id: this.state.searchSchoolId,
            grade_id: '',
            all: 1,
        };
        this.$get('/class/list', req).success((json) => {
            if (json.data) {
                that.setState({
                    classArr: json.data,
                });
            }
        });
    }
    // 获取作业列表
    getData() {
        const { req } = this.state;
        if (this.forSales) {
            delete req.end_time;
            delete req.begin_time;
            delete req.subject;
            delete req.homework_id;
            delete req.school;
            delete req.teacher;
        }
        this.$get('/teaching/homework/homeworkList', req).success((res) => {
            if (res.data) {
                if (res.data.data.length > 0) {
                    res.data.data.map((item, index) => {
                        item.key = index;
                        item.stop_time_string = Util.dateFormat(item.stop_time * 1000);
                        return item;
                    });
                }
                this.setState({
                    data: res.data,
                });
                // 如果是学校搜索，显示班级选择
                if (this.state.searchType == 'school' && this.state.content != '' && res.data.data.length > 0) {
                    this.setState({
                        searchSchoolId: res.data.data[0].school_id,
                    }, this.getClass);
                }
            }
        });
    }
    // 翻页
    paperChange(page) {
        const newState = { req: { ...this.state.req, ...{ page } } };
        this.setState(newState, this.getData);
    }
    // 日期范围改变
    dataChange(dates, dateStrings) {
        const { req } = this.state;
        req.begin_time = dateStrings[0] ? Date.parse(dateStrings[0]) / 1000 - 28800 : '';
        req.end_time = dateStrings[1] ? Date.parse(dateStrings[1]) / 1000 + 57600 : '';
        req.page = 1;
        this.setState({
            req,
        }, this.getData);
    }
    GetDateStr(AddDayCount) {
        const dd = new Date();
        dd.setDate(dd.getDate() + AddDayCount);// 获取AddDayCount天后的日期
        const y = dd.getFullYear();
        const m = dd.getMonth() + 1;// 获取当前月份的日期
        const d = dd.getDate();
        return `${y}-${m}-${d}`;
    }
    renderSubjectOptions() {
        return Object.keys(subjectMap).map(
            id => (
                id === '0' ?
                    <Option value={id}>全部学科</Option> :
                    <Option value={id}>{subjectMap[id]}</Option>
            ));
    }
    // 渲染排序方式
    loop_sort_type() {
        let defaultSearchType = '';
        switch (this.state.searchType) {
            case 'homework_id':
                defaultSearchType = '作业ID';
                break;
            case 'school':
                defaultSearchType = '学校';
                break;
            case 'teacher':
                defaultSearchType = '布置教师';
                break;
            default:
                defaultSearchType = '作业ID';
        }
        const seniorOne = [];
        const seniorTwo = [];
        const seniorThree = [];
        const juniorOne = [];
        const juniorTwo = [];
        const juniorThree = [];
        const { classArr } = this.state;
        classArr.forEach((item) => {
            switch (item.grade_id) {
                case 7:
                    juniorOne.push(<Option key={item.class_id} value={`${item.class_id}-${item.name}`}>{item.name}</Option>);
                    break;
                case 8:
                    juniorTwo.push(<Option key={item.class_id} value={`${item.class_id}-${item.name}`}>{item.name}</Option>);
                    break;
                case 9:
                    juniorThree.push(<Option key={item.class_id} value={`${item.class_id}-${item.name}`}>{item.name}</Option>);
                    break;
                case 10:
                    seniorOne.push(<Option key={item.class_id} value={`${item.class_id}-${item.name}`}>{item.name}</Option>);
                    break;
                case 11:
                    seniorTwo.push(<Option key={item.class_id} value={`${item.class_id}-${item.name}`}>{item.name}</Option>);
                    break;
                case 12:
                    seniorThree.push(<Option key={item.class_id} value={`${item.class_id}-${item.name}`}>{item.name}</Option>);
                    break;
                default:
                    break;
            }
        });
        return (
            <div className="table_title_sort">
                <div className="sort_role">
                    <Select defaultValue={this.state.req.subject == '' ? '全部学科' : this.subject_arr[this.state.req.subject]} style={{ width: 100 }} onChange={e => this.subjectChange(e)}>
                        {
                            this.renderSubjectOptions()
                        }
                    </Select>
                </div>
                {
                    this.state.classOnoff ?
                        <div className="sort_role">
                            <Select value={this.state.seleceClassName == '' ? '全部班级' : this.state.seleceClassName} style={{ width: 130 }} onChange={e => this.classChange(e)}>
                                <Option key="0" >全部班级</Option>
                                {
                                    juniorOne.length > 0 ?
                                        <OptGroup label="初一">
                                            {juniorOne}
                                        </OptGroup>
                                        : <OptGroup />
                                }
                                {
                                    juniorTwo.length > 0 ?
                                        <OptGroup label="初二">
                                            {juniorTwo}
                                        </OptGroup>
                                        : <OptGroup />
                                }
                                {
                                    juniorThree.length > 0 ?
                                        <OptGroup label="初三">
                                            {juniorThree}
                                        </OptGroup>
                                        : <OptGroup />
                                }
                                {
                                    seniorOne.length > 0 ?
                                        <OptGroup label="高一">
                                            {seniorOne}
                                        </OptGroup>
                                        : <OptGroup />
                                }
                                {
                                    seniorTwo.length > 0 ?
                                        <OptGroup label="高二">
                                            {seniorTwo}
                                        </OptGroup>
                                        : <OptGroup />
                                }
                                {
                                    seniorThree.length > 0 ?
                                        <OptGroup label="高三">
                                            {seniorThree}
                                        </OptGroup>
                                        : <OptGroup />
                                }
                            </Select>
                        </div> : null

                }
                <div className="sort_search">
                    <Select defaultValue={defaultSearchType} onChange={e => this.searchTypeChange(e)} className="sort_search_select">
                        <Option value="homework_id">作业ID</Option>
                        <Option value="school">学校</Option>
                        <Option value="teacher">布置教师</Option>
                    </Select>
                    <Search
                        placeholder=""
                        className="sort_input"
                        style={{ width: 180 }}
                        onSearch={e => this.contentSearch(e)}
                        value={this.state.content}
                        onChange={e => this.contentChange(e)}
                        onPressEnter={e => this.contentSearch(e)}
                    />
                </div>
            </div>
        );
    }
    // 学科改变
    subjectChange(v) {
        const newState = { req: { ...this.state.req, ...{ subject: v == 0 ? '' : v, page: 1 } } };
        this.setState(newState, this.getData);
    }
    // 班级改变
    classChange(v) {
        const newState = { req: { ...this.state.req, ...{ class_id: v.split('-')[0] == 0 ? '' : v.split('-')[0], page: 1 } } };
        this.setState({
            seleceClassName: v == 0 ? '全部班级' : v.split('-')[1],
        });
        this.setState(newState, this.getData);
    }
    // 搜索类型改变
    searchTypeChange(v) {
        this.setState({
            searchType: v,
            classArr: [],
        });
    }
    // 搜索内容改变
    contentChange(v) {
        this.setState({
            content: v.target.value,
        });
        if (this.state.searchType == 'school') {
            const { req } = this.state;
            req.class_id = '';
            this.setState({
                seleceClassName: '',
                req,
            });
        }
    }
    contentSearch() {
        if (this.state.searchType == 'school' && this.state.content != '') {
            this.setState({
                classOnoff: true,
            });
        } else {
            this.setState({
                classOnoff: false,
                seleceClassName: '',
            });
        }
        if (this.state.searchType == 'homework_id') {
            if (!/^[0-9]*$/.test(this.state.content)) {
                message.warning('请输入正确的作业ID!');
                return;
            }
        }
        const { req } = this.state;
        req.page = 1;
        req.homework_id = '';
        req.school = '';
        req.teacher = '';
        req[this.state.searchType] = this.state.content;
        req.class_id = this.state.searchType == 'school' && this.state.content != '' ? req.class_id : '';
        this.setState({ req }, this.getData);
    }
    getTableTitle() {
        if (this.forSales) {
            return '作业列表';
        }
        const loop_sort_type = this.loop_sort_type();
        const format = 'YYYY-MM-DD';
        return (
            <div className="table_title">
                <div className="table_title_title">
                    作业列表
                </div>
                <div className="table_title_time">
                    <RangePicker
                        onChange={(a0, a1) => this.dataChange(a0, a1)}
                        defaultValue={[
                            this.state.req.begin_time != '' ? moment(this.second2Date(this.state.req.begin_time), format) : null,
                            this.state.req.end_time != '' ? moment(this.second2Date(this.state.req.end_time - 3600), format) : null,
                        ]}
                    />
                </div>
                {loop_sort_type}
            </div>
        );
    }
    render() {
        return (
            <div className="data-container">
                <Bread
                    breads={[
                        { title: 'AI学运营后台', link: '/' },
                        { title: '运营管理', link: '/data' },
                        { title: '教学数据查询', link: '/data' },
                    ]}
                    currentBread={
                        { title: '作业查询' }
                    }
                />
                <div className="data-table">
                    <Table
                        columns={this.columns}
                        dataSource={this.state.data.data}
                        className="table"
                        bordered
                        pagination={{
                            pageSize: parseInt(this.state.req.size, 10), total: this.state.data.total, onChange: (...args) => this.paperChange(...args), current: this.state.req.page, showTotal: total => `共 ${total} 条`,
                        }}
                        title={() => this.getTableTitle()}
                    />
                </div>
            </div>
        );
    }
}

export default List;
