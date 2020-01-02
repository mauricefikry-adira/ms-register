
const express = require('express');
const app = express();
const bodyParser = require('body-parser'); //post body handler
const { check, validationResult } = require('express-validator/check'); //form validation
const { matchedDaclta, sanitize } = require('express-validator/filter'); //sanitize form params
const path = require('path');
const crypto = require('crypto');


//Set body parser for HTTP post operation
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//set static assets to public directory
app.use(express.static('public'));

app.get('/', (req, res) => { 
  res.send('Working');
}) 


//Set app config
const port = 3000;
const baseUrl = 'http://localhost:'+port;

const Sequelize = require('sequelize');

const sequelize = new Sequelize('register', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

//Define models
const register = sequelize.define('data_tbs', {    
  id:{    
      type:Sequelize.INTEGER,    
      allowNull:false,    
      primaryKey:true,    
      autoIncrement: true    
  },    
  // attributes    
  nama:Sequelize.STRING,       
  no_hp:Sequelize.BIGINT,      
  contract_no:Sequelize.BIGINT,      
  status_pk_new : Sequelize.STRING,     
  status_register:Sequelize.INTEGER,       
  
}, {
  //prevent sequelize transform table name into plural
  freezeTableName: true,
  timestamps: false,
  tableName: 'data_tbs'
})

/**
* Set Routes for CRUD
*/

//get all registers
app.get('/register', (req, res) => {
  register.findAll().then(register => {
      res.json(register)
  })
})

app.get('/register/:id', (req, res) => {
  register.findOne({where: {id: req.params.id}}).then(register => {
      res.json(register)
  })
})

//post all registers
app.post('/register/', [
  check('id')
        .isLength({ min: 5 })
        .isNumeric()
        .custom(value => {
            return register.findOne({where: {id: value}}).then(b => {
                if(b){
                    throw new Error('Id already in use');
                }            
            })
        }
    ),
  check('nama')
      .isLength({min: 10}),
  check('no_hp')
      .isLength({min: 10})
      .isNumeric(),
  check('contract_no')
      .isLength({min: 5})
      .isNumeric(),
  check('status_pk_new')
   .isLength({min: 5}),
  check('status_register')
   .isLength({min: 1})

],(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
  }

  register.create({
      id: req.body.id,
      nama: req.body.nama,
      no_hp: req.body.no_hp,
      contract_no : req.body.contract_no,
      status_pk_new: req.body.status_pk_new,
      status_register: req.body.status_register
  }).then(newregister => {
      res.json({
          "status":"success",
          "message":"Register added",
          "data": newregister
      })
  })
})



app.listen(port, () => console.log("server berjalan pada http://localhost:3000"))