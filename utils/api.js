const axios = require('axios');

const baseURL = 'http://89.40.2.236:3033'

const api = axios.create({
  baseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
});

module.exports = api;