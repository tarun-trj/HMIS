import { useState, useEffect } from "react";
import axios from "axios";

const useTest = () => {
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // const apiUrl = import.meta.env.VITE_API_URL; we'll use this when we have deployed the server ensure server url does not get exposed
    axios
      .get(`${import.meta.env.VITE_API_URL}/tests/all`) // Fetching from your backend API
      .then((response) => {
        setTestData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { testData, loading, error };
};

export default useTest;
