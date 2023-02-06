import getPgClient from '../db-client.mjs';

const createCard = async (req, res) => {
    const client = await getPgClient();

    // auto
    // id, sport, manufacturer, brand, set, card_number,  serial_number, last, first
    /*
    CREATE TABLE CARD (
        ID                      SERIAL PRIMARY KEY,
        SPORT                   CHAR(20) NOT NULL,
        YEAR                    INT NOT NULL,
        MANUFACTURER            CHAR(50) NOT NULL,
        BRAND                   CHAR(50) NOT NULL,
        SET                     CHAR(50),
        CARD_NUMBER             INT,
        SERIAL                  CHAR(20),
        LAST                    CHAR(20),
        FIRST                   CHAR(20)
    );
    */
    const payload = req.body;

    console.log({req});

    let result = null;

    try {
        result = await client.query(createCardInsert(payload));

        console.log(result.records[0]);
    } catch (error) {
        console.log('Error creating card ', error);
    }
    
    res.status(201).send(result.records[0]);
};

export default createCard;
