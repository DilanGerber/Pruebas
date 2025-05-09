"use client"
import React, { useContext, useState, useEffect } from 'react';
import { StepperContext } from '../../../context/StepperContext';

import { Calendar } from "../../ui/calendar"
import { format, eachDayOfInterval } from 'date-fns';
import EditConflictForm from '../modalComponents/EditConflictForm';

const Calendario = () => {
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [range, setRange] = useState({ from: null, to: null });
  const [timeSlot, setTimeSlot] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});
  const [selectedHours, setSelectedHours] = useState([]);
  const [conflictDays, setConflictDays] = useState([]);
  const [editingConflicts, setEditingConflicts] = useState(false);
  const [conflictDetails, setConflictDetails] = useState([]); // Lista de fechas con conflicto
  const [reservationDetails, setReservationDetails] = useState(null); // Estado para la reserva final
  const [isReservationConfirmed, setIsReservationConfirmed] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);  // Para fechas sueltas
  const [calendarMode, setCalendarMode] = useState("range");  // Puede ser "range" o "multiple"

  const { state, dispatch } = useContext(StepperContext);

  console.log("selectedDates", selectedDates)

  useEffect(() => {
    if (state.range) {
      setRange(state.range);
    }
  
    if (state.selectedHours) {
      setSelectedHours(state.selectedHours);
    }
  
    if (state.isReservationConfirmed) {
      setIsReservationConfirmed(state.isReservationConfirmed);
    }
  
    if (state.dates) {
      setReservationDetails({ dates: state.dates, officeId: state.officeId });
    }
    // Asegurar que selectedDates también se sincronice con el estado global
  if (state.selectedDates) {
    setSelectedDates(state.selectedDates);
  }
    // Sincronizar calendarMode con el estado local
    if (state.calendarMode) {
      setCalendarMode(state.calendarMode);
    }
  }, [state.range, state.selectedHours, state.isReservationConfirmed, state.dates, state.officeId, state.selectedDates, state.calendarMode]);
  
  // Fetch reservations
  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `https://cowork-backend.up.railway.app/reservations/office/${state.officeId}`
      );
      const data = await response.json();

      const timeSlots = data.reduce((acc, reservation) => {
        reservation.dates.forEach(({ date, timeSlots }) => {
          const dateKey = new Date(date).toISOString().split("T")[0];
      
          if (!acc[dateKey]) {
            acc[dateKey] = { blockedTimes: [], editableHours: [] };
          }
      
          acc[dateKey].editableHours.push(...timeSlots);
      
          if (timeSlots.includes("Todo el Día")) {
            acc[dateKey].blockedTimes = ["Todo el Día"];
          } else {
            acc[dateKey].blockedTimes.push(...timeSlots);
          }
        });
      
        return acc;
      }, {});
      
      setBlockedTimeSlots(timeSlots);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Generate time slots
  const getTime = () => {
    const timeList = [];
    for (let i = 8; i <= 12; i++) {
      timeList.push({ time: i + ":00 AM" });
    }
    for (let i = 1; i <= 8; i++) {
      timeList.push({ time: i + ":00 PM" });
    }
    timeList.push({ time: "Todo el Día" });
    setTimeSlot(timeList);
  };

  useEffect(() => {
    getTime();
  }, []);

  // Check if the day is past
  const isPastDay = (day) => {
    const now = new Date();
    const selectedDate = new Date(day);
    const isSameDay = now.toDateString() === selectedDate.toDateString();

    if (isSameDay && now.getHours() < 17) {
      return false;
    }

    return selectedDate < now;
  };

  // Check if the day is blocked
  const isBlockedDay = (day) => {
    const dayString = day.toISOString().split("T")[0];
    const blockedTimes = blockedTimeSlots[dayString]?.blockedTimes || [];
    return blockedTimes.includes("Todo el Día") || blockedTimes.length >= 13;
  };

  // Check if the time slot is blocked
  const isBlockedTimeSlot = (day, time) => {
    if (!(day instanceof Date) || isNaN(day)) {
      return false;
    }
  
    if (range.from && range.to) {
      return false;
    }
  
    const dayString = day.toISOString().split("T")[0];
    return blockedTimeSlots[dayString]?.blockedTimes.includes(time);
  };

  // Check if "Todo el Día" should be disabled
  const isFullDayDisabled = (day) => {
    const dayString = day?.toISOString().split("T")[0];
    const blockedTimes = blockedTimeSlots[dayString]?.blockedTimes || [];
  
    if (range.from && range.to) {
      return false;
    }
  
    return blockedTimes.includes("Todo el Día") || blockedTimes.length > 0;
  };

  // Handle date change
  const handleDateChange = (newSelection) => {
    setSelectedHours([]);
    setConflictDays([]);
    setConflictDetails([]);
    setReservationDetails(null); // Resetea los detalles de la reserva al cambiar el rango
    setIsReservationConfirmed(false);
    dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: false });
  
    // Si el calendario está en modo 'range'
    if (calendarMode === "range") {
      setRange(newSelection);
  
      // Si se selecciona un rango, habilitar las opciones de hora
      if (newSelection?.from && newSelection.to) {
        setTimeSlot((prev) => prev.map(slot => ({
          ...slot,
          disabled: false
        })));
  
        // Actualizar reservationDetails con un rango pero sin horas aún
        updateReservationDetails(newSelection, selectedHours);
      }
    }
  
    // Si el calendario está en modo 'multiple'
    else if (calendarMode === "multiple") {
      setSelectedDates(newSelection); // Aquí actualizamos las fechas seleccionadas
  
      if (newSelection.length > 0) {
        setTimeSlot((prev) => prev.map(slot => ({
          ...slot,
          disabled: false
        })));
  
        // Actualizar reservationDetails con las fechas seleccionadas
        updateReservationDetails(newSelection, selectedHours);
      }
    }
  };

  // Handle hour selection
  const handleSelectHours = (hour) => {
    let updatedHours;
  
    if (hour === "Todo el Día") {
      updatedHours = ["Todo el Día"];
    } else {
      updatedHours = selectedHours.includes("Todo el Día")
        ? [hour]
        : selectedHours.includes(hour)
          ? selectedHours.filter((h) => h !== hour)
          : [...selectedHours, hour];
    }
  
    setSelectedHours(updatedHours);
    setIsReservationConfirmed(false)
    dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: false });
    // Comprobar conflictos después de seleccionar horas
    checkForConflicts(updatedHours);
  
    // Actualizar reservationDetails cuando se seleccionan horas
    updateReservationDetails(range, updatedHours);
  };

  // Check for conflicts and list conflicting days
  const checkForConflicts = (hours) => {
    const days = calendarMode === "multiple" && selectedDates.length > 0
      ? selectedDates  // Usamos selectedDates si estamos en modo "multiple"
      : range?.from
        ? (range.to
            ? eachDayOfInterval({ start: range.from, end: range.to })
            : [range.from]) // Usamos range si está en modo "range"
        : [];
  
    if (days.length === 0) return;
  
    const conflicts = days.map((day) => {
      const dayString = day.toISOString().split("T")[0];
      const blockedTimes = blockedTimeSlots[dayString]?.blockedTimes || [];
  
      const hasConflict =
        blockedTimes.includes("Todo el Día") ||
        (hours.includes("Todo el Día") && blockedTimes.length > 0) ||
        hours.some((hour) => blockedTimes.includes(hour));
  
      if (hasConflict) {
        return {
          date: day,
          reservedTimes: blockedTimes, // Incluye las horas bloqueadas
        };
      }
  
      return null;
    }).filter(Boolean);
  
    setConflictDays(conflicts);
    setConflictDetails(conflicts.map((conflict) => ({
      date: format(conflict.date, "PPP"),
      reservedTimes: conflict.reservedTimes,
    })));
  };

  // Format date
  const formatDate = (from, to) => {
    if (to) {
      return `${format(new Date(from), "PPP")} hasta ${format(new Date(to), "PPP")}`;
    }
    return format(new Date(from), "PPP");
  };

  // Responsive calendar
  useEffect(() => {
    const updateNumberOfMonths = () => {
      if (window.innerWidth >= 1024) {
        setNumberOfMonths(2);
      } else {
        setNumberOfMonths(1);
      }
    };

    updateNumberOfMonths();
    window.addEventListener("resize", updateNumberOfMonths);

    return () => {
      window.removeEventListener("resize", updateNumberOfMonths);
    };
  }, []);

  const handleSaveConflicts = (updatedDates) => {
    // Actualizar reservationDetails con los horarios actualizados
    setReservationDetails((prevDetails) => {
      const newDates = prevDetails?.dates ? [...prevDetails.dates] : [];
  
      updatedDates.forEach((updatedDate) => {
        const existingDateIndex = newDates.findIndex(
          (date) => date.date === updatedDate.date.toISOString()
        );
  
        if (existingDateIndex !== -1) {
          newDates[existingDateIndex].timeSlots = [
            ...new Set([...updatedDate.timeSlots || []]),
          ];
        } else {
          newDates.push({
            date: updatedDate.date.toISOString(),
            timeSlots: updatedDate.timeSlots,
          });
        }
      });
  
      return {
        ...prevDetails,
        dates: newDates,
      };
    });
  
    // Eliminar los días en conflicto resueltos
    setConflictDays((prevConflicts) =>
      prevConflicts.filter(
        (conflict) =>
          !updatedDates.some(
            (updatedDate) =>
              new Date(updatedDate.date).toISOString() ===
              new Date(conflict.date).toISOString()
          )
      )
    );
  
    // Actualizar reservationDetails nuevamente si es necesario
    updateReservationDetails(range, selectedHours);
  };

  const updateReservationDetails = (range, selectedHours) => {
    // Si el calendario está en modo 'range'
    if (calendarMode === "range") {
      if (range?.from && selectedHours.length > 0 && conflictDays.length === 0) {
        const days = eachDayOfInterval({
          start: range.from,
          end: range.to || range.from,
        });
  
        const newReservationData = days.map((day) => ({
          date: day.toISOString(),
          timeSlots: [...selectedHours],
        }));
  
        const reservationPayload = {
          dates: newReservationData,
        };
  
        setReservationDetails(reservationPayload);
      }
    }
    
    // Si el calendario está en modo 'multiple'
    else if (calendarMode === "multiple") {
      if (selectedDates.length > 0 && selectedHours.length > 0 && conflictDays.length === 0) {
        const newReservationData = selectedDates.map((day) => ({
          date: day.toISOString(),
          timeSlots: [...selectedHours],
        }));
  
        const reservationPayload = {
          dates: newReservationData,
        };
  
        setReservationDetails(reservationPayload);
      }
    }
  };

  const handleConfirmReservation = () => {

  // Despachar la acción para guardar el estado actualizado
  dispatch({
    type: 'SET_CALENDAR_DATA',
    payload: reservationDetails.dates, // Guardamos las fechas limpias
  });

  // Despachar las acciones para range y selectedHours
  dispatch({ type: 'SET_RANGE', payload: range });
  dispatch({ type: 'SET_SELECTED_HOURS', payload: selectedHours });

  if (calendarMode === 'multiple') {
    dispatch({ type: 'SET_SELECTED_DATES', payload: selectedDates });
  }
  
    // Marcar la reserva como confirmada
    dispatch({ type: 'CONFIRM_RESERVATION', payload: true });
    
    // Marcar la reserva como confirmada
    setIsReservationConfirmed(true);
    dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: true });
  };



  const areAllFullDaysDisabled = (selectedDates) => {
    // Si hay más de una fecha seleccionada, permitimos que todos los horarios estén disponibles
    if (selectedDates.length > 1) {
      return false;
    }
  
    return selectedDates.every(day => {
      if (!(day instanceof Date) || isNaN(day.getTime())) {
        return false; // Ignorar si no es una fecha válida
      }
  
      const dayString = day.toISOString().split("T")[0];
      const blockedTimes = blockedTimeSlots[dayString]?.blockedTimes || [];
      
      return blockedTimes.includes("Todo el Día") || blockedTimes.length > 0;
    });
  };
  
  const areAnyBlockedTimeSlots = (selectedDates, time) => {
    // Si hay más de una fecha seleccionada, permitimos que todos los horarios estén disponibles
    if (selectedDates.length > 1) {
      return false;
    }
  
    return selectedDates.some(day => {
      if (!(day instanceof Date) || isNaN(day.getTime())) {
        return false; // Ignorar si no es una fecha válida
      }
  
      const dayString = day.toISOString().split("T")[0];
      return blockedTimeSlots[dayString]?.blockedTimes.includes(time);
    });
  };

  // Función para reiniciar estados
