"use client";
import React, { useState } from "react";
import { format, isValid } from "date-fns";

// Un array con los posibles horarios (ajústalo a tus necesidades)
const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", 
  "8:00 PM", 
];

const EditConflictForm = ({ conflictDays, onClose, onSave }) => {
  const [updatedConflicts, setUpdatedConflicts] = useState(conflictDays);

  // Función para manejar el cambio en la selección de horas
  const handleHourChange = (dayIndex, time) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts];
      const conflict = newConflicts[dayIndex];
      if (!conflict.selectedTimes) {
        conflict.selectedTimes = [];
      }

      // Alternar la selección de la hora
      if (conflict.selectedTimes.includes(time)) {
        conflict.selectedTimes = conflict.selectedTimes.filter(
          (t) => t !== time
        );
      } else {
        conflict.selectedTimes.push(time);
      }

      return newConflicts;
    });
  };

  // Función para guardar los cambios
  const handleSave = () => {
    if (onSave) {
      onSave(updatedConflicts);
    }
    onClose();
  };

  // Formatear la fecha para mostrarla
  const formatConflictDate = (conflict) => {
    if (conflict.date instanceof Date && isValid(conflict.date)) {
      return format(conflict.date, "PPP");
    }
    return "Fecha no válida";
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold">Editar Horarios en Conflicto</h2>
        
        {/* Mapeamos los días en conflicto */}
        {updatedConflicts?.map((conflict, dayIndex) => (
          <div key={dayIndex} className="mt-4">
            <h3 className="text-md font-semibold">
              {formatConflictDate(conflict)}
            </h3>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Mapeamos los horarios para este día */}
              {timeSlots.map((time, index) => {
                // Si el día tiene "Todo el Día" reservado, bloqueamos todos los horarios
                const isBlockedAllDay = conflict.reservedTimes.includes("Todo el Día");
                // Verificamos si este horario está reservado
                const isReserved = conflict.reservedTimes.includes(time);

                return (
                  <button
                    key={index}
                    className={`py-2 px-4 rounded ${
                      isBlockedAllDay || isReserved
                        ? "bg-red-500 text-white" // Horario bloqueado
                        : conflict.selectedTimes?.includes(time)
                        ? "bg-blue-500 text-white" // Horario seleccionado
                        : "bg-gray-200 text-black" // Horario disponible
                    }`}
                    disabled={isBlockedAllDay || isReserved} // Deshabilitar si está bloqueado
                    onClick={() => handleHourChange(dayIndex, time)}
                  >
                    {time}
                  </button>
                );
              })}
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