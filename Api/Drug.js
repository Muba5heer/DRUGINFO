const axios = require('axios');

module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}`);
    
    if (response.data.results && response.data.results.length > 0) {
      const drugs = response.data.results.map(drugData => ({
        brandName: drugData.openfda.brand_name ? drugData.openfda.brand_name[0] : 'N/A',
        genericName: drugData.openfda.generic_name ? drugData.openfda.generic_name[0] : 'N/A',
        drugClass: drugData.openfda.pharm_class_epc ? drugData.openfda.pharm_class_epc[0] : 'N/A',
        dosageForms: drugData.dosage_and_administration || 'N/A',
        uses: drugData.indications_and_usage || 'N/A',
        sideEffects: drugData.adverse_reactions || 'N/A',
        pharmacology: drugData.clinical_pharmacology || 'N/A',
      }));
      return res.json(drugs);
    } else {
      return res.status(404).json({ message: 'Drug not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error fetching drug information' });
  }
};
