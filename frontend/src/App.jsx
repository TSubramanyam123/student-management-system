
import { useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import api, { errorMessage } from "./services/api";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });
      onLogin(data);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="auth-card">
      <h1>Student Management</h1>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>New user? <Link to="/register">Register here</Link></p>
    </div>
  );
}

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });
      setSuccess("Registration successful. You can now log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="auth-card">
      <h1>Create Account</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={submit}>
        <label>Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          minLength={2}
          maxLength={100}
          required
        />
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password (at least 8 characters)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={128}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("access_token")
  );

  function onLogin(data) {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    window.location.href = "/login";
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login onLogin={onLogin} />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="*"
        element={
          !token ? <Navigate to="/login" replace /> : (
            <div className="app-shell">
              <header className="navbar">
                <Link to="/" className="brand">Student Management</Link>
                <nav>
                  <Link to="/">Dashboard</Link>
                  <Link to="/students">Students</Link>
                  <Link to="/courses">Courses</Link>
                  <button className="secondary" onClick={logout}>
                    Logout
                  </button>
                </nav>
              </header>
              <main className="container">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          )
        }
      />
    </Routes>
  );
}