const resetStates = () => {
  setRange({ from: null, to: null });
  setSelectedDates([]);
  setSelectedHours([]);
  setConflictDays([]);
  setConflictDetails([]);
  setReservationDetails(null); // Resetea los detalles de la reserva al cambiar el rango
  setIsReservationConfirmed(false);
  dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: false });
  dispatch({
    type: 'SET_CALENDAR_DATA',
    payload: [], // Guardamos las fechas limpias
  });

  // Despachar las acciones para range y selectedHours
  dispatch({ type: 'SET_RANGE', payload: { from: null, to: null } });
  dispatch({ type: 'SET_SELECTED_HOURS', payload: [] });

  if (calendarMode === 'multiple') {
    dispatch({ type: 'SET_SELECTED_DATES', payload: [] });
  }
  
    // Marcar la reserva como confirmada
    dispatch({ type: 'CONFIRM_RESERVATION', payload: false });
    
    // Marcar la reserva como confirmada
    setIsReservationConfirmed(false);
    dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: false });
};

// Cambiar el modo y resetear estados
const handleChangeMode = (mode) => {
  setCalendarMode(mode);
  resetStates();
  dispatch({
    type: 'SET_CALENDAR_MODE',
    payload: mode,
  });
};
  

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className='flex md:flex-row flex-col md:justify-between justify-center md:items-start items-center gap-2'>
      <div className="flex flex-col items-center justify-center rounded-lg border "> 
      <div className="flex w-full justify-center ">
  <div className="w-full gap-1 grid grid-flow-col auto-cols-fr items-center bg-gray-100 rounded-t-lg">
    <button
      onClick={() => handleChangeMode("range")}
      className={`transition-all duration-150 ease-out text-center rounded-tr-lg text-xs sm:text-sm md:text-base
      ${calendarMode === "range"
        ? "bg-white text-black w-full py-3 rounded-t-lg font-bold text-xs sm:text-sm md:text-base" // Cuando está seleccionado, no hay margen
        : "bg-transparent text-primary hover:bg-gray-300 hover:shadow-md hover:rounded-lg hover:py-2 hover:px-3 p-1 hover:m-1"
      }`}
    >
      Días continuos
    </button>
    <button
      onClick={() => handleChangeMode("multiple")}
      className={`transition-all duration-150 ease-out text-center rounded-tl-lg text-xs sm:text-sm md:text-base
      ${calendarMode === "multiple" 
        ? "bg-white text-black w-full py-3 rounded-t-lg font-bold text-xs sm:text-sm md:text-base" // Cuando está seleccionado, no hay margen
        : "bg-transparent text-primary hover:bg-gray-300 hover:shadow-md hover:rounded-lg hover:py-2 hover:px-3 p-1 hover:m-1"
      }`}
    >
      Días  discontinuos
    </button>
  </div>
