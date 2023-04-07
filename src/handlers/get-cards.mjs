import getPgClient from '../db-client.mjs';

const validKeys = ['brand', 'userId', 'cardNumber', 'lastName', 'firstName'];
const paramsToColumns = {
    brand: 'BRAND',
    userId: 'USER_ID',
    cardNumber: 'CARD_NUMBER',
    lastName: 'LAST',
    firstName: 'FIRST'
};

const buildQueryParams = (query) => {
    let queryString = 'SELECT * FROM CARD';
    const keys = Object.keys(query);

    keys.forEach((key, i) =>  {
        if (!validKeys.includes(key)) {
            throw new Error(`Params must be one of: ${validKeys}`);
        }

        if (i === 0) {
            queryString += ` WHERE ${paramsToColumns[key]} = :${key}`;
        } else {
            queryString += ` AND ${paramsToColumns[key]} = :${key}`;
        }

        if (key === 'userId') {
            queryString += '::uuid';
        }
    });

    return queryString += ';';
};

const buildQueryValues = (query) => 
    Object.keys(query).map((key) => ({[key]: query[key]}));

const getCards = async (req, res) => {
    let queryString;

    try {
        queryString = buildQueryParams(req.query);
    } catch (error) {
        return res.status(400).send(error.message);
    }

    const queryValues = buildQueryValues(req.query);
    const client = getPgClient();

    let result = null;

    try {
        result = await client.query({
            sql: queryString,
            parameters: queryValues
        });

        return res.status(200).json({ cards: result.records });
    } catch (error) {
        console.log('Error querying cards ', error);
    }
};

export default getCards;
