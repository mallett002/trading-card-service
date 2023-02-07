import getPgClient from '../db-client.mjs';
import { createCardInsert } from '../../queries.js';

const createCard = async (req, res) => {
    const client = await getPgClient();

    /*
    CREATE TABLE CARD (
        ID                      SERIAL PRIMARY KEY,
        BRAND                   CHAR(50) NOT NULL,
        CARD_NUMBER             INT,
        LAST                    CHAR(20),
        FIRST                   CHAR(20)
    );
    */
    let result = null;

    try {
        result = await client.query(createCardInsert(req.body));

        console.log(result.records[0]);
    } catch (error) {
        console.log('Error creating card ', error);
    }
    
    return res.status(201).send(result.records[0]);
};

export default createCard;
