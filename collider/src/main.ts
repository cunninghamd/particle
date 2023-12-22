import cron from 'node-cron';
import axios from 'axios';
import graphite from 'graphite;

const graphiteClient = graphite.createClient('plaintext://localhost:2003/');

const fetchDataAndLogToGraphite = async () => {
  try {
    const response = await axios.get('https://api.example.com/data');
    const data = response.data;

    // Log data to Graphite
    if (data) {
      graphiteClient.write({ yourGraphiteMetricPath: data });
    }
  } catch (error) {
    console.error('Error fetching or logging data:', error.message);
  }
};

// Schedule task to run every minute
cron.schedule('* * * * *', fetchDataAndLogToGraphite);