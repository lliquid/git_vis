import React from 'react';
import {map} from 'lodash';
import {Select as AntDSelect} from 'antd';

import 'antd/dist/antd.css';
import './widget.scss';
import './select.scss';

const { Option } = AntDSelect;


class Select extends React.Component {

    render() {
        return <div className={this.props.className} >
            <div className={"title"}> {this.props.title} </div>
            <div className={"select"}>
                <AntDSelect name={this.props.title}
                            id={this.props.title}
                            defaultValue={this.props.defaultValue}
                            size={this.props.size} bordered={this.props.bordered}>
                    {map(this.props.options, val => {
                        return <Option key={val} value={val}>{val}</Option>
                    })}
                </AntDSelect>
            </div>
        </div>;
    }

    select(value) {

    }

}

Select.defaultProps = {
    title: 'select',
    className: 'widget select-widget',
    options: [],
    defaultValue: '',
    size: 'small',
    bordered: false,


};

export default Select;