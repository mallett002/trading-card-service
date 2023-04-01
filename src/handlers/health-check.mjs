import getPgClient from '../db-client.mjs';

const healthCheck = async (req, res) => {
    const client = getPgClient();

    let postgresHealthy = null;

    try {
        await client.query('SELECT');
    
        postgresHealthy = true;
      } catch (err) {
        console.log({err});
        postgresHealthy = false;
      }

    res.status(200).json({
      postgresHealthy
    });
};

export default healthCheck;
