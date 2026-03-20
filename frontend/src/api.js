import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api`
    : '/api',
  withCredentials: true
})

export default api
