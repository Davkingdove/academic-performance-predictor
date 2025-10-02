import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

function SchemaManager() {
  const [schemas, setSchemas] = useState([]);
  const [schemaName, setSchemaName] = useState("");
  const [selectedSchema, setSelectedSchema] = useState("");
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState("");
  const [message, setMessage] = useState("");

  // Fetch schemas
  useEffect(() => {
    fetch(`${API}/schemas`)
      .then((res) => res.json())
      .then((data) => setSchemas(data.schemas || []));
  }, [message]);

  // Fetch tables when schema selected
  useEffect(() => {
    if (selectedSchema) {
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
    fetch(`${API}/schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemaName }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message || data.error);
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

  return (
    <div style={{ maxWidth: 600 }}>
      <form onSubmit={handleCreateSchema} style={{ marginBottom: 24 }}>
        <h2>Create Schema</h2>
        <input
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          placeholder="Schema name"
          required
        />
        <button type="submit" style={{ marginLeft: 8 }}>Create</button>
      </form>

      <h2>Available Schemas</h2>
      <ul>
        {schemas.map((s) => (
          <li key={s}>
            <button
              style={{ fontWeight: selectedSchema === s ? "bold" : "normal" }}
              onClick={() => setSelectedSchema(s)}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>

      {selectedSchema && (
        <div style={{ marginTop: 32 }}>
          <h2>Tables in "{selectedSchema}"</h2>
          <ul>
            {tables.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <form onSubmit={handleCreateTable} style={{ marginTop: 16 }}>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Table name"
              required
            />
            <button type="submit" style={{ marginLeft: 8 }}>Create Table</button>
          </form>
        </div>
      )}

      {message && (
        <div style={{ marginTop: 24, color: "#007700" }}>
          <strong>{message}</strong>
        </div>
      )}
    </div>
  );
}

export default SchemaManager;
