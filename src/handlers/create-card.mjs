import getPgClient from '../db-client.mjs';
import { createCardInsert } from '../../queries.js';

const createCard = async (req, res) => {
    const client = getPgClient();

    let result = null;

    try {
        result = await client.query(createCardInsert(req.body));
    } catch (error) {
        console.log('Error creating card ', error);
    }
    
    return res.status(201).send(result.records[0]);
};

export default createCard;
