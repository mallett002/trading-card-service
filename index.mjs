import express from 'express';
import getPgClient from './src/db-client.mjs';
import getCards from './src/handlers/get-cards.mjs';
import getCard from './src/handlers/get-card.mjs';
import createCard from './src/handlers/create-card.mjs';

const app = express();
const port = 80;

app.use(express.json());

app.post('/card', createCard);
app.get('/card/:id', getCard);
app.get('/cards', getCards);

app.listen(port, () => {
  console.log('Connecting to the database...');
  getPgClient();
  console.log(`Example app listening on port ${port}`)
});