require("dotenv").config();
const axios = require("axios").default;

module.exports = {
  getImagesByCamera: async (req, res) => {
    try {
      const { rovers, camera, date } = req.query;
      const roverPictures = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rovers}/photos?camera=${camera}&earth_date=${date}&api_key=${process.env.APIKEY}`;
      const response = await axios.get(roverPictures);
      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.json(error);
    }
  },

  getDefaultImages: async (req, res) => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
  
    today = yyyy + '-' + mm + '-' + dd 

    try {
      const roverPictures = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${today}&api_key=${process.env.APIKEY}`;
      const response = await axios.get(roverPictures);
      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.json(error);
    }
  },
};
