require("dotenv").config();
const axios = require("axios").default;

module.exports = {
  getImagesByCamera: async (req, res) => {
    try {
      const { rovers, camera, date } = req.body;
      if (camera === "All") {
        const roverPictures = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rovers}/photos?earth_date=${date}&api_key=${process.env.APIKEY}`;
        const response = await axios.get(roverPictures);
        return res.json(response.data);
      } else {
        const roverPictures = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rovers}/photos?camera=${camera}&earth_date=${date}&api_key=${process.env.APIKEY}`;
        const response = await axios.get(roverPictures);
        return res.json(response.data);
      }
    } catch (error) {
      console.error(error);
      return res.json(error);
    }
  },

  getDefaultImages: async (req, res) => {
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    today.toDateString();

    try {
      const roverPictures = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${yesterday
        .toISOString()
        .slice(0, 10)}&api_key=${process.env.APIKEY}`;
      const response = await axios.get(roverPictures);
      return res.json(response.data);
    } catch (error) {
      console.error(error);
      return res.json(error);
    }
  },
};
