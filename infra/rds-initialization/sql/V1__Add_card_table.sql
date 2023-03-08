CREATE TABLE IF NOT EXISTS CARD (
    ID                      SERIAL PRIMARY KEY,
    BRAND                   VARCHAR(50) NOT NULL,
    CARD_NUMBER             INT,
    LAST                    VARCHAR(20),
    FIRST                   VARCHAR(20)
);
