import React, { useEffect, useState } from "react";
const API = "http://localhost:5000/api";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function RegisterTableView() {
  const schema = getQueryParam("schema");
  const registerTable = getQueryParam("registerTable"); // <-- Correct variable
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (schema && registerTable) {
      fetch(`${API}/schema/${schema}/register/${registerTable}/rows`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setRows(data.rows || []);
            if (data.rows && data.rows.length > 0) {
              setColumns(Object.keys(data.rows[0]));
            }
          }
        });
    }
  }, [schema, registerTable]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!rows.length) return <div>No data in register table.</div>;

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Register Table: {registerTable}</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={col}>
                  {typeof row[col] === "object" && row[col] !== null
                    ? JSON.stringify(row[col])
                    : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RegisterTableView;