import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import Cookie from 'js-cookie';

import Router from 'next/router';
 
const apiClient = axios.create({

  baseURL: process.env.NEXT_PUBLIC_IDENTITY_API_BASE_URL,

  headers: {

    'Content-Type': 'application/json',

  },

});
 
// Request interceptor to attach token from cookie

apiClient.interceptors.request.use(

  (config) => {

    const token = Cookie.get('token'); // get token from js-cookie
 
    if (token) {

      config.headers['Authorization'] = `Bearer ${token}`;

    }
 
    return config;

  },

  (error) => Promise.reject(error)

);
 
// Response interceptor to handle errors globally

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookie.remove('token'); // optional: remove token on 401
      Router.push('/login');
    } 
    return Promise.reject(error);
  }
);
 
// HTTP method wrappers

const get = <T>(url: string, config?: AxiosRequestConfig) =>

  apiClient.get<T>(url, config).then((res) => res.data);
 
const post = <T, U = unknown>(url: string, data?: U, config?: AxiosRequestConfig) =>

  apiClient.post<T>(url, data, config).then((res) => res.data);
 
const put = <T, U = unknown>(url: string, data?: U, config?: AxiosRequestConfig) =>

  apiClient.put<T>(url, data, config).then((res) => res.data);
 
const del = <T>(url: string, config?: AxiosRequestConfig) =>

  apiClient.delete<T>(url, config).then((res) => res.data);
 
export const api = {

  get,

  post,

  put,

  delete: del,
 };