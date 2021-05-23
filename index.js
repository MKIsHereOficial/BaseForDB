const express = require('express'), app = express();
const bodyParser = require('body-parser');
const APP_PORT = process.env.PORT || 3000;

const path = require('path');

const Database = require('./database.js');

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.json());

app.use(bodyParser.json({ strict: false, type: '*/*' }));

app.get('/', async (req, res) => {
  const db = await Database('chars');

  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

function defaultHeaders(r = express.response) {
  r.setHeader("Access-Control-Allow-Origin", "*");
  //r.setHeader("accet", "application/json");
}

app.get('/database', async (req, res) => {
  const dbName = (req.params && req.params['database']) ? req.params['database'] : "default";
  res.json(await Database(dbName));
});
app.get('/database/:database', async (req, res) => {
  const { database } = req.params;
  const db = await Database(database);
  defaultHeaders(res);
  res.json(db);
});
app.get('/database/:database/all', async (req, res) => {
  const { database } = req.params;
  const db = await Database(database);

  console.dir(await db.getAll());
  defaultHeaders(res);

  res.json({ all: await db.getAll(), db });
});
app.get('/database/:database/:key', async (req, res) => {
  const { database, key } = req.params;

  if (!database) return res.json({err: 'Nenhum valor DatabaseName (?database) foi entregue.'});
  if (!key) return res.json({err: 'Nenhuma chave (?key) foi entregue. Não há documento sem chave.'});


  const db = await Database(database);
  defaultHeaders(res);

  var obj = await db.exists(key);
  obj = (obj.exists != false) ? await db.get(key) : false;

  if (!obj && req.query['createIfNull']) obj = await db.set(key, key);

  res.json(obj);
});
app.get('/database/:database/:key/set', async (req, res) => {defaultHeaders(res)});
app.post('/database/:database/:key/set', async (req, res) => {
  defaultHeaders(res);
  const { database, key } = req.params;

  if (!database) return res.json({err: 'Nenhum valor DatabaseName (?database) foi entregue.'});
  if (!key) return res.json({err: 'Nenhuma chave (?key) foi entregue. Não há documento sem chave.'});

  const db = await Database(database.toLowerCase());

  var value = {};

  console.dir(req.body);
  if (req.body && req.body['id']) value = req.body;

  obj = await db.set(key, value);

  console.log(`[database/${database.toLowerCase()}/${key}]`, `O Documento foi setado com o valor ${JSON.stringify(value)}.`);

  res.json(obj);
});
app.get('/database/:database/:key/exists', async (req, res) => {
  const { database, key } = req.params;
  
  if (!database) return res.json({err: 'Nenhum valor DatabaseName (?database) foi entregue.'});
  if (!key) return res.json({err: 'Nenhuma chave (?key) foi entregue. Não há documento sem chave.'});

  const db = await Database(database);
  defaultHeaders(res);

  var obj = await db.exists(key);

  console.dir(obj);

  res.json(obj);
});
app.get('/database/:database/:key/dl', async (req, res) => {
  const { database, key } = req.params;
  
  if (!database) res.json({err: 'Nenhum valor DatabaseName (?database) foi entregue.'});
  if (!key) res.json({err: 'Nenhuma chave (?key) foi entregue. Não há documento sem chave.'});

  if (!key || !database) return console.dir(req.params);

  const db = await Database(database);
  defaultHeaders(res);

  console.dir(key)

  var obj = await db.del(key);

  console.log(`[database/${database.toLowerCase()}/${key}]`, `O Documento foi deletado.`);
  console.dir(obj);

  res.json(obj);
});

app.listen(APP_PORT || 3000, () => {
  console.log(`Servidor iniciado na porta ${APP_PORT}`);
});
