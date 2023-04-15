import getPgClient from '../db-client.mjs';

const healthCheck = async (req, res) => {
    const client = getPgClient();

    try {
        await client.query('SELECT');
    
        return res.status(200).json({
            postgresHealthy: true
        });

      } catch (err) {
        return res.status(500).json({
            postgresHealthy: false
        });
      }
};

export default healthCheck;
