import { callApi } from "../utils/callApi"
import {END_POINT} from "../constains/apiConfig"

const apis = {
    async exportData(envi, params, endpoint){
        const callData = await callApi(envi, params, END_POINT + `/${endpoint}` + "/count") 
        const param =  {
            ...params,
            _limit: callData.data.count
        }
        return callApi(envi, param, END_POINT + `/${endpoint}`)
    },
    updateData(envi, params, endpoint, data){
        callApi(envi, null, END_POINT + `/${endpoint}`, "PUT", data)
    }
    
}

export default apis