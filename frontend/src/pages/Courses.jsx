
import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  department: "",
  duration: "",
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [enrollIds, setEnrollIds] = useState({});
  const [enrollments, setEnrollments] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [courseResponse, studentResponse] = await Promise.all([
        api.get("/courses"),
        api.get("/students"),
      ]);
      setCourses(courseResponse.data);
      setStudents(studentResponse.data);
      setError("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, form);
        setMessage("Course updated successfully.");
      } else {
        await api.post("/courses", form);
        setMessage("Course created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function edit(course) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      description: course.description,
      department: course.department,
      duration: course.duration,
    });
  }

  async function remove(id) {
    if (!window.confirm("Delete this course and its enrollments?")) return;

    try {
      await api.delete(`/courses/${id}`);
      setMessage("Course deleted successfully.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function enroll(courseId) {
    const studentId = Number(enrollIds[courseId]);
    if (!studentId) {
      setError("Select a student before enrolling.");
      return;
    }

    try {
      await api.post(`/courses/${courseId}/enrollments`, {
        student_id: studentId,
      });
      setMessage("Student enrolled successfully.");
      await viewEnrollments(courseId);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function viewEnrollments(courseId) {
    try {
      const { data } = await api.get(`/courses/${courseId}/students`);
      setEnrollments((previous) => ({
        ...previous,
        [courseId]: data,
      }));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function unenroll(courseId, studentId) {
    try {
      await api.delete(
        `/courses/${courseId}/enrollments/${studentId}`
      );
      setMessage("Student unenrolled successfully.");
      await viewEnrollments(courseId);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <h1>Course Management</h1>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section className="panel">
        <h2>{editingId ? "Edit Course" : "Add Course"}</h2>
        <form className="form-grid" onSubmit={submit}>
          <label>
            Course name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              minLength={2}
              required
            />
          </label>
          <label>
            Department
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              minLength={2}
              required
            />
          </label>
          <label>
            Duration
            <input
              placeholder="e.g. 4 years"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </label>
          <label>
            Description
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
            />
          </label>
          <div className="form-actions">
            <button>{editingId ? "Update Course" : "Add Course"}</button>
            {editingId && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <h2>Available Courses ({courses.length})</h2>
      <div className="course-grid">
        {courses.map((course) => (
          <article className="panel course-card" key={course.id}>
            <h3>{course.name}</h3>
            <p>{course.description || "No description provided."}</p>
            <p><strong>Department:</strong> {course.department}</p>
            <p><strong>Duration:</strong> {course.duration}</p>

            <div className="actions">
              <button onClick={() => edit(course)}>Edit</button>
              <button className="danger" onClick={() => remove(course.id)}>
                Delete
              </button>
            </div>

            <h4>Enroll a student</h4>
            <select
              value={enrollIds[course.id] || ""}
              onChange={(e) =>
                setEnrollIds({
                  ...enrollIds,
                  [course.id]: e.target.value,
                })
              }
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} (ID: {student.id})
                </option>
              ))}
            </select>
            <button onClick={() => enroll(course.id)}>Enroll</button>
            <button
              className="secondary"
              onClick={() => viewEnrollments(course.id)}
            >
              View enrolled students
            </button>

            {enrollments[course.id] && (
              <div className="enrollments">
                <h4>Enrolled students</h4>
                {enrollments[course.id].length === 0 && <p>No enrollments.</p>}
                {enrollments[course.id].map((item) => {
                  const student = students.find(
                    (s) => s.id === item.student_id
                  );
                  return (
                    <div className="enrollment-row" key={item.id}>
                      <span>
                        {student ? student.name : `Student #${item.student_id}`}
                      </span>
                      <button
                        className="danger"
                        onClick={() => unenroll(course.id, item.student_id)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>

      {courses.length === 0 && <p>No courses have been added yet.</p>}
    </>
  );
}
