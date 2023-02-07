import getPgClient from '../db-client.mjs';
import { selectCardById } from '../../queries.js';

const getCard = async (req, res) => {
    const cardId = req.params.id;
    
    const client = getPgClient();

    let result = null;

    try {
        result = await client.query(selectCardById(cardId));
        const foundCard = result.records[0];

        if (!foundCard) {
            return res.status(404).send();
        }

    } catch (error) {
        console.log('Error creating card ', error);
    }
    
    return res.status(200).send(result.records[0]);
};

export default getCard;
