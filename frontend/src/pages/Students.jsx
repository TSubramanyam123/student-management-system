
import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  course: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadStudents() {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function edit(student) {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      course: student.course,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, form);
        setMessage("Student updated successfully.");
      } else {
        await api.post("/students", form);
        setMessage("Student created successfully.");
      }

      cancelEdit();
      await loadStudents();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/students/${id}`);
      setMessage("Student deleted successfully.");
      await loadStudents();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Student Management</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section className="panel">
        <h2>{editingId ? "Edit Student" : "Add Student"}</h2>
        <form className="form-grid" onSubmit={submit}>
          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={change}
              minLength={2}
              maxLength={100}
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              required
            />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              value={form.phone}
              onChange={change}
              minLength={7}
              maxLength={20}
              required
            />
          </label>
          <label>
            Department
            <input
              name="department"
              value={form.department}
              onChange={change}
              minLength={2}
              required
            />
          </label>
          <label>
            Course name
            <input
              name="course"
              value={form.course}
              onChange={change}
              minLength={2}
              required
            />
          </label>

          <div className="form-actions">
            <button disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Student" : "Add Student"}
            </button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <h2>All Students ({students.length})</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
              <th>Department</th><th>Course</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{student.department}</td>
                <td>{student.course}</td>
                <td className="actions">
                  <button onClick={() => edit(student)}>Edit</button>
                  <button
                    className="danger"
                    onClick={() => remove(student.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7">No student records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
