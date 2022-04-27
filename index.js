/**
 * @name converter
 * @version v0.0.1
 * @license GPL-2.0
 * @author ipincamp <support@nur-arifin.my.id>
 */

import express from 'express';
import fileUpload from 'express-fileupload';
import { remover } from './libs/utils.js';
import putToken from './libs/putToken.js';
import getToken from './libs/getToken.js';

const app = express();

setInterval(() => {
  remover();
}, 1000);

app.use(express.static('public'));
app.use(fileUpload({
  abortOnLimit: true,
  limits: {
    files: 2,
    fileSize: 100 * 1024 * 1024,
  },
}));

app.get('/', (req, res) => res.sendStatus(200));
app.get('/tokens', (req, res) => putToken(req, res));
app.post('/token', (req, res) => getToken(req, res));

app.listen(process.env.PORT || 8000);
