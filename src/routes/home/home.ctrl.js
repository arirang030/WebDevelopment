"use strict";

const User = require('../../models/User');

const output = {
  // 컨트롤러 함수
  map: (req, res) => {
    res.render('home/map');
  },
  login: (req, res) => {
    res.render('home/login');
  },
  register: (req, res) => {
    res.render("home/register");
  },
};

const process = {
  login: async (req, res) => {
    const user = new User(req.body);
    const response = await user.login();
    
    const url = {
      method: "POST",
      path: "/login",
      status: response.err ? 400 : 200,
    };

    return res.status(url.status).json(response);
  },

  register: async (req, res) => {
    const user = new User(req.body);
    const response = await user.register();
    
    const url = {
      method: "POST",
      path: "/register",
      status: response.err ? 409 : 201,
    };

    return res.status(url.status).json(response);
  },
};

module.exports = {
  output,
  process
};
