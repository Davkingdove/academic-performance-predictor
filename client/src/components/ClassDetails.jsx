import React, { useEffect, useState } from "react";
const API = "http://localhost:5000/api";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function ClassDetails() {
  const schema = getQueryParam("schema");
  const table = getQueryParam("table");
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentCount, setStudentCount] = useState(1);
  const [modalMsg, setModalMsg] = useState("");
  const [editAll, setEditAll] = useState(false);
  const [editRows, setEditRows] = useState([]);
  const [editingRowIdx, setEditingRowIdx] = useState(null);
  const [flashMsg, setFlashMsg] = useState("");
  const [flashType, setFlashType] = useState("success");

  useEffect(() => {
    if (schema && table) {
      fetch(`${API}/schema/${schema}/table/${table}/rows`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setRows(data.rows || []);
            setEditRows(data.rows ? JSON.parse(JSON.stringify(data.rows)) : []);
            if (data.rows && data.rows.length > 0) {
              setColumns(Object.keys(data.rows[0]));
            }
          }
        });
    }
  }, [schema, table, modalMsg, flashMsg]);

  // Handle cell change for edit all/single edit
  const handleCellChange = (idx, key, value) => {
    setEditRows(editRows.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    ));
  };

  // Save all rows
  const handleSaveAll = async () => {
    try {
      const res = await fetch(`${API}/schema/${schema}/table/${table}/update-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: editRows }),
      });
      const data = await res.json();
      if (data.success) {
        setFlashMsg("All students updated successfully.");
        setFlashType("success");
        setEditAll(false);
        setRows(editRows);
      } else {
        setFlashMsg(data.error || "Failed to update all students.");
        setFlashType("danger");
      }
    } catch {
      setFlashMsg("Failed to update all students.");
      setFlashType("danger");
    }
  };

  // Save single row
  const handleSaveRow = async (row, idx) => {
    try {
      const res = await fetch(`${API}/schema/${schema}/table/${table}/update-row`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row }),
      });
      const data = await res.json();
      if (data.success) {
        setFlashMsg("Student updated successfully.");
        setFlashType("success");
        setEditingRowIdx(null);
        const newRows = [...editRows];
        newRows[idx] = row;
        setEditRows(newRows);
        setRows(newRows);
      } else {
        setFlashMsg(data.error || "Failed to update student.");
        setFlashType("danger");
      }
    } catch {
      setFlashMsg("Failed to update student.");
      setFlashType("danger");
    }
  };

  // Delete single row
  const handleDeleteRow = async (rowId) => {
    try {
      const res = await fetch(`${API}/schema/${schema}/table/${table}/delete-row`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowId }),
      });
      const data = await res.json();
      if (data.success) {
        setFlashMsg("Student deleted successfully.");
        setFlashType("success");
        setEditRows(editRows.filter(r => r.id !== rowId));
        setRows(rows.filter(r => r.id !== rowId));
      } else {
        setFlashMsg(data.error || "Failed to delete student.");
        setFlashType("danger");
      }
    } catch {
      setFlashMsg("Failed to delete student.");
      setFlashType("danger");
    }
  };

  // Flash message timeout
  useEffect(() => {
    if (flashMsg) {
      const timer = setTimeout(() => setFlashMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [flashMsg]);

  const handleAddStudents = async (e) => {
    e.preventDefault();
    setModalMsg("");
    if (!schema || !table || !studentCount || isNaN(studentCount) || studentCount < 1) {
      setModalMsg("Please enter a valid number of students.");
      return;
    }
    try {
      const res = await fetch(`${API}/schema/${schema}/table/${table}/add-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(studentCount) }),
      });
      const data = await res.json();
      if (data.message) {
        setModalMsg(data.message);
        setShowAddStudentModal(false);
      } else {
        setModalMsg(data.error || "Error adding students.");
      }
    } catch {
      setModalMsg("Error adding students.");
    }
  };

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Class Table: {table}</h3>
      {flashMsg && (
        <div style={{
          marginBottom: 12,
          padding: "8px 16px",
          background: flashType === "success" ? "#d4edda" : "#f8d7da",
          color: flashType === "success" ? "#155724" : "#721c24",
          borderRadius: 4,
          fontWeight: 600
        }}>
          {flashMsg}
        </div>
      )}
      <button
        style={{
          marginBottom: 16,
          background: editAll ? "#007700" : "#0077cc",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "8px 18px",
          fontSize: "1rem",
          cursor: "pointer"
        }}
        onClick={() => {
          if (editAll) {
            handleSaveAll();
          } else {
            setEditAll(true);
          }
        }}
      >
        {editAll ? "Save All" : "Edit All"}
      </button>
      <button
        style={{
          marginLeft: 12,
          marginBottom: 16,
          background: "#0077cc",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "8px 18px",
          fontSize: "1rem",
          cursor: "pointer"
        }}
        onClick={() => { setShowAddStudentModal(true); setModalMsg(""); }}
      >
        Add Students
      </button>
      {showAddStudentModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.25)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#fff",
            padding: 32,
            borderRadius: 8,
            minWidth: 340,
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowAddStudentModal(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#888"
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 style={{ marginBottom: 18 }}>Add Students</h2>
            <form onSubmit={handleAddStudents}>
              <div style={{ marginBottom: 16 }}>
                <label>Enter the number of students you want to create:</label>
                <input
                  type="number"
                  min="1"
                  value={studentCount}
                  onChange={e => setStudentCount(e.target.value)}
                  style={{ width: "80px", marginLeft: 12 }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{
                  background: "#007700",
                  color: "#fff",
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: 4,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
              >
                Add
              </button>
              <button
                type="button"
                style={{
                  marginLeft: 12,
                  background: "#bbb",
                  color: "#fff",
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: 4,
                  fontSize: "1rem",
                  cursor: "pointer"
                }}
                onClick={() => setShowAddStudentModal(false)}
              >
                Cancel
              </button>
            </form>
            {modalMsg && (
              <div style={{ marginTop: 18, color: modalMsg.toLowerCase().includes('success') ? '#007700' : '#bb2222', fontWeight: 600 }}>
                {modalMsg}
              </div>
            )}
          </div>
        </div>
      )}
      <table border="1" cellPadding="5" style={{ marginTop: 16 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{col}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {editRows.map((row, idx) => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col}>
                  {(editAll || editingRowIdx === idx) ? (
                    <input
                      type={typeof row[col] === "number" ? "number" : "text"}
                      value={row[col] ?? ""}
                      onChange={e => handleCellChange(idx, col, e.target.value)}
                      style={{ width: typeof row[col] === "number" ? "70px" : "120px" }}
                    />
                  ) : (
                    row[col]
                  )}
                </td>
              ))}
              <td>
                {editingRowIdx === idx ? (
                  <button
                    onClick={() => handleSaveRow(row, idx)}
                    style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', marginRight: 4 }}
                  >Save</button>
                ) : (
                  <button
                    onClick={() => setEditingRowIdx(idx)}
                    style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', marginRight: 4 }}
                  >Edit</button>
                )}
                <button
                  onClick={() => handleDeleteRow(row.id)}
                  style={{ background: '#bb2222', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClassDetails;
