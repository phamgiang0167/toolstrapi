import React, { Component } from 'react';
import Export from './Export';
import Import from './Import';
import { Switch } from 'antd';
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isImport: false
        }
        this.handleChangeSwitch = this.handleChangeSwitch.bind(this)
    }
    handleChangeSwitch(value) {
        this.setState({
            isImport: value
        })
    }

    componentDidMount(){
        const envi = localStorage.getItem("ENVI") ? localStorage.getItem("ENVI") : "URLDEV"
        localStorage.setItem("ENVI", envi)
    }

    render() {
        const { isImport } = this.state
        return (
            <div>
            <h3>IGAP</h3>
                <div className="header-top">
                    <div className="switch-area">
                        <p style={{ color: isImport ? '#ffffff50' : '#fff' }}>Export</p>
                        <Switch className='btn-switch' onChange={this.handleChangeSwitch}>
                        </Switch>
                        <p style={{ color: isImport ? '#fff' : '#ffffff50' }}>Import</p>
                    </div>
                </div>
                <h1 style={{ color: '#fff' }}>{isImport ? "Import" : "Export"}</h1>
                {isImport ? <Import /> : <Export />}
            </div>
        );
    }
}

Home.propTypes = {

};

export default Home;