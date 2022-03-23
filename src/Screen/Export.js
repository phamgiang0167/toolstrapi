import React, { Component } from 'react'
import 'antd/dist/antd.css';
import { Input, Select, Button, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import data from "../data/index"
import apis from '../apis';
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
const { Option } = Select;
const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const exportToCSV = (apiData, fileName) => {

    const ws = XLSX.utils.json_to_sheet(apiData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
};
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
class Export extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bearToken: localStorage.getItem("bearToken") ? localStorage.getItem("bearToken") : null,
            sellerCode: null,
            type: data.type[0].val,
            envi: 'URLDEV',
            data: null,
            fileName: 'export',
            loading: false
        }
        this.handChangeEnvi = this.handChangeEnvi.bind(this);
        this.handChangeFileName = this.handChangeFileName.bind(this);
        this.handChangeSellerCode = this.handChangeSellerCode.bind(this);
        this.handChangeToken = this.handChangeToken.bind(this);
        this.handChangeType = this.handChangeType.bind(this);
        this.handleExport = this.handleExport.bind(this)
        this.renderType = this.renderType.bind(this)

    }
    handChangeEnvi(value) {
        this.setState({
            envi: value
        })
    }
    handChangeSellerCode(value) {
        this.setState({
            sellerCode: value.target.value
        })
    }
    handChangeType(value) {
        this.setState({
            type: value
        })
    }
    handChangeToken(value) {
        this.setState({
            bearToken: value.target.value
        })
        localStorage.setItem("bearToken", value.target.value)
    }
    handChangeFileName(value) {
        this.setState({
            fileName: value.target.value
        })
    }
    handleExport() {
        const { bearToken, sellerCode, type, envi, data, fileName } = this.state;
        this.setState({
            loading: true
        })
        apis.exportData(envi, { sellerCode }, type)
            .then((data) => {
                
                message.success("Lấy dữ liệu thành công, click Download để tải file")
                this.setState({
                    data: data.data,
                    loading: false
                })
            })
            .catch(err => {
                message.error("Lấy dữ liệu thất bại")
                if (err.response.status == "401") {
                    message.error("Token không hợp lệ !")
                }
            })

    }

    renderType(type) {
        return data[type]?.map((item, index) => <Option key={index} value={item.val}>{item.name}</Option>)
    }
    render() {
        const { bearToken, sellerCode, type, envi, fileName, data, loading } = this.state;
        return (
            <div className='container'>
                <Input.Group compact >
                    <div className="form-export" style={{ display: 'flex' }}>

                        <Select
                            className='export-item'
                            style={{ width: 400 }}
                            defaultValue="dev"
                            value={envi}
                            onChange={this.handChangeEnvi}
                        >
                            <Option value="URLDEV">DEVELOP</Option>
                            <Option value="URLPROD">PRODUCTION</Option>
                        </Select>

                        <Input
                            className='export-item'
                            style={{ width: 400 }}
                            onChange={this.handChangeSellerCode}
                            value={sellerCode}
                            placeholder="Seller Code"
                        />

                        <Select
                            className='export-item'
                            style={{ width: 400 }}
                            onChange={this.handChangeType}
                            value={type}
                            placeholder="Type Export" defaultValue={{ value: this.state.type }}
                        >
                            {this.renderType("type")}
                        </Select>
                        <Input className='export-item' style={{ width: 400 }} onChange={this.handChangeFileName} value={fileName} placeholder="File Name" defaultValue="fileExport" />
                        <TextArea className='export-item' style={{ width: 400, height: 100 }} onChange={this.handChangeToken} value={bearToken} placeholder="Token Bear" />
                        <Button
                            className="btn-export export-item"
                            onClick={this.handleExport}
                            disabled={!fileName || !sellerCode  ? true : false}
                        >
                            Export File CSV
                            {loading  && <Spin indicator={antIcon} style={{float: "right"}}/>}
                        </Button>
                        
                        <Button
                            className="btn-export export-item"
                            onClick={() => exportToCSV(data, fileName)}
                            disabled={data ? false : true}
                        >
                            Download File
                        </Button>
                    </div>
                </Input.Group>
            </div>
        )
    }

}

export default Export