import React, { Component, Fragment } from 'react';
import { Input, Select, Button, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import 'antd/dist/antd.css';
import * as XLSX from "xlsx";
import apis from '../apis';
const { Option } = Select;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
class Import extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bearToken: localStorage.getItem("bearToken") ? localStorage.getItem("bearToken") : null,
            envi: 'URLDEV',
            fileCSV: null,
            data: null,
            dataDiff: null,
            loading: false,
            disable: false,
            disableAll: false
        }
        this.handChangeEnvi = this.handChangeEnvi.bind(this);
        this.handChangeFile = this.handChangeFile.bind(this);
        this.handChangeToken = this.handChangeToken.bind(this);
        this.handleImport = this.handleImport.bind(this)
        this.convertToJson = this.convertToJson.bind(this)
        this.compare2Data = this.compare2Data.bind(this)
        this.compare2Array = this.compare2Array.bind(this)
        this.convertBool = this.convertBool.bind(this)
        this.convertNoneData = this.convertNoneData.bind(this)
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

    convertNoneData(data){
        if(
            data === undefined ||
            data === null ||
            data === ""
        ){
            return null
        }else{
            return data
        }
    }

    handleImport(option) {
        this.setState({
            loading: true
        })
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
                this.compare2Data(option)
            }
            reader.readAsBinaryString(fileCSV[0])
        }

    }
    convertToJson(data) {
        let finalArr = []
        for (let i = 1; i < data.length; i++) {
            let obj = {}
            for (let j = 0; j < data[0].length; j++) {
                obj = { ...obj, [data[0][j]]: this.convertNoneData(data[i][j]) }
            }
            finalArr = [...finalArr, obj]
        }
        return finalArr; //JSON
    }

    compare2Data(option) {
        const { data, envi } = this.state
        if (data == null) return
        const params = ["driver", "vehicle", "vendor"].includes(data[0].contentType) ? { vendorCode: data[0].vendorCode } : { sellerCode: data[0].sellerCode }
        
        // lấy dữ liệu để so sánh với dữ liệu excel
        apis.exportData(envi, params, data[0].contentType)
            .then(data => {
                this.compare2Array(data.data, this.state.data, option)
            })

    }
    compare2Array(arr1, arr2, option) {
        const { data, envi } = this.state
        let diff = []
        if(option == 'all'){
            diff = [...diff, ...arr2]
        }else{
            for (let i = 0; i < arr1.length && i < arr2.length; i++) {
                for (let key in arr2[i]) {

                    // các field ko nên so sánh
                    if (!["createdAt", "updatedAt", "vehicleAbcGroup"].includes(key)) {

                        // xử lí các case dạng array
                        if (["vehicleMapping"].includes(key)) {
                            if (arr2[i][key]) {
                                const arr2Array = arr2[i][key].split(',')
                                if (JSON.stringify(arr1[i][key]) !== JSON.stringify(arr2Array)) {
                                    diff = [...diff, { ...arr2[i], [key]: arr2Array }]
                                }
                            }
                        
                        } else {
                            if (this.convertNoneData(arr1[i][key]) !== this.convertNoneData(arr2[i][key])) {
                                diff = [...diff, arr2[i]]
                                break
    
                            }
                        }
                    }
                }
            }
        }
        
        // update 
        try {
            if (diff.length == 0) {
                message.warning("Nothing to update")
                this.setState({
                    loading: false
                })
            } else {
                diff.forEach(ele => {
                    apis.updateData(envi, null, data[0].contentType + `/${ele._id}`, ele)
                })
                message.success("Update success")
                this.setState({
                    loading: false
                })
            }
        } catch (err) {
            message.error("Update fail")
            this.setState({
                loading: false
            })
        }
        const timeId = setTimeout(() => {
            window.location.reload()
            clearTimeout(timeId)
        }, 3000)
    }

    convertBool(val) {
        return val == "TRUE" ? true : false
    }
    render() {
        const { bearToken, envi, loading,disable, disableAll } = this.state;

        return (
            <Fragment>
                
                <Input.Group compact >
                    <div className="form-export" style={{ display: 'flex' }}>

                        <Select className='export-item' style={{ width: 400 }} defaultValue="dev" value={envi} onChange={this.handChangeEnvi}>
                            <Option value='URLDEV'>DEVELOP</Option>
                            <Option value="URLPROD">PRODUCTION</Option>
                        </Select>

                        <Input multiple={false} type={'file'} accept=".csv,.xlsx,.xls" className='export-item' style={{ width: 400 }} onChange={this.handChangeFile} />
                        <TextArea className='export-item' style={{ width: 400, height: 100 }} onChange={this.handChangeToken} value={bearToken} placeholder="Token Bear" />
                        <Button className="btn-export export-item" 
                            onClick={() => {
                                this.setState({disableAll: true})
                                this.handleImport()
                            }
                        }>
                            <span>Cập nhật phần chỉnh sửa</span>
                            {loading  && !disable && <Spin indicator={antIcon} style={{float: "right"}}/>}
                        </Button>
                        <Button className="btn-export export-item" 
                            onClick={() => {
                                this.setState({disable: true})
                                this.handleImport('all')
                            }}
                        >
                            <span>Cập nhật tất cả</span>
                            {loading  && !disableAll && <Spin indicator={antIcon} style={{float: "right"}}/>}
                        </Button>
                    </div>
                </Input.Group>

                
            </Fragment>
        );
    }
}

Import.propTypes = {

};

export default Import;