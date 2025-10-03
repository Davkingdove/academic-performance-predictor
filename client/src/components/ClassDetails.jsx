import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function ClassDetails() {
  const schema = getQueryParam("schema");
  const table = getQueryParam("table");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!schema || !table) {
      setError("Missing schema or class name.");
      setLoading(false);
      return;
    }
    // Convert schema and table names to MySQL format
    const safeSchema = schema.replace(/[\/]/g, '-');
    const safeTable = table.replace(/[\/]/g, '-');
    fetch(`${API}/schema/${safeSchema}/table/${safeTable}/rows`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setRows(data.rows || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch class data.");
        setLoading(false);
      });
  }, [schema, table]);

  if (loading) return <div style={{padding:32}}>Loading...</div>;
  if (error) return <div style={{padding:32, color:'red'}}>{error}</div>;

  return (
    <div style={{padding:32}}>
      <h2>Class: {table}</h2>
      <h3>Academic Year: {schema}</h3>
      <table style={{borderCollapse:'collapse',width:'100%'}}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>English -30%</th>
            <th>English -70%</th>
            <th>English 100%</th>
            <th>Maths -30%</th>
            <th>Maths -70%</th>
            <th>Maths 100%</th>
            <th>Social Std-30%</th>
            <th>Social Std-70%</th>
            <th>Social Std-100%</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={11} style={{textAlign:'center',color:'#888'}}>No students yet.</td></tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id || idx}>
                <td>{row.first_name}</td>
                <td>{row.last_name}</td>
                <td>{row.english_30}</td>
                <td>{row.english_70}</td>
                <td>{row.english_100}</td>
                <td>{row.maths_30}</td>
                <td>{row.maths_70}</td>
                <td>{row.maths_100}</td>
                <td>{row.social_std_30}</td>
                <td>{row.social_std_70}</td>
                <td>{row.social_std_100}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClassDetails;
