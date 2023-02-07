import express from 'express';
import getCards from './src/handlers/get-cards.mjs';
import getCard from './src/handlers/get-card.mjs';
import createCard from './src/handlers/create-card.mjs';

// Todo: connect to db: https://node-postgres.com/

const app = express();
app.use(express.json());
const port = 3000;

app.post('/card', createCard);
app.get('/card', getCard);
app.get('/cards', getCards);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});