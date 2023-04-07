export const createTablesSql = `
    CREATE TABLE IF NOT EXISTS CARD (
        ID                      SERIAL PRIMARY KEY,
        USER_ID                 UUID NOT NULL,
        BRAND                   VARCHAR(50) NOT NULL,
        CARD_NUMBER             INT,
        LAST                    VARCHAR(20),
        FIRST                   VARCHAR(20)
    );
`;
