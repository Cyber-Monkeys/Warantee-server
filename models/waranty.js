var Sequelize = require('sequelize');
var supersecret = require('../config');
var sequelize = new Sequelize('Warantee', 'root', supersecret.dbPassword, {
  host: 'localhost',
  dialect: 'mysql',
});


var Waranty = sequelize.define('Waranty', {
  uid: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  date: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  category: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  warantyPeriod: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  sellerName: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  sellerPhone: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  sellerEmail: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  location: {
    type: Sequelize.TEXT,
    allowNull:false,
  }
}, {
  freezeTableName: true
});

//Waranty.sync({force: true}).then(function () {
//  Waranty.create({
//    uid: 'u123',
//    date: '12/09/2019',
//    amount: 9000,
//    category: 0,
//    warantyPeriod: 90,
//    sellerName: 'John Doe',
//    sellerPhone: '0509232342',
//    sellerEmail: 'wat@gmail.com',
//    location: 'My house'
//  });
//  return 'default waranty created';
//});

module.exports = Waranty;
