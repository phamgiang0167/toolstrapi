import axios from 'axios';
import {URLDEV, URLPROD} from "../constains/apiConfig";
export const callApi = (environment, params, endpoint, method = 'GET', data = null) => {
    
  return axios({
    url: `${environment == "URLDEV" ? URLDEV : URLPROD }/${endpoint}`,
    method,
    data,
    params,
    headers: {'Authorization': "Bearer " + localStorage.getItem("bearToken")}
  });
};

