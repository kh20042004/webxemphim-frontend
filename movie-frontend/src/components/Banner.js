import { useEffect, useState } from "react";
import { getTopMovies } from "../services/api";

function Banner() {
  const [movies, setMovies] = useState([]);
  const [index, setIndex] = useState(0);

  // load data
  useEffect(() => {
    getTopMovies().then(res => {
      setMovies(res.data);
    });
  }, []);

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % movies.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [movies]);

  if (movies.length === 0) return <h2>Loading...</h2>;

  const movie = movies[index];

  return (
    <div style={{ position: "relative" }}>
      <img
        src={movie.thumbnail}
        alt=""
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover"
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          color: "white"
        }}
      >
        <h1>{movie.title}</h1>
        <p>{movie.description}</p>
      </div>
    </div>
  );
}

export default Banner;