export const createCardInsert = (cardDTO) => {
    return `
        INSERT INTO CARD (BRAND, CARD_NUMBER, LAST, FIRST)
        VALUES ('${cardDTO.brand}', ${cardDTO.cardNumber}, '${cardDTO.last}', '${cardDTO.first}')
        RETURNING ID`;
};
