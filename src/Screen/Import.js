import React, { Component } from 'react';
import { Input, Select, Button, message, Spin } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import * as XLSX from "xlsx";
import apis from '../apis';
import { callApi } from '../utils/callApi';
import { LoadingOutlined } from '@ant-design/icons';
const { Option } = Select;


class Import extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bearToken: localStorage.getItem("bearToken") ? localStorage.getItem("bearToken") : null,
            envi: 'URLDEV',
            fileCSV: null,
            data: null,
            dataDiff: null
        }
        this.handChangeEnvi = this.handChangeEnvi.bind(this);
        this.handChangeFile = this.handChangeFile.bind(this);
        this.handChangeToken = this.handChangeToken.bind(this);
        this.handleImport = this.handleImport.bind(this)
        this.convertToJson = this.convertToJson.bind(this)
        this.compare2Data = this.compare2Data.bind(this)
        this.compare2Array = this.compare2Array.bind(this)
        this.convertBool = this.convertBool.bind(this)
    }
    handChangeEnvi(value) {
        this.setState({
            envi: value
        })
    }
    handChangeFile(value) {
        this.setState({
            fileCSV: value.target.files
        })

    }
    handChangeToken(value) {
        this.setState({
            bearToken: value.target.value
        })
        localStorage.setItem("bearToken", value.target.value)
    }

    handleImport() {
        const { bearToken, fileCSV } = this.state;

        if (fileCSV && bearToken) {

            const reader = new FileReader()
            reader.onload = (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });

                this.setState({ data: this.convertToJson(data) });
                this.compare2Data()
            }
            reader.readAsBinaryString(fileCSV[0])
        }

    }
    convertToJson(csv) {
        var lines = csv.split("\n");

        var result = [];

        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(",");

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);
        }


        return result; //JSON
    }

    compare2Data() {
        const { data, envi } = this.state
        if (data == null) return
        const params = {
            contentType: data[0].contentType,
            sellerCode: data[0].sellerCode
        }

        apis.exportData(envi, params, data[0].contentType)
            .then(data => {
                this.compare2Array(data.data, this.state.data)
            })

    }
    compare2Array(arr1, arr2) {
        let diff = []
        for (let i = 0; i < arr1.length; i++) {
            for (let j = 0; j < arr2.length; j++) {
                if (arr1[i]._id == arr2[j]._id) {
                    let obj = arr1[i]
                    let diffFlag = false
                    for (let key in arr1[i]) {
                        if (key != "createdAt" && key != "updatedAt") {
                            if (typeof arr1[i][key] == "boolean") {
                                if (arr1[i][key] != this.convertBool(arr2[i][key])) {
                                    obj = {...obj, [key]: this.convertBool(arr2[i][key])}
                                    diffFlag = true
                                }
                            } else {
                                if (arr1[i][key] != arr2[i][key]) {
                                    obj = {...obj, [key]: arr2[i][key]}
                                    diffFlag = true
                                }
                            }
                        }
                    }
                    diffFlag && diff.push(obj)
                    break
                }
            }
        }
        const {envi,data } = this.state
        try{
            if(diff.length == 0){
                message.warning("Nothing to update")
            }else{
                diff.forEach(ele => {
                    apis.updateData(envi, null,data[0].contentType + `/${ele._id}`, ele )
                })
                message.success("Update success")
            }
        }catch(err){
            message.error("Update fail")
        }
    }

    convertBool(val) {
        return val == "TRUE" ? true : false
    }
    render() {
        const { bearToken, envi} = this.state;

        return (
            <div className='container'>
                <Input.Group compact >
                    <div className="form-export" style={{ display: 'flex' }}>

                        <Select className='export-item' style={{ width: 400 }} defaultValue="dev" value={envi} onChange={this.handChangeEnvi}>
                            <Option value='URLDEV'>DEVELOP</Option>
                            <Option value="URLPROD">PRODUCTION</Option>
                        </Select>

                        <Input multiple={false} type={'file'} accept=".csv,.xlsx,.xls" className='export-item' style={{ width: 400 }} onChange={this.handChangeFile} />
                        <TextArea className='export-item' style={{ width: 400, height: 100 }} onChange={this.handChangeToken} value={bearToken} placeholder="Token Bear" />
                        <Button className="btn-export export-item" onClick={this.handleImport}>
                            Import File CSV
                        </Button>
                    </div>
                </Input.Group>

            </div>
        );
    }
}

Import.propTypes = {

};

export default Import;