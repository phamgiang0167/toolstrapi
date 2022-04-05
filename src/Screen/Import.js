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
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                this.setState({ data: this.convertToJson(data) });
                this.compare2Data()
            }
            reader.readAsBinaryString(fileCSV[0])
        }

    }
    convertToJson(data) {
        let finalArr = []
        for (let i = 1; i < data.length; i++) {
            let obj = {}
            for (let j = 0; j < data[0].length; j++) {
                if (data[i][j] !== "") {
                    obj = { ...obj, [data[0][j]]: data[i][j] }
                }
            }
            finalArr = [...finalArr, obj]
        }
        return finalArr; //JSON
    }

    compare2Data() {
        const { data, envi } = this.state
        if (data == null) return
        const params = ["driver", "vehicle", "vendor"].includes(data[0].contentType) ? { vendorCode: data[0].vendorCode } : { sellerCode: data[0].sellerCode }

        apis.exportData(envi, params, data[0].contentType)
            .then(data => {
                this.compare2Array(data.data, this.state.data)

            })

    }
    compare2Array(arr1, arr2) {
        const { data, envi } = this.state

        let diff = []
        for (let i = 0; i < arr1.length && i < arr2.length; i++) {
            delete arr2[i]["vehicleAbcGroup"] 
            for (let key in arr1[i]) {
                if (!["createdAt", "updatedAt", "vehicleAbcGroup"].includes(key)) {
                    if (["vehicleMapping"].includes(key)) {
                        if (arr2[i][key]) {
                            const arr2Array = arr2[i][key].split(',')
                            if (JSON.stringify(arr1[i][key]) != JSON.stringify(arr2Array)) {
                                diff = [...diff, { ...arr2[i], [key]: arr2Array }]
                            }
                        }

                    } else {
                        if (arr1[i][key] != arr2[i][key]) {
                            diff = [...diff, arr2[i]]
                            break

                        }
                    }




                }
            }
        }
        console.log(diff)
        try {
            if (diff.length == 0) {
                message.warning("Nothing to update")
            } else {
                diff.forEach(ele => {
                    apis.updateData(envi, null, data[0].contentType + `/${ele._id}`, ele)
                })
                message.success("Update success")
            }
        } catch (err) {
            message.error("Update fail")
        }
    }

    convertBool(val) {
        return val == "TRUE" ? true : false
    }
    render() {
        const { bearToken, envi } = this.state;

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