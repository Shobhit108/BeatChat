import axios from "axios";

export const searchSongs = async (req, res) => {
  try {

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        message: "Query required",
      });
    }

    const response = await axios.get(
      `https://deezerdevs-deezer.p.rapidapi.com/search?q=${q}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host":
            "deezerdevs-deezer.p.rapidapi.com",
        },
      }
    );

    res.status(200).json(response.data.data);

  } catch (error) {

  console.log(
    error.response?.data || error.message
  );

  res.status(500).json({
    message: "Failed to fetch songs",
  });
}
};