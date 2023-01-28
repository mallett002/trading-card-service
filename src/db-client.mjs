import pg from 'pg';

const { Client } = pg;

let client;

const getPgClient = async () => {
    if (!client) {
        try {
            client = new Client({
                host: 'mydbhost',
                port: 5432,
                user: 'postgres',
                password: 'password',
            });

            await client.connect();
        } catch (err) {
            console.log('Error connecting to database: ', err);
        }
    }

    return client;
};

export default getPgClient;
