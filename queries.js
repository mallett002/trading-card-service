export const createCardInsert = (cardDTO) => {
    return `INSERT INTO CARD (
        SPORT, YEAR, MANUFACTURER, BRAND, SET, CARD_NUMBER, SERIAL, LAST, FIRST
       ) VALUES ('${cardDTO.sport}', ${cardDTO.year}, '${cardDTO.manufacturer}', '${cardDTO.brand}', '${cardDTO.set}', ${cardDTO.cardNumber}, ${cardDTO.serial}, '${cardDTO.last}', '${cardDTO.first}')
       RETURNING ID`;
};

export const query = `INSERT INTO CARD (
    SPORT, YEAR, MANUFACTURER, BRAND, SET, CARD_NUMBER, SERIAL, LAST, FIRST
   ) VALUES ('Baseball', 2014, 'Topps Co.', 'Topps Heritage Minors', '2014 Topps Heritage Minors', 173, null, 'Judge', 'Aaron')
   RETURNING ID`;
