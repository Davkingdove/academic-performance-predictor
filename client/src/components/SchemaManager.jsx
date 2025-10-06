import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

function SchemaManager() {
  // Default fields for a class
  const defaultFields = [
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'english_30', label: 'English -30%', type: 'number' },
    { key: 'english_70', label: 'English -70%', type: 'number' },
    { key: 'english_100', label: 'English 100%', type: 'number' },
    { key: 'maths_30', label: 'Maths -30%', type: 'number' },
    { key: 'maths_70', label: 'Maths -70%', type: 'number' },
    { key: 'maths_100', label: 'Maths 100%', type: 'number' },
    { key: 'social_std_30', label: 'Social Std-30%', type: 'number' },
    { key: 'social_std_70', label: 'Social Std-70%', type: 'number' },
    { key: 'social_std_100', label: 'Social Std-100%', type: 'number' },
  ];

  // All state declarations at the very top
  const [editRows, setEditRows] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schemas, setSchemas] = useState([]);
  const [schemaName, setSchemaName] = useState("");
  const [selectedSchema, setSelectedSchema] = useState("");
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success' or 'danger'

  // New state for editing all
  const [editAll, setEditAll] = useState(false);

  // New state for tracking which row is being edited
  const [editingRowIdx, setEditingRowIdx] = useState(null);

  // Fetch rows for selected class
  useEffect(() => {
    if (selectedSchema && selectedClass) {
      // Use original schema and class names with dashes
      fetch(`${API}/schema/${selectedSchema}/table/${selectedClass}/rows`)
        .then(res => res.json())
        .then(data => setEditRows(data.rows || []));
    } else {
      setEditRows([]);
    }
  }, [selectedSchema, selectedClass]);

  // Handle cell edit
  const handleCellChange = (rowIdx, field, value) => {
    setEditRows(rows => rows.map((row, idx) => idx === rowIdx ? { ...row, [field]: value } : row));
  };

  // Save all rows
  const handleSaveAll = async () => {
    try {
      const res = await fetch(`${API}/schema/${selectedSchema}/table/${selectedClass}/update-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: editRows }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("All students updated successfully.");
        setMessageType("success");
        setEditAll(false);
      } else {
        setMessage(data.error || "Failed to update all students.");
        setMessageType("danger");
      }
    } catch {
      setMessage("Failed to update all students.");
      setMessageType("danger");
    }
  };

  // Save single row
  const handleSaveRow = async (row) => {
    try {
      const res = await fetch(`${API}/schema/${selectedSchema}/table/${selectedClass}/update-row`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Student updated successfully.");
        setMessageType("success");
        setEditingRowIdx(null);
      } else {
        setMessage(data.error || "Failed to update student.");
        setMessageType("danger");
      }
    } catch {
      setMessage("Failed to update student.");
      setMessageType("danger");
    }
  };

  // Delete single row
  const handleDeleteRow = async (rowId) => {
    try {
      const res = await fetch(`${API}/schema/${selectedSchema}/table/${selectedClass}/delete-row`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rowId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Student deleted successfully.");
        setMessageType("success");
        setEditRows(editRows.filter(r => r.id !== rowId));
      } else {
        setMessage(data.error || "Failed to delete student.");
        setMessageType("danger");
      }
    } catch {
      setMessage("Failed to delete student.");
      setMessageType("danger");
    }
  };

  // Modal state and fields for Add Class
  const [showModal, setShowModal] = useState(false);
  const [modalSuffix, setModalSuffix] = useState("1");
  const [modalType, setModalType] = useState("Science");
  const [modalEndSuffix, setModalEndSuffix] = useState("1");
  const [modalMsg, setModalMsg] = useState("");
  const classTypes = ["Science", "Bussiness", "General-Art", "Visual-Art", "Home-Economics", "Technical"];
  const suffixOptions = ["1", "2", "3", "4", "5"];
  const endSuffixOptions = Array.from({ length: 20 }, (_, i) => String(1 + i));

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!selectedSchema) {
      setModalMsg("No academic year selected.");
      return;
    }
    // Compose class name
    const className = `${modalSuffix}-${modalType}-${modalEndSuffix}`;
    // Use original schema name with dashes
    fetch(`${API}/schema/${selectedSchema}/table`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName: className }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message && data.message.toLowerCase().includes("success")) {
          setModalMsg("Class created successfully.");
        } else {
          setModalMsg(data.error || data.message || "Error creating class.");
        }
      })
      .catch(() => setModalMsg("Error creating class."));
  };
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("success");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch schemas
  useEffect(() => {
    fetch(`${API}/schemas`)
      .then((res) => res.json())
      .then((data) => {
        // Only include schemas that start with a year pattern like '2023-2024', '2024-2025', etc.
        const yearPattern = /^\d{4}-\d{4}$/;
        const filtered = (data.schemas || []).filter(s => yearPattern.test(s));
        setSchemas(filtered);
      });
  }, [message]);

  // Fetch tables when schema selected
  useEffect(() => {
    if (selectedSchema) {
      // Use original schema name with dashes
      fetch(`${API}/schema/${selectedSchema}/tables`)
        .then((res) => res.json())
        .then((data) => setTables(data.tables || []));
    } else {
      setTables([]);
    }
  }, [selectedSchema, message]);

  // Create schema
  const handleCreateSchema = (e) => {
    e.preventDefault();
    if (!schemaName) return;
    // Check if academic year already exists
    if (schemas.includes(schemaName)) {
      setMessage("Academic year already exists.");
      setMessageType("danger");
      setSchemaName("")
      return;
    }
    // Use original schema name with dashes
    fetch(`${API}/schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message && data.message.toLowerCase().includes("success")) {
          setMessage("Success in creating schema. Please refresh the page.");
          setMessageType("success");
        } else if (data.error) {
          setMessage("Failed to create schema: " + data.error);
          setMessageType("danger");
        } else {
          setMessage(data.message || "Unknown error occurred.");
          setMessageType("danger");
        }
        setSchemaName("");
      });
  };

  // Create table
  const handleCreateTable = (e) => {
    e.preventDefault();
    if (!selectedSchema || !tableName) return;
    fetch(`${API}/schema/${selectedSchema}/table`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || data.error);
        setTableName("");
      });
  };

  // Add this function inside your SchemaManager component
  const handleRegisterClick = (schema, table) => {
    const registerTable = `${table}-register`;
    const url = `${window.location.origin}/register?schema=${encodeURIComponent(schema)}&registerTable=${encodeURIComponent(registerTable)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ maxWidth: 1000, position: 'relative', display: 'flex', flexDirection: 'row', gap: 0, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {message && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            background: messageType === 'success' ? '#d4edda' : (messageType === 'danger' ? '#f8d7da' : '#f8d7da'),
            color: messageType === 'success' ? '#155724' : (messageType === 'danger' ? '#721c24' : '#721c24'),
            border: `1px solid ${messageType === 'success' ? '#155724' : (messageType === 'danger' ? '#721c24' : '#721c24')}`,
            padding: '18px 32px',
            zIndex: 9999,
            textAlign: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          }}
        >
          <strong>{message}</strong>
        </div>
      )}
      {/* Left side: Academic Year creation and selection */}
      <div style={{ flex: 1, padding: 32, borderRight: '2px solid #eee', minWidth: 320 }}>
        <form onSubmit={handleCreateSchema} style={{ marginBottom: 24 }}>
          <h2>Create New Academic Year</h2>
          <input
            type="text"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            placeholder="Schema name"
            required
            style={{ minWidth: 180 }}
          />
          <button type="submit" style={{ marginLeft: 8 }}>Create</button>
        </form>

        <h2>Available Academic Years</h2>
        <select
          value={selectedSchema}
          onChange={e => setSelectedSchema(e.target.value)}
          style={{ minWidth: 200, marginBottom: 16 }}
        >
          <option value="">-- Select Schema --</option>
          {schemas.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Right side: Classes and Create Table */}
      <div style={{ flex: 2, padding: 32, minWidth: 320 }}>
        {selectedSchema ? (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
            <div style={{ flex: 2 }}>
              <h2>Classes available in Academic Year {selectedSchema}</h2>
              <ul>
                {tables.map((t) => (
                  <div key={t} style={{ marginBottom: 8 }}>
                    <button
                      style={{ background: '#eee', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}
                      onClick={() => {
                        // Convert schema and table names to MySQL format for backend
                        const safeSchema = selectedSchema.replace(/[\/]/g, '-');
                        const safeTable = t.replace(/[\/]/g, '-');
                        const url = `${window.location.origin}/class?schema=${encodeURIComponent(safeSchema)}&table=${encodeURIComponent(safeTable)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Open Class: {t}
                    </button>
                    {/* <button
                      onClick={() => handleRegisterClick(selectedSchema, t)}
                      style={{ marginLeft: 8 }}
                    >
                      Open Register
                    </button> */}
                  </div>
                ))}
              </ul>
              {/* Show table for selected class */}
              {selectedClass && (
                <div style={{ marginTop: 24 }}>
                  <h3>Students in {selectedClass}</h3>
                  <button
                    style={{
                      marginBottom: 12,
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
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        {defaultFields.map(f => (
                          <th key={f.key} style={{ border: '1px solid #ccc', padding: '6px' }}>{f.label}</th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRows.length === 0 ? (
                        <tr><td colSpan={defaultFields.length + 1} style={{ textAlign: 'center', color: '#888' }}>No students yet.</td></tr>
                      ) : (
                        editRows.map((row, idx) => (
                          <tr key={row.id || idx}>
                            {defaultFields.map(f => (
                              <td key={f.key} style={{ border: '1px solid #ccc', padding: '6px' }}>
                                {(editAll || editingRowIdx === idx) ? (
                                  <input
                                    type={f.type}
                                    value={row[f.key] || ""}
                                    onChange={e => handleCellChange(idx, f.key, e.target.value)}
                                    style={{ width: f.type === 'number' ? '70px' : '120px' }}
                                  />
                                ) : (
                                  row[f.key]
                                )}
                              </td>
                            ))}
                            <td>
                              {editingRowIdx === idx ? (
                                <button
                                  onClick={() => handleSaveRow(row)}
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={{ flex: 1, marginLeft: 32 }}>
              <button
                style={{ padding: '10px 24px', fontSize: '1rem', background: '#0077cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                onClick={() => { setShowModal(true); setModalMsg(""); }}
              >
                Add Class
              </button>
              {/* Modal for Add Class */}
              {showModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(0,0,0,0.25)',
                  zIndex: 10000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.12)', position: 'relative' }}>
                    {/* Close button */}
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'transparent',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#888'
                      }}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    <h2 style={{ marginBottom: 18 }}>Add Class</h2>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!selectedSchema) {
                        setModalMsg("No academic year selected.");
                        return;
                      }
                      // Compose class name
                      const className = `${modalSuffix}-${modalType}-${modalEndSuffix}`;
                      const safeSchema = selectedSchema.replace(/\//g, '-');
                      try {
                        const res = await fetch(`${API}/schema/${safeSchema}/table`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ tableName: className }),
                        });
                        const data = await res.json();
                        setShowModal(false);
                        if (data.message && data.message.toLowerCase().includes("success")) {
                          setMessage("Table created");
                          setMessageType("success");
                        } else {
                          setMessage(data.error || data.message || "Error creating class.");
                          setMessageType("danger");
                        }
                        // Optionally refresh tables
                        fetch(`${API}/schema/${safeSchema}/tables`)
                          .then((res) => res.json())
                          .then((data) => setTables(data.tables || []));
                      } catch {
                        setShowModal(false);
                        setMessage("Error creating class.");
                        setMessageType("danger");
                      }
                    }}>
                      <div style={{ marginBottom: 16 }}>
                        <label>Class Suffix:&nbsp;</label>
                        <select value={modalSuffix} onChange={e => setModalSuffix(e.target.value)}>
                          {suffixOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label>Class Type:&nbsp;</label>
                        <select value={modalType} onChange={e => setModalType(e.target.value)}>
                          {classTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label>Suffix:&nbsp;</label>
                        <select value={modalEndSuffix} onChange={e => setModalEndSuffix(e.target.value)}>
                          {endSuffixOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <button type="submit" style={{ background: '#007700', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer' }}>Create</button>
                      <button type="button" style={{ marginLeft: 12, background: '#bbb', color: '#fff', padding: '8px 18px', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
                    </form>
                    {modalMsg && (
                      <div style={{ marginTop: 18, color: modalMsg.toLowerCase().includes('success') ? '#007700' : '#bb2222', fontWeight: 600 }}>
                        {modalMsg}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ color: '#888', fontStyle: 'italic', marginTop: 32 }}>
            Select an academic year to view classes and create new ones.
          </div>
        )}
      </div>
    </div>
  );
}

export default SchemaManager;
