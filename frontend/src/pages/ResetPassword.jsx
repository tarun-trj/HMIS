import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setTimeout(() => navigate("/login"), 2000); // Redirect after 2s
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="reset-container">
      <form onSubmit={handleReset}>
        <h2>Reset Your Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
