const express = require('express');
const { readFile, getPeopleId, postPeople, putPeople, deletePeople } = require('./talker');
const requestToken = require('./services/requestToken');
const emailOK = require('./services/emailOk');
const passwordOK = require('./services/passwordOk');
const tokenAuth = require('./services/auth'); 
const nameReq = require('./services/name');
const rateReq = require('./services/rate');
const watchedAtReq = require('./services/watchedAt');
const ageReq = require('./services/age');
const talkReq = require('./services/talk');

const app = express();
app.use(express.json());

const HTTP_OK_STATUS = 200;
const HTTP_ERROR_STATUS = 400;
const PORT = process.env.PORT || '3001';

// -------------------------------------------------------------------------------
app.get('/talker', async (req, res) => {
  try {
    const data = await readFile();
    if (!data.length) {
      return res.status(HTTP_OK_STATUS).json([]);
    }
    return res.status(HTTP_OK_STATUS).json(data);
  } catch (error) {
    console.error('Erro na rota /talker:', error);
    return res.status(HTTP_ERROR_STATUS).json({ error: error.message });
  }
});
// -------------------------------------------------------------------------------
app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talking = await getPeopleId(id);
  if (talking) {
    return res.status(200).json(talking);
  }
  return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
});
// ------------------------------------------------------------------------------
app.post('/login', passwordOK, emailOK, async (req, res) => {
  const token = requestToken();
  const response = {
    success: true,
    message: 'Login successful',
    token,
  };
  return res.status(200).json(response);
});
// -------------------------------------------------------------------------------

app.post('/talker',
  tokenAuth, 
  nameReq, 
  ageReq, 
  talkReq, 
  watchedAtReq, 
  rateReq, 
  async (req, res) => {
    const { name, age, talk } = req.body;
    const data = await readFile();
    const newId = data.length + 1;

    const newTalker = { 
      id: newId, 
      name, 
      age, 
      talk,
    };

    await postPeople(newTalker);
    return res.status(201).json(newTalker);
  });
//-------------------------------------------------------------------------------
app.put('/talker/:id',
  tokenAuth, 
  nameReq, 
  ageReq, 
  talkReq, 
  watchedAtReq, 
  rateReq, 
  async (req, res) => {
    const id = Number(req.params.id);
    const data = req.body;
    const newTalk = { id, ...data };
    const talkPut = await putPeople(newTalk, id);
    if (!talkPut) {
      return res.status(404).json({
        message: 'Pessoa palestrante não encontrada',
      });
    }
    return res.status(200).json(newTalk);
  });
//-------------------------------------------------------------------------------
app.delete('/talker/:id',
  tokenAuth,
  async (req, res) => {
    const id = Number(req.params.id);
    await deletePeople(id);
    return res.status(204).end();
  });
//-------------------------------------------------------------------------------
// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
