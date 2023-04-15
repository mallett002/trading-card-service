import getPgClient from '../db-client.mjs';
import { createCardInsert } from '../../queries.js';

const createCard = async (req, res) => {
    const userId = req.get('user_id');
    const client = getPgClient();

    let result = null;

    try {
        const cardDTO = {
            ...req.body,
            userId
        };

        result = await client.query(createCardInsert(cardDTO));
    } catch (error) {
        console.log('Error creating card ', error);

        return res.status(500).send(error);
    }
    
    return res.status(201).send(result.records[0]);
};

export default createCard;