</div>
        <Calendar
          numberOfMonths={numberOfMonths}
          mode={calendarMode}  
          selected={calendarMode === "range" ? range : selectedDates}
          onSelect={handleDateChange}
          disabled={(day) => isPastDay(day) || isBlockedDay(day)}
          className=""
        />
      </div>
{/* Si la pantalla es grande, muestra los horarios inline */}
<div className="hidden md:flex items-center justify-center w-[250px] md:w-full">
  {(range?.from || selectedDates.length > 0) && (
    <div className="border rounded-md p-4 overflow-auto" style={{ maxHeight: "336px" }}>
      {/* Si es un rango seleccionado */}
      {range?.from && (
        <div>
          <h3 className="font-semibold text-sm">Seleccione Horas para {formatDate(range.from, range?.to)}</h3>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {timeSlot.map((slot) => (
              <button
                key={slot.time}
                className={`py-1 sm:py-2 px-4 text-center text-sm md:text-base border rounded-full font-medium text-gray-800 ${
                  selectedHours.includes(slot.time)
                    ? "bg-red-600 text-white cursor-pointer"
                    : (slot.time === "Todo el Día" && isFullDayDisabled(range.from)) || isBlockedTimeSlot(range.from, slot.time)
                    ? "bg-gray-300 opacity-50 cursor-not-allowed"
                    : "hover:bg-red-700 hover:text-white"
                }`}
                onClick={() => handleSelectHours(slot.time)}
                disabled={(slot.time === "Todo el Día" && isFullDayDisabled(range.from)) || isBlockedTimeSlot(range.from, slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Si es selección múltiple */}
      {selectedDates.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm">Seleccione Horas para las fechas seleccionadas:</h3>
          {/* Aquí solo mostramos un selector de horas para todas las fechas */}
          <div className="grid grid-cols-1 gap-2 mt-4">
            {timeSlot.map((slot) => (
              <button
                key={slot.time}
                className={`py-1 sm:py-2 px-4 text-center text-sm md:text-base border rounded-full font-medium text-gray-800 ${
                  selectedHours.includes(slot.time)
                    ? "bg-red-600 text-white cursor-pointer"
                    : (slot.time === "Todo el Día" && areAllFullDaysDisabled(selectedDates)) || areAnyBlockedTimeSlots(selectedDates, slot.time)
                    ? "bg-gray-300 opacity-50 cursor-not-allowed"
                    : "hover:bg-red-700 hover:text-white"
                }`}
                onClick={() => handleSelectHours(slot.time)}
                disabled={(slot.time === "Todo el Día" && areAllFullDaysDisabled(selectedDates)) || areAnyBlockedTimeSlots(selectedDates, slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
</div>
    {/* Si la pantalla es pequeña, muestra el botón que abre el modal */}
{/* Si la pantalla es pequeña, muestra el botón que abre el modal */}
<div className="flex md:hidden items-center justify-start w-[250px] md:w-full">
  {range?.from && (
    <button
      className="py-1.5 sm:py-2 px-4 rounded-lg font-semibold text-xs sm:text-base bg-red-600 text-white"
      onClick={() => setShowTimeModal(true)}
    >
      Seleccionar Horas
    </button>
  )}
  {selectedDates.length > 0 && (
    <button
      className="py-1.5 sm:py-2 px-4 rounded-lg font-semibold text-xs sm:text-base bg-red-600 text-white ml-2"
      onClick={() => setShowTimeModal(true)}
    >
      Seleccionar Horas
    </button>
  )}
</div>
      </div>

 {/* Modal para seleccionar horarios en responsive */}
 {showTimeModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg shadow-lg w-96 z-20">
      <h3 className="text-md font-semibold">Seleccione Horas para {formatDate(range.from, range?.to)}</h3>
      <div className="flex flex-col gap-2 mt-2 overflow-auto" style={{ maxHeight: "320px" }}>
        {timeSlot.map((slot) => (
          <button
            key={slot.time}
            className={`py-2 px-4 text-center border rounded-full text-gray-800 ${
              selectedHours.includes(slot.time)
                ? "bg-red-600 text-white cursor-pointer"
                : (slot.time === "Todo el Día" && isFullDayDisabled(range.from)) || isBlockedTimeSlot(range.from, slot.time)
                ? "bg-gray-300 opacity-50 cursor-not-allowed"
                : "hover:bg-red-700 hover:text-white"
            }`}
            onClick={() => handleSelectHours(slot.time)}
            disabled={(slot.time === "Todo el Día" && isFullDayDisabled(range.from)) || isBlockedTimeSlot(range.from, slot.time)}
          >
            {slot.time}
          </button>
        ))}
      </div>

      {/* Botón para confirmar la reserva dentro del modal */}
      <div className="mt-4 flex justify-between">
        <button
          className="bg-gray-300 text-black font-semibold hover:bg-gray-400 py-2 px-4 rounded-xl"
          onClick={() => setShowTimeModal(false)}
        >
          Cancelar
        </button>
        <button
          className="py-2 px-4 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700"
          onClick={() => {
            setShowTimeModal(false);
          }}
        >
          Confirmar Horas
        </button>
      </div>
    </div>
  </div>
)}

{showTimeModal && selectedDates.length > 0 && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg shadow-lg w-96 z-20">
      <h3 className="text-md font-semibold">Seleccione Horas para las fechas seleccionadas</h3>
      <div className="flex flex-col gap-2 mt-2 overflow-auto" style={{ maxHeight: "320px" }}>
        {timeSlot.map((slot) => (
          <button
            key={slot.time}
            className={`py-2 px-4 text-center border rounded-full text-gray-800 ${
              selectedHours.includes(slot.time)
                ? "bg-red-600 text-white cursor-pointer"
                : (slot.time === "Todo el Día" && areAllFullDaysDisabled(selectedDates)) || areAnyBlockedTimeSlots(selectedDates, slot.time)
                ? "bg-gray-300 opacity-50 cursor-not-allowed"
                : "hover:bg-red-700 hover:text-white"
            }`}
            onClick={() => handleSelectHours(slot.time)}
            disabled={(slot.time === "Todo el Día" && areAllFullDaysDisabled(selectedDates)) || areAnyBlockedTimeSlots(selectedDates, slot.time)}
          >
            {slot.time}
          </button>
        ))}
      </div>

      {/* Botón para confirmar la reserva dentro del modal */}
      <div className="mt-4 flex justify-between">
        <button
          className="bg-gray-300 text-black font-semibold hover:bg-gray-400 py-2 px-4 rounded-xl"
          onClick={() => setShowTimeModal(false)}
        >
          Cancelar
        </button>
        <button
          className="py-2 px-4 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700"
          onClick={() => {
            setShowTimeModal(false);
          }}
        >
          Confirmar Horas
        </button>
      </div>
    </div>
  </div>
)}

      <div className=' w-[250px] md:w-full '>
      {(selectedHours.length > 0 && isReservationConfirmed === false) && (
              <div className=" border rounded-md p-4">
                <h3 className="font-semibold text-sm sm:text-base">
                {calendarMode === "multiple" && selectedDates.length > 0 
  ? `Fechas seleccionadas: ${selectedDates.map(date => format(date, "dd MMMM")).join(", ")}` // Mostrar solo día y mes
  : formatDate(range.from, range.to) // Mostrar el rango si está en modo "range"
}
    </h3>
                <p className="mt-2 text-xs sm:text-base text-gray-800">Horas seleccionadas: {selectedHours.join(", ")}</p>
                {
  conflictDays.length > 0 ? (
    <div className="mt-2 sm:mt-4">
      <p className="text-red-600 text-xs sm:text-base ">
        Conflicto de horario en los días seleccionados. Por favor, resuelva los conflictos antes de continuar.
      </p>
      <ul className="mt-2 text-red-600 text-xs sm:text-base">
        {conflictDetails.map((conflict, index) => (
          <li key={index}>- {conflict.date}</li>
        ))}
      </ul>
      <button
        className="mt-2 sm:mt-4 py-1.5 sm:py-2 px-4 rounded-lg font-semibold  transition duration-200 ease-in-out text-xs sm:text-base shadow-md bg-red-600 hover:bg-red-700 text-white"
        onClick={() => setEditingConflicts(true)}
      >
        Resolver Conflictos
      </button>
    </div>
  ) : (
    <div className=" mt-2 sm:mt-4">
      {reservationDetails.dates.some(detail => detail.timeSlots.length > 0) ? (
        <button
          className="py-1.5 sm:py-2 px-4 rounded-lg font-semibold  transition duration-200 ease-in-out text-xs sm:text-base shadow-md bg-red-600 hover:bg-red-700 text-white"
          onClick={handleConfirmReservation}
        >
          Confirmar Reserva
        </button>
      ) : (
        <>
          <p className="text-red-600 mb-2 text-xs sm:text-base">
            Para continuar, debes seleccionar al menos una fecha con un horario válido.
          </p>
          <button
            className="py-1.5 sm:py-2 px-4 rounded-lg font-semibold  transition duration-200 ease-in-out text-xs sm:text-base shadow-md bg-red-600 opacity-50 text-white cursor-not-allowed"
            disabled
          >
            Confirmar Reserva
          </button>
        </>
      )}
    </div>
  )
}
              </div>
            )}

             {/* Mostrar los detalles de la reserva solo después de la confirmación */}
    {isReservationConfirmed && (
      <div className=" border rounded-md p-4">
        <h3 className="font-semibold text-sm sm:text-base">Detalles de la reserva</h3>

        {/* Mostrar el rango de fechas */}
        <p className="mt-2 text-xs sm:text-base text-gray-800">Rango de fechas: {calendarMode === "multiple" && selectedDates.length > 0 
  ? `${selectedDates.map(date => format(date, "dd MMMM")).join(", ")}` // Mostrar solo día y mes
  : formatDate(range.from, range.to) // Mostrar el rango si está en modo "range"
}</p>

        {/* Mostrar horas seleccionadas */}
        <p className="mt-2 text-xs sm:text-base text-gray-800">Horas seleccionadas: {selectedHours.join(", ")}</p>

        {/* Mostrar fechas omitidas (sin selección de horarios) */}
        {reservationDetails.dates
          .filter(detail => detail.timeSlots.length === 0)
          .length > 0 && (
          <div className=" mt-2 sm:mt-4 ">
            <h4 className="font-semibold text-sm sm:text-base">Fechas omitidas:</h4>
            <ul className=" mt-1 sm:mt-2 text-xs sm:text-base text-gray-800">
              {reservationDetails.dates
                .filter(detail => detail.timeSlots.length === 0)
                .map((detail, index) => (
                  <li key={index}>- {formatDate(detail.date)}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Mostrar fechas con horarios diferentes */}
{
  (() => {
    if (!reservationDetails.dates.length) return null; // Manejar el caso cuando no hay fechas
    
    // Obtener todos los horarios en un array
    const allTimeSlots = reservationDetails.dates.flatMap(detail => detail.timeSlots);
    
    // Contar la frecuencia de cada horario
    const timeSlotFrequency = allTimeSlots.reduce((acc, slot) => {
      acc[slot] = (acc[slot] || 0) + 1;
      return acc;
    }, {});
    
    // Encontrar el horario más frecuente
    const maxFrequency = Math.max(...Object.values(timeSlotFrequency));
    const mostCommonTimeSlots = Object.keys(timeSlotFrequency).filter(slot => timeSlotFrequency[slot] === maxFrequency);
    
    // Filtrar fechas con horarios diferentes de los más comunes
    const datesWithDifferentTimes = reservationDetails.dates.filter(detail =>
      detail.timeSlots.length > 0 &&
      !mostCommonTimeSlots.every(slot => detail.timeSlots.includes(slot))
    );
    
    // Mostrar fechas con horarios diferentes
    if (datesWithDifferentTimes.length > 0) {
      return (
        <div className="mt-2 sm:mt-4">
          <h4 className="font-semibold text-sm sm:text-base">Fechas con horarios diferentes:</h4>
          <ul className=" mt-1 sm:mt-2 text-xs sm:text-base text-gray-800">
            {datesWithDifferentTimes.map((detail, index) => (
              <li key={index}>
                Fecha: {formatDate(detail.date)} - Horarios: {detail.timeSlots.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    return null; // Si no hay fechas con horarios diferentes
  })()
}
      </div>
    )}
      </div>
      {editingConflicts && (
        <EditConflictForm conflictDays={conflictDays} onClose={()=>setEditingConflicts(false)} onSave={handleSaveConflicts} />
      )}
    </div>
  );
};

export default Calendario;