require("dotenv").config();
const axios = require("axios").default;

module.exports = {
  getRandomImages: async (req, res) => {
    try {
      const apod = `https://api.nasa.gov/planetary/apod?count=5&api_key=${process.env.APIKEY}`;
      const response = await axios.get(apod);
      return res.json(response.data);
    } catch (error) {
      console.error(error.message);
      return res.json(error.message);
    }
  },
};
