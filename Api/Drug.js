const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint to fetch drug information
app.get('/api/drugs', async (req, res) => {
  const query = req.query.query;

  // Validate query parameter
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Fetch data from the OpenFDA API (you can replace with another API if needed)
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}`);
    
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

    // Return the formatted drug data
    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching drug information:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching drug information' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
