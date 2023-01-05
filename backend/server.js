const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const { user, project } = require('./models');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000');
});

const checkUser = async (req, res, next) => {
  const username = req.headers['username'];
  const { id } = req.params;

  const theProject = await project.findByPk(id);

  if (!theProject) return res.status(400).send({ message: 'projeto inexistente' });
  if(theProject.username !== username) return res.status(401).send({ message: 'acesso negado' });

  next();
}

app.post('/users', async (req, res) => {
  const { name, password, username } = req.body;

  // verifica se o usuário já existe

  const test = await user.findOne({ where: { username } });
  if (test) return res.status(400).send({ message: 'usuário já existente' });

  // se não existe insere no banco

  const insertedUser = await user.create({ name, password, username });

  return res.json(insertedUser);
});

app.post('/project', async (req, res) => {
  const { title, zip_code, cost, deadline } = req.body;
  const username = req.headers['username'];

  // verifica se o usuário existe
  const test = await user.findOne({ where: {username} });
  if (!test) return res.status(400).send({ message: 'usuário não encontrado' });

  // se existe cria o projeto
  const createdProject = await project.create({title, zip_code, cost, deadline, username});


  return res.json(createdProject);
});

app.get('/project', async (req, res) => {
  const username = req.headers['username'];
  const allProjects = await project.findAll({ where: { username } });

  return res.json(allProjects);
});

app.get('/project/:id', checkUser, async (req, res) => {
  const { id } = req.params;

  const theProject = await project.findOne({ where: {id} });

  const url = `https://viacep.com.br/ws/${theProject.zip_code}/json/`;

  const {data} = await axios.get(url);
  
  return res.json({...theProject.dataValues, zip_code: `${data.localidade}/${data.uf}`})
});

app.put('/project/:id', checkUser, async (req, res) => {
  const { id } = req.params;
  const { title, zip_code, cost, deadline } = req.body;

  project.update({ title, zip_code, cost, deadline }, { where: { id } }).then(_updated => res.json('atualizado'));
});

app.patch('/project/:id/done', checkUser, async (req, res) => {
  const { id } = req.params;

  project.update({ done: true }, { where: { id } }).then(_updated => res.json('atualizado'));
});

app.delete('/project/:id', checkUser, async (req, res) => {
  const { id } = req.params;

  project.destroy({ where: { id } }).then(_updated => res.json('deletado'));
});


const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, 
  process.env.POSTGRES_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
});

sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Falha ao conectar com o banco de dados:', err);
  });

module.exports = app;