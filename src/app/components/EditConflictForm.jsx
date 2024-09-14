"use client";
import React, { useState, useEffect } from "react";
import { format, isValid } from "date-fns";

const EditConflictForm = ({ conflictDays, onClose, onSave }) => {
  const [updatedConflicts, setUpdatedConflicts] = useState(
    conflictDays.map((conflict) => ({
      ...conflict,
      selectedTimes: conflict.selectedTimes || [], // Inicializamos selectedTimes si no existe
      skipDay: false, // Agregamos un nuevo estado para omitir día
    }))
  );

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  // Función para manejar la selección de horarios
  const handleHourSelection = (dayIndex, hour) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts];
      const selectedDay = { ...newConflicts[dayIndex] };

      if (selectedDay.skipDay) return newConflicts;

      const selectedTimes = new Set(selectedDay.selectedTimes || []);
      selectedTimes.has(hour) ? selectedTimes.delete(hour) : selectedTimes.add(hour);
      selectedDay.selectedTimes = Array.from(selectedTimes);
      newConflicts[dayIndex] = selectedDay;

      return newConflicts;
    });
  };

  const handleSkipDay = (dayIndex) => {
    setUpdatedConflicts((prevConflicts) => {
      const newConflicts = [...prevConflicts];
      const selectedDay = { ...newConflicts[dayIndex] };

      selectedDay.skipDay = !selectedDay.skipDay;
      if (selectedDay.skipDay) {
        selectedDay.selectedTimes = [];
      }

      newConflicts[dayIndex] = selectedDay;
      return newConflicts;
    });
  };

  const handleSave = () => {
    const updatedDates = updatedConflicts.map((conflict) => {
      if (conflict.skipDay) {
        return {
          date: conflict.date,
          skip: true,
        };
      } else {
        return {
          date: conflict.date,
          timeSlots: conflict.selectedTimes || [],
        };
      }
    });

    if (onSave) {
      onSave(updatedDates);
    }

    onClose();
  };

  const formatConflictDate = (conflict) => {
    if (conflict instanceof Date && isValid(conflict)) {
      return format(conflict, "PPP");
    }
    return "Fecha no válida";
  };

  // Efecto para validar si todas las fechas tienen una opción seleccionada o están omitidas
  useEffect(() => {
    const allDaysValid = updatedConflicts.every(
      (conflict) => conflict.skipDay || conflict.selectedTimes.length > 0
    );
    setIsSaveDisabled(!allDaysValid); // Habilita el botón si todos los días son válidos
  }, [updatedConflicts]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold">Editar Horarios en Conflicto</h2>
        {updatedConflicts?.map((conflict, dayIndex) => {
          const isFullDayReserved = conflict.reservedTimes.includes("Todo el Día");

          return (
            <div key={dayIndex} className="mt-4">
              <h3 className="text-md font-semibold">
                {formatConflictDate(conflict.date)}
              </h3>
              <div className="flex flex-col gap-2 mt-2 overflow-auto" style={{ maxHeight: "300px" }}>
                {/* Botón de "Omitir Día" */}
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
                      conflict.skipDay || isFullDayReserved
                        ? "py-2 px-4 text-center border rounded-full bg-gray-300 opacity-50 cursor-not-allowed" // Deshabilitado si se omite el día o está reservado todo el día
                        : conflict.reservedTimes.includes(hour)
                        ? "py-2 px-4 text-center border rounded-full bg-gray-300 opacity-50 cursor-not-allowed" // Bloqueado
                        : conflict.selectedTimes?.includes(hour)
                        ? "py-2 px-4 text-center border rounded-full bg-red-600 text-white cursor-pointer" // Seleccionado
                        : "py-2 px-4 text-center font-medium text-gray-800 border rounded-full hover:bg-red-700 hover:text-white" // Disponible
                    }`}
                    disabled={
                      conflict.reservedTimes.includes(hour) || conflict.skipDay || isFullDayReserved
                    } // Deshabilitado si está reservado, omitido o es "Todo el Día"
                    onClick={() => handleHourSelection(dayIndex, hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black font-semibold hover:bg-gray-400 py-2 px-4 rounded-xl"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className={`py-2 px-4 rounded-xl text-white font-semibold bg-red-600 ${
              isSaveDisabled
                ? " opacity-50 cursor-not-allowed"
                : " hover:bg-red-700"
            }`}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditConflictForm;