
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../services/api";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/students"),
      api.get("/courses"),
    ])
      .then(([studentResponse, courseResponse]) => {
        setStudents(studentResponse.data);
        setCourses(courseResponse.data);
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <p>Welcome to the Student Management System.</p>
      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="stat-card">
          <span>Total Students</span>
          <strong>{students.length}</strong>
          <Link to="/students">Manage students →</Link>
        </div>
        <div className="stat-card">
          <span>Available Courses</span>
          <strong>{courses.length}</strong>
          <Link to="/courses">Manage courses →</Link>
        </div>
      </div>

      <h2>Recent Students</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Department</th></tr>
          </thead>
          <tbody>
            {students.slice(0, 5).map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.department}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="3">No students added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
