import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// lấy top phim
export const getTopMovies = () => {
  return API.get("/movies/top");
};