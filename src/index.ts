import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';

const app = express();

app.use(cors({ origin: true }));

app.get('/', (req, res) => res.send('hello from index'));
app.get('/countries', (req, res) => res.send('hello from countries!'));
app.get('/cities', (req, res) => res.send('hello from cities!'));

export const api = functions.https.onRequest(app);
