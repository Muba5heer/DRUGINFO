const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/drugs', async (req, res) => {
  const query = req.query.query; // Get the search query from the request
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // Fetch data from OpenFDA API (you can replace this with any other API you want to use)
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}`);
    const drugs = response.data.results || [];
    const formattedResults = drugs.map(drug => ({
      brandName: drug.openfda.brand_name ? drug.openfda.brand_name[0] : 'N/A',
      genericName: drug.openfda.generic_name ? drug.openfda.generic_name[0] : 'N/A',
      drugClass: drug.openfda.pharm_class_epc ? drug.openfda.pharm_class_epc[0] : 'N/A',
      dosageForms: drug.dosage_and_administration || 'N/A',
      uses: drug.indications_and_usage || 'N/A',
      sideEffects: drug.adverse_reactions || 'N/A',
      pharmacology: drug.clinical_pharmacology || 'N/A',
    }));
    res.json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching drug information' });
  }
});

// Listen on port 3000 or the environment-defined port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
