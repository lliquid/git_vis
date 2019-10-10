import React from 'react'
import './App.css';
import Container from './vis/container.js';
import logo from './brand/imageedit_1_3950696162.png';

import { Layout, Menu, Icon } from 'antd';
import 'antd/dist/antd.css';

const { Header, Sider, Content } = Layout;


class App extends React.Component {

  state = {
    collapsed: true,
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    return (
      <Layout>
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          <div className="logo" >
            <img src={logo} alt="Logo" style={{width: '95%'}}/>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="fire" />
              <span>HotSpot</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="team" />
              <span>CollabGraph</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="branches" />
              <span>Lineage</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="message" />
              <span>Feedback</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', paddingLeft: 10 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content>
            <Container/>
          </Content>
        </Layout>
      </Layout>
    );
  }


}

export default App;