const mongoose = require('mongoose');
const vars = require('../../globalvars')
const userModel = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
mongoose.connect(vars.monoguri)

exports.login = function(req, res) {
  var email = req.body.email;
  var pass = req.body.password;
  userModel.findOne({"email":email}, 'password email _id username', function(err, user) {
    if (err) console.log(err);
    bcrypt.compare(pass, user.password, function (err, resd) {
      if (resd) {
        const token = jwt.sign({
          id: user.id,
          email: email,
          username: user.username
        }, vars.jwtsecret)
        res.cookie("token", token)
        if (req.headers['content-type'] === "application/x-www-form-urlencoded") res.redirect('/')
        else res.json({status:"success", token: token})
      } else {
        if (req.headers['content-type'] === "application/x-www-form-urlencoded") res.redirect('/')
        else res.status(401).json({status:"fail"})
      }
    });
  })
};

exports.verify = function(req, res) {
  let token = null
  if (req.body.token) token = jwt.verify(req.body.token, vars.jwtsecret)
  if (token) res.json({status: "success", user: token})
  else res.json({
    status: "fail"
  })
};

exports.internalVerify = function(token) {
  var ttoken = null
  if (token) ttoken = jwt.verify(token, vars.jwtsecret)
  if (ttoken) return true
  else return false
}

exports.getToken = function(token) {
  var ttoken = null
  if (token) ttoken = jwt.verify(token, vars.jwtsecret)
  if (ttoken) return ttoken
  else return {}
}