import React from "react";
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
function RegisterMonthSelector({ selectedMonths, setSelectedMonths, onSave }) {
  return (
    <div style={{ margin: "20px 0" }}>
      <h4>Select months for register:</h4>
      <div>
        {months.map(month => (
          <label key={month} style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              checked={selectedMonths.includes(month)}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedMonths([...selectedMonths, month]);
                } else {
                  setSelectedMonths(selectedMonths.filter(m => m !== month));
                }
              }}
            />
            {month}
          </label>
        ))}
      </div>
      <button
        style={{ marginTop: 10 }}
        onClick={onSave}
        disabled={selectedMonths.length === 0}
      >
        Save Months to Register
      </button>
    </div>
  );
}

export default RegisterMonthSelector;