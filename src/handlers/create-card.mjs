import getPgClient from '../db-client.mjs';

const createCard = async (req, res) => {
    const client = await getPgClient();

    res.send('creating a card');
};

export default createCard;
