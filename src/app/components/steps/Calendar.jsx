"use client"
import React, { useContext, useState, useEffect } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

import { Calendar } from "../../../components/ui/calendar"
import { format, eachDayOfInterval } from 'date-fns';
import EditConflictForm from '../EditConflictForm';

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

  const { state, dispatch } = useContext(StepperContext);

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
  }, [state.range, state.selectedHours, state.isReservationConfirmed, state.dates, state.officeId]);
  
  // Fetch reservations
  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `https://cowork-backend.up.railway.app/reservations/office/66ada0c79717df74ab14d493`
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
  const handleDateChange = (newRange) => {
    setRange(newRange);
    setSelectedHours([]);
    setConflictDays([]);
    setConflictDetails([]);
    setReservationDetails(null); // Resetea los detalles de la reserva al cambiar el rango
    setIsReservationConfirmed(false)
    dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: false });
    // Si se selecciona un rango, permitimos todas las opciones de hora
    if (newRange?.from && newRange.to) {
      setTimeSlot((prev) => prev.map(slot => ({
        ...slot,
        disabled: false
      })));
  
      // Actualizar reservationDetails con un rango pero sin horas aún
      updateReservationDetails(newRange, selectedHours);
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
    if (!range.from) return;
  
    const days = range.to
      ? eachDayOfInterval({ start: range.from, end: range.to })
      : [range.from];
  
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
        userId: "6667aef2957e2e153ec1bb79", // Hardcoded userId
        officeId: "66ada0c79717df74ab14d493", // Hardcoded officeId
        dates: newReservationData,
      };
  
      setReservationDetails(reservationPayload);
    }
  };

  const handleConfirmReservation = () => {
    // Filtrar las fechas para eliminar aquellas que tengan timeSlots como un array vacío
  const cleanedDates = reservationDetails.dates.filter(detail => detail.timeSlots.length > 0);

  // Crear una nueva versión de reservationDetails con las fechas filtradas
  const updatedReservationDetails = {
    ...reservationDetails,
    dates: cleanedDates,
  };

  // Despachar la acción para guardar el estado actualizado
  dispatch({
    type: 'SET_CALENDAR_DATA',
    payload: reservationDetails.dates, // Guardamos las fechas limpias
  });
  dispatch({ type: 'SET_OFFICE_ID', payload: updatedReservationDetails.officeId });

  // Despachar las acciones para range y selectedHours
  dispatch({ type: 'SET_RANGE', payload: range });
  dispatch({ type: 'SET_SELECTED_HOURS', payload: selectedHours });
  
    // Marcar la reserva como confirmada
    dispatch({ type: 'CONFIRM_RESERVATION' });
    
    // Marcar la reserva como confirmada
    setIsReservationConfirmed(true);
    dispatch({ type: 'COMPLETE_STEP', step: 'calendar', completed: true });
  };

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className='flex md:flex-row flex-col md:justify-between justify-center md:items-start items-center gap-2'>
      <div className="flex items-center justify-center">
        <Calendar
          numberOfMonths={numberOfMonths}
          mode="range"
          selected={range}
          onSelect={handleDateChange}
          disabled={(day) => isPastDay(day) || isBlockedDay(day)}
          className="rounded-md border"
        />
      </div>
      <div className='"flex items-center justify-center w-[250px] md:w-full '>
        {range?.from && (
          <div className='border rounded-md p-4 overflow-auto' style={{maxHeight: "328px"}}>
            <h3 className="font-semibold text-sm">Seleccione Horas para {formatDate(range.from, range?.to)}</h3>
            <div  className="grid grid-cols-1 gap-2 mt-4 ">
              {timeSlot.map((slot) => (
                <button
                  key={slot.time}
                  className={` py-1 sm:py-2 px-4 text-center text-sm md:text-base border rounded-full font-medium text-gray-800 ${
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
      </div>
      </div>
      <div className=' w-[250px] md:w-full '>
      {(selectedHours.length > 0 && isReservationConfirmed === false) && (
              <div className=" border rounded-md p-4">
                <h3 className="font-semibold text-sm sm:text-base">{formatDate(range.from, range.to)}</h3>
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
        <p className="mt-2 text-xs sm:text-base text-gray-800">Rango de fechas: {formatDate(range.from, range.to)}</p>

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