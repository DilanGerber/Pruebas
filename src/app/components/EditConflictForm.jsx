"use client";
import React, { useState } from "react";
import { format, isValid } from "date-fns";

const EditConflictForm = ({ conflictDays, onClose, onSave }) => {
  const [updatedConflicts, setUpdatedConflicts] = useState(
    conflictDays.map(conflict => ({
      ...conflict,
      selectedTimes: conflict.selectedTimes || [] // Inicializamos selectedTimes si no existe
    }))
  );
  

  // Función para manejar la selección de horarios
  const handleHourSelection = (dayIndex, hour) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts]; // Copia del array de conflictos
      const selectedDay = { ...newConflicts[dayIndex] }; // Copia del día específico
      const selectedTimes = new Set(selectedDay.selectedTimes || []); // Usamos un Set para evitar duplicados
  
      // Si el horario ya está en el Set, lo eliminamos; si no, lo añadimos
      if (selectedTimes.has(hour)) {
        selectedTimes.delete(hour);
      } else {
        selectedTimes.add(hour);
      }
  
      selectedDay.selectedTimes = Array.from(selectedTimes); // Convertimos el Set de nuevo a un array
      newConflicts[dayIndex] = selectedDay; // Actualizamos el día en el array de conflictos
  
      return newConflicts; // Retornamos el array actualizado
    });
  };

  const handleSave = () => {
    // Mapeamos los conflictos actualizados para formatearlos como los espera reservationDetails
    const updatedDates = updatedConflicts.map((conflict) => ({
      date: conflict.date, // La fecha no cambia
      timeSlots: conflict.selectedTimes || [] // Los horarios seleccionados
    }));
  
    // Llamamos a la función onSave que viene del componente padre
    if (onSave) {
      onSave(updatedDates);
    }
  
    onClose(); // Cerramos el modal
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
              {formatConflictDate(conflict.date)}
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                "8:00 AM",
                "9:00 AM",
                "10:00 AM",
                "11:00 AM",
                "12:00 PM",
                "1:00 PM",
                "2:00 PM",
                "3:00 PM",
                "4:00 PM",
                "5:00 PM",
                "6:00 PM",
                "7:00 PM",
                "8:00 PM",
              ].map((hour, index) => (
                <button
                  key={index}
                  className={`py-2 px-4 rounded ${
                    conflict.reservedTimes.includes(hour)
                      ? "bg-red-500 text-white" // Bloqueado
                      : conflict.selectedTimes?.includes(hour)
                      ? "bg-blue-500 text-white" // Seleccionado
                      : "bg-gray-200 text-black" // Disponible
                  }`}
                  disabled={conflict.reservedTimes.includes(hour)} // Deshabilitado si está reservado
                  onClick={() => handleHourSelection(dayIndex, hour)}
                >
                  {hour}
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