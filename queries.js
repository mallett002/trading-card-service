export const createCardInsert = (cardDTO) =>
        `INSERT INTO CARD (BRAND, CARD_NUMBER, LAST, FIRST)
        VALUES ('${cardDTO.brand}', ${cardDTO.cardNumber}, '${cardDTO.last}', '${cardDTO.first}')
        RETURNING ID`;

export const selectCardById = (cardId) =>
    `SELECT * FROM CARD WHERE ID = ${cardId}`;