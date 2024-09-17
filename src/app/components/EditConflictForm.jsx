"use client";
import React, { useState, useEffect } from "react";
import { format, isValid } from "date-fns";
import LeftConflictDays from "./icons/LeftConflictDays";
import RightConflictDays from "./icons/RightConflictDays";

const EditConflictForm = ({ conflictDays, onClose, onSave }) => {
  const [updatedConflicts, setUpdatedConflicts] = useState(
    conflictDays.map((conflict) => ({
      ...conflict,
      selectedTimes: conflict.selectedTimes || [], // Inicializamos selectedTimes si no existe
      skipDay: false, // Agregamos un nuevo estado para omitir día
    }))
  );

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0); // Control del índice de conflicto actual

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

  // Función para manejar el cambio de fecha (paginación)
  const handleNextConflict = () => {
    setCurrentConflictIndex((prevIndex) => Math.min(prevIndex + 1, updatedConflicts.length - 1));
  };

  const handlePreviousConflict = () => {
    setCurrentConflictIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const currentConflict = updatedConflicts[currentConflictIndex];

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96">

        {/* Botones de navegación */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handlePreviousConflict}
            disabled={currentConflictIndex === 0}
            className={`py-3 px-3 rounded-xl font-bold ${
              currentConflictIndex === 0
                ? "bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-600"
            }`}
          >
            <LeftConflictDays className=" w-5 h-5" /> 
          </button>
          <h2 className="text-lg font-semibold">Editar Horarios en Conflicto</h2>
          <button
            onClick={handleNextConflict}
            disabled={currentConflictIndex === updatedConflicts.length - 1}
            className={`py-3 px-3 rounded-xl font-semibold ${
              currentConflictIndex === updatedConflicts.length - 1
                ? "bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-600"
            }`}
          >
            <RightConflictDays className=" w-5 h-5"/>
          </button>
        </div>

        {/* Renderizando solo la fecha con conflicto actual */}
        <div className="mt-4">
          <h3 className="text-md font-semibold">
            {formatConflictDate(currentConflict.date)}
          </h3>
          <div className="flex flex-col gap-2 mt-2 overflow-auto" style={{ maxHeight: "300px" }}>
            {/* Botón de "Omitir Día" */}
            <button
              className={`py-2 px-4 rounded ${
                currentConflict.skipDay
                  ? "py-2 px-4 text-center border rounded-full bg-red-600 text-white cursor-pointer" // Omitido
                  : "py-2 px-4 text-center border rounded-full font-medium text-gray-800 hover:bg-red-700 hover:text-white"
              }`}
              onClick={() => handleSkipDay(currentConflictIndex)}
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
                  currentConflict.skipDay || currentConflict.reservedTimes.includes("Todo el Día")
                    ? "py-2 px-4 text-center border rounded-full bg-gray-300 opacity-50 cursor-not-allowed" // Deshabilitado si se omite el día o está reservado todo el día
                    : currentConflict.reservedTimes.includes(hour)
                    ? "py-2 px-4 text-center border rounded-full bg-gray-300 opacity-50 cursor-not-allowed" // Bloqueado
                    : currentConflict.selectedTimes?.includes(hour)
                    ? "py-2 px-4 text-center border rounded-full bg-red-600 text-white cursor-pointer" // Seleccionado
                    : "py-2 px-4 text-center font-medium text-gray-800 border rounded-full hover:bg-red-700 hover:text-white" // Disponible
                }`}
                disabled={
                  currentConflict.reservedTimes.includes(hour) ||
                  currentConflict.skipDay ||
                  currentConflict.reservedTimes.includes("Todo el Día")
                } // Deshabilitado si está reservado, omitido o es "Todo el Día"
                onClick={() => handleHourSelection(currentConflictIndex, hour)}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        

        {/* Botones de Guardar y Cancelar */}
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
            className={`py-2 px-4 rounded-xl text-white font-semibold ${
              isSaveDisabled
                ? "bg-red-600 opacity-50 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
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