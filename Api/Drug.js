const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Apply rate limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // Limit each IP to 100 requests per minute
});
app.use(limiter);

// Default route to test API health
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Drug Information API!' });
});

// Drug information endpoint
app.get('/api/drugs', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Configure Axios with a timeout
    const axiosInstance = axios.create({ timeout: 10000 }); // 10 seconds timeout
    const response = await axiosInstance.get(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}`
    );

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ message: 'No drug information found' });
    }

    const formattedResults = response.data.results.map(drug => ({
      brandName: drug.openfda.brand_name ? drug.openfda.brand_name[0] : 'N/A',
      genericName: drug.openfda.generic_name ? drug.openfda.generic_name[0] : 'N/A',
      drugClass: drug.openfda.pharm_class_epc ? drug.openfda.pharm_class_epc[0] : 'N/A',
      dosageForms: drug.dosage_and_administration || 'N/A',
      uses: drug.indications_and_usage || 'N/A',
      sideEffects: drug.adverse_reactions || 'N/A',
      pharmacology: drug.clinical_pharmacology || 'N/A'
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching drug information:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Request timeout, please try again' });
    } else if (error.response) {
      res.status(error.response.status).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Set port for local testing or Vercel deployment
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; // Required for Vercel
