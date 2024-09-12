"use client";
import React, { useState } from "react";
import { format, isValid } from "date-fns";

const EditConflictForm = ({ conflictDays, onClose, onSave }) => {
  const [updatedConflicts, setUpdatedConflicts] = useState(
    conflictDays.map(conflict => ({
      ...conflict,
      selectedTimes: conflict.selectedTimes || [], // Inicializamos selectedTimes si no existe
      skipDay: false // Agregamos un nuevo estado para omitir día
    }))
  );

  // Función para manejar la selección de horarios
  const handleHourSelection = (dayIndex, hour) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts]; // Copia del array de conflictos
      const selectedDay = { ...newConflicts[dayIndex] }; // Copia del día específico

      // Si "Omitir Día" está seleccionado, no se pueden seleccionar horas
      if (selectedDay.skipDay) return newConflicts;

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

  // Función para omitir un día en conflicto
  const handleSkipDay = (dayIndex) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts];
      const selectedDay = { ...newConflicts[dayIndex] };

      // Alternar el estado de "Omitir Día"
      selectedDay.skipDay = !selectedDay.skipDay;

      // Si se omite el día, se deseleccionan todas las horas
      if (selectedDay.skipDay) {
        selectedDay.selectedTimes = [];
      }

      newConflicts[dayIndex] = selectedDay;
      return newConflicts;
    });
  };

  const handleSave = () => {
    // Mapeamos los conflictos actualizados para formatearlos como los espera reservationDetails
    const updatedDates = updatedConflicts
      .map((conflict) => {
        // Si el día está omitido, lo manejamos como tal
        if (conflict.skipDay) {
          return {
            date: conflict.date,
            skip: true // Aquí indicamos que el día está omitido
          };
        } else {
          return {
            date: conflict.date, // La fecha no cambia
            timeSlots: conflict.selectedTimes || [] // Los horarios seleccionados
          };
        }
      });
  
    // Llamamos a la función onSave que viene del componente padre
    if (onSave) {
      onSave(updatedDates); // Aquí pasamos los nuevos horarios seleccionados y omitidos
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
            <div className="flex flex-col gap-2 mt-2 overflow-auto" style={{maxHeight: "300px"}}>
              {/* Agregamos un botón de "Omitir Día" en la lista de opciones */}
              <button
                className={`py-2 px-4 rounded ${
                  conflict.skipDay
                    ? "py-2 px-4 text-center border rounded-full bg-red-600 text-white cursor-pointer" // Omitido
                    : "py-2 px-4 text-center border rounded-full font-medium text-gray-800 hover:bg-red-700 hover:text-white"
                }`}
                onClick={() => handleSkipDay(dayIndex)}
              >
                Omitir Día
              </button>

              {/* Lista de horas */}
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
                    conflict.skipDay
                      ? "py-2 px-4 text-center border rounded-full bg-gray-300 opacity-50 cursor-not-allowed" // Deshabilitado si se omite el día
                      : conflict.reservedTimes.includes(hour)
                      ? "py-2 px-4 text-center border rounded-full bg-gray-300 opacity-50 cursor-not-allowed" // Bloqueado
                      : conflict.selectedTimes?.includes(hour)
                      ? "py-2 px-4 text-center border rounded-full bg-red-600 text-white cursor-pointer" // Seleccionado
                      : "py-2 px-4 text-center font-medium text-gray-800 border rounded-full hover:bg-red-700 hover:text-white" // Disponible
                  }`}
                  disabled={
                    conflict.reservedTimes.includes(hour) || conflict.skipDay
                  } // Deshabilitado si está reservado o si el día está omitido
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
            className="bg-gray-300 text-black font-semibold hover:bg-gray-400 py-2 px-4 rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-red-600 text-white hover:bg-red-700 py-2 px-4 rounded-xl"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConflictForm;