"use client";
import React, { useState } from "react";
import { format, isValid } from "date-fns";

const EditConflictForm = ({ conflictDays, onClose, onSave }) => {
  const [updatedConflicts, setUpdatedConflicts] = useState(conflictDays);

  const handleHourChange = (dayIndex, time) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts];
      const conflict = newConflicts[dayIndex];
      const hour = conflict.editableHours.find((h) => h.time === time);
      if (hour) {
        hour.selected = !hour.selected;
      }
      return newConflicts;
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(updatedConflicts);
    }
    onClose();
  };

  const formatConflictDate = (conflict) => {
    // Si el conflicto es un objeto Date válido, formatearlo
    if (conflict instanceof Date && isValid(conflict)) {
      return format(conflict, "PPP");
    }
    // Si no es una fecha válida, mostrar "Fecha no válida"
    return "Fecha no válida";
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold">Editar Horarios en Conflicto</h2>
        {updatedConflicts?.map((conflict, dayIndex) => (
          <div key={dayIndex} className="mt-4">
            <h3 className="text-md font-semibold">
              {formatConflictDate(conflict)}
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(conflict.editableHours || []).map((hour, index) => (
                <button
                  key={index}
                  className={`py-2 px-4 rounded ${
                    hour.available
                      ? hour.selected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                      : "bg-red-500 text-white"
                  }`}
                  disabled={!hour.available}
                  onClick={() => handleHourChange(dayIndex, hour.time)}
                >
                  {hour.time}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-red-600 text-white py-2 px-4 rounded"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConflictForm;