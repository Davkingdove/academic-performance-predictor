
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
  const [editMode, setEditMode] = useState(false);
  const [editRows, setEditRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [numStudents, setNumStudents] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!schema || !table) {
      setError("Missing schema or class name.");
      setLoading(false);
      return;
    }
  // Use original schema and table names with dashes
  fetch(`${API}/schema/${schema}/table/${table}/rows`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setRows(data.rows || []);
          setEditRows(data.rows ? JSON.parse(JSON.stringify(data.rows)) : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch class data.");
        setLoading(false);
      });
  }, [schema, table, adding]);

  const handleEdit = () => setEditMode(true);
  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement backend update endpoint for all rows
    // For now, just exit edit mode
    setEditMode(false);
    setLoading(false);
    setRows(editRows);
  };

  const handleCellChange = (rowIdx, field, value) => {
    setEditRows(rows => rows.map((row, idx) => idx === rowIdx ? { ...row, [field]: value } : row));
  };

  const handleAddStudents = async () => {
    if (!numStudents || isNaN(numStudents) || numStudents < 1) return;
    setAdding(true);
  // Use original schema and table names with dashes
  await fetch(`${API}/schema/${schema}/table/${table}/add-students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: Number(numStudents) })
    });
    setShowModal(false);
    setNumStudents("");
    setAdding(false);
  };

  if (loading) return <div style={{padding:32}}>Loading...</div>;
  if (error) return <div style={{padding:32, color:'red'}}>{error}</div>;

  return (
    <div style={{padding:32}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:16}}>
        <button
          style={{marginRight:12,padding:'8px 18px',background:'#007bff',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}
          onClick={editMode ? handleSave : handleEdit}
        >
          {editMode ? 'Save Data' : 'Edit Table'}
        </button>
        <button
          style={{padding:'8px 18px',background:'#28a745',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}
          onClick={()=>setShowModal(true)}
        >
          Add Students
        </button>
      </div>
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
          {(editMode ? editRows : rows).length === 0 ? (
            <tr><td colSpan={11} style={{textAlign:'center',color:'#888'}}>No students yet.</td></tr>
          ) : (
            (editMode ? editRows : rows).map((row, idx) => (
              <tr key={row.id || idx}>
                <td>
                  {editMode ? <input value={row.first_name || ""} onChange={e=>handleCellChange(idx,'first_name',e.target.value)} /> : row.first_name}
                </td>
                <td>
                  {editMode ? <input value={row.last_name || ""} onChange={e=>handleCellChange(idx,'last_name',e.target.value)} /> : row.last_name}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.english_30 || ""} onChange={e=>handleCellChange(idx,'english_30',e.target.value)} /> : row.english_30}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.english_70 || ""} onChange={e=>handleCellChange(idx,'english_70',e.target.value)} /> : row.english_70}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.english_100 || ""} onChange={e=>handleCellChange(idx,'english_100',e.target.value)} /> : row.english_100}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.maths_30 || ""} onChange={e=>handleCellChange(idx,'maths_30',e.target.value)} /> : row.maths_30}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.maths_70 || ""} onChange={e=>handleCellChange(idx,'maths_70',e.target.value)} /> : row.maths_70}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.maths_100 || ""} onChange={e=>handleCellChange(idx,'maths_100',e.target.value)} /> : row.maths_100}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.social_std_30 || ""} onChange={e=>handleCellChange(idx,'social_std_30',e.target.value)} /> : row.social_std_30}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.social_std_70 || ""} onChange={e=>handleCellChange(idx,'social_std_70',e.target.value)} /> : row.social_std_70}
                </td>
                <td>
                  {editMode ? <input type="number" value={row.social_std_100 || ""} onChange={e=>handleCellChange(idx,'social_std_100',e.target.value)} /> : row.social_std_100}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {showModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.2)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:32,borderRadius:8,minWidth:340,boxShadow:'0 2px 16px rgba(0,0,0,0.12)',position:'relative'}}>
            <button
              onClick={()=>setShowModal(false)}
              style={{position:'absolute',top:12,right:12,background:'transparent',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#888'}}
              aria-label="Close"
            >
              &times;
            </button>
            <h3>Enter the number of students you want to create</h3>
            <input type="number" min={1} value={numStudents} onChange={e=>setNumStudents(e.target.value)} style={{width:'100%',padding:'8px',marginBottom:16}} />
            <button
              onClick={handleAddStudents}
              style={{background:'#007bff',color:'#fff',padding:'10px 24px',border:'none',borderRadius:'4px',cursor:'pointer',width:'100%'}}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassDetails;
