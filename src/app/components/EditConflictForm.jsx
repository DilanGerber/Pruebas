"use client"
import React, { useState } from "react";
import { format, eachDayOfInterval } from 'date-fns';

const EditConflictForm = ({ conflictDays, onClose }) => {
    const [updatedConflicts, setUpdatedConflicts] = useState(conflictDays);
  
    const handleHourChange = (dayIndex, time) => {
      setUpdatedConflicts(prevConflicts => {
        const newConflicts = [...prevConflicts];
        const conflict = newConflicts[dayIndex];
        const hour = conflict.editableHours.find(h => h.time === time);
        hour.selected = !hour.selected;
        return newConflicts;
      });
    };
  
    const handleSave = () => {
      // Process the updated conflicts (e.g., send to backend)
      // Then update state and close the edit form
      setConflictDays(updatedConflicts);
      setEditingConflicts(false);
    };
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold">Editar Horarios en Conflicto</h2>
          {updatedConflicts.map((conflict, dayIndex) => (
  <div key={dayIndex} className="mt-4">
    <h3 className="text-md font-semibold">
      {conflict.date instanceof Date && !isNaN(conflict.date)
        ? format(conflict.date, "PPP")
        : "Fecha no válida"}
    </h3>
    <div className="grid grid-cols-2 gap-2 mt-2">
    {conflict.editableHours.map((hour, index) => (
  <button
    key={index}
    className={`time-slot ${hour.available ? 'available' : 'unavailable'}`}
    disabled={!hour.available}
    onClick={() => handleTimeSelection(dayIndex, hour.time)}
  >
    {hour.time}
  </button>
))}
    </div>
  </div>
))}
          <div className="mt-4 flex justify-between">
            <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded">Cancelar</button>
            <button onClick={handleSave} className="bg-red-600 text-white py-2 px-4 rounded">Guardar Cambios</button>
          </div>
        </div>
      </div>
    );
  };

export default EditConflictForm