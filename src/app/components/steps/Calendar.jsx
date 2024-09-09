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
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});
  const [selectedHours, setSelectedHours] = useState([]);
  const [conflictDays, setConflictDays] = useState([]);
  const [editingConflicts, setEditingConflicts] = useState(false);
  const [conflictDetails, setConflictDetails] = useState([]); // Lista de fechas con conflicto
  const [reservationDetails, setReservationDetails] = useState(null); // Estado para la reserva final

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
            acc[dateKey] = [];
          }

          if (timeSlots.includes("Todo el Día")) {
            acc[dateKey] = ["Todo el Día"];
          } else {
            acc[dateKey].push(...timeSlots);
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
    const blockedTimes = blockedTimeSlots[dayString] || [];
    return blockedTimes.includes("Todo el Día") || blockedTimes.length >= 13;
  };

  // Check if the time slot is blocked
  const isBlockedTimeSlot = (day, time) => {
    if (!(day instanceof Date) || isNaN(day)) {
      return false;
    }

    const dayString = day.toISOString().split("T")[0];
    return blockedTimeSlots[dayString]?.includes(time);
  };

  // Check if "Todo el Día" should be disabled
  const isFullDayDisabled = (day) => {
    const dayString = day?.toISOString().split("T")[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
  
    // Bloquear "Todo el Día" solo si todas las horas están bloqueadas
    return blockedTimes.length === 13; // 13 porque tienes 13 franjas horarias (8AM a 8PM + "Todo el Día")
  };

  // Handle date change
  const handleDateChange = (newRange) => {
    setRange(newRange);
    setSelectedHours([]);
    setConflictDays([]);
    setConflictDetails([]);
    setReservationDetails(null); // Reset the reservation details on new range selection
  };

  // Handle hour selection
  const handleSelectHours = (hour) => {
    // Si se selecciona "Todo el Día", deseleccionar todas las horas anteriores y seleccionar solo "Todo el Día"
    if (hour === "Todo el Día") {
      setSelectedHours(["Todo el Día"]);
    } else {
      // Si "Todo el Día" está seleccionado, se reemplaza por la nueva selección
      if (selectedHours.includes("Todo el Día")) {
        setSelectedHours([hour]);
      } else {
        setSelectedHours((prev) =>
          prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
        );
      }
    }
    
    checkForConflicts([...selectedHours, hour]);
  };

  // Check for conflicts and list conflicting days
  const checkForConflicts = (hours) => {
    if (!range.from) return;

    const days = eachDayOfInterval({
      start: range.from,
      end: range.to || range.from,
    });
    const conflicts = days.filter((day) => {
      const dayString = day.toISOString().split("T")[0];
      const blockedTimes = blockedTimeSlots[dayString] || [];

      // Caso 1: Si el día está reservado todo el día, cualquier hora genera conflicto
      if (blockedTimes.includes("Todo el Día")) {
        return true;
      }

      // Caso 2: Si se selecciona "Todo el Día" y hay horas reservadas, debe generar conflicto
      if (hours.includes("Todo el Día") && blockedTimes.length > 0) {
        return true;
      }

      // Caso 3: Horas coinciden con alguna hora reservada
      return hours.some((hour) => blockedTimes.includes(hour));
    });

    setConflictDays(conflicts);
    setConflictDetails(conflicts.map((day) => format(day, "PPP"))); // Formatear las fechas con conflicto
  };

  // Handle confirming the reservation and building the final data structure
  const handleConfirmReservation = () => {
    if (conflictDays.length === 0 && range.from && selectedHours.length > 0) {
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

      setReservationDetails(reservationPayload); // Guardar la estructura final en el estado
      console.log("Reserva confirmada:", reservationPayload);

      // Aquí puedes hacer el POST request al backend
      // sendReservationToBackend(reservationPayload);
    } else {
      console.error("No se puede confirmar la reserva debido a conflictos.");
    }
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
      if (window.innerWidth >= 768) {
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

  return (
    <div className="flex grid-flow-row gap-10">
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
      <div>
        {range?.from && (
          <>
            <h3 className="font-semibold">Seleccione Horas para {formatDate(range.from, range.to)}</h3>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {timeSlot.map((slot) => (
                <button
                  key={slot.time}
                  className={`py-2 px-4 text-center border rounded-full  ${
                    selectedHours.includes(slot.time)
                      ? "bg-red-600 text-white cursor-pointer"
                      : isBlockedTimeSlot(range.from, slot.time) || isFullDayDisabled(range.from)
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : "hover:bg-red-700 hover:text-white"
                  } `}
                  onClick={() => handleSelectHours(slot.time)}
                  disabled={isBlockedTimeSlot(range.from, slot.time) || isFullDayDisabled(range.from)}
                >
                  {slot.time}
                </button>
              ))}
            </div>

            {selectedHours.length > 0 && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="font-semibold">{formatDate(range.from, range.to)}</h3>
                <p className="mt-2">Horas seleccionadas: {selectedHours.join(", ")}</p>
                {conflictDays.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-red-600">
                      Conflicto de horario en los días seleccionados. Por favor, resuelva los conflictos antes de continuar.
                    </p>
                    <ul className="mt-2 text-red-600">
                      {conflictDetails.map((conflict, index) => (
                        <li key={index}>- {conflict}</li>
                      ))}
                    </ul>
                    <button
                      className="mt-4 py-2 px-4 bg-red-600 text-white rounded-full"
                      onClick={() => setEditingConflicts(true)}
                    >
                      Resolver Conflictos
                    </button>
                  </div>
                ) : (
                  <button
                    className="mt-4 py-2 px-4 bg-green-600 text-white rounded-full"
                    onClick={handleConfirmReservation}
                  >
                    Confirmar Reserva
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {editingConflicts && (
        <EditConflictForm setEditingConflicts={setEditingConflicts} />
      )}
    </div>
  );
};

export default Calendario;


// const { state, dispatch } = useContext(StepperContext);
// const { calendarData } = state;

// const handleChange = (e) => {
//     const { name, value } = e.target;
//     const updatedData = {
//         ...calendarData,
//         [name]: value,
//     };

//     dispatch({ type: 'SET_CALENDAR_DATA', payload: updatedData });

//     // Verifica si todos los campos del formulario están completos
//     const isComplete = Object.values(updatedData).every(field => field !== '');
//     if (isComplete) {
//         dispatch({ type: 'COMPLETE_STEP', step: 'calendar' });
//     }
// };



{/* <div className='flex flex-col'>
<div className='w-full mx-2 flex-1'>
    <div className='font-bold h-6 mt-3 text-gray-500 text-xs leading-8 uppercase'>
        {" "}
        Username
    </div>
    <div className='bg-white my-2 p-1 flex border border-gray-200 rounded'>
        <input 
            type="text" 
            onChange={handleChange}
            name='username'
            value={calendarData.username || ""}
            placeholder='Username'
            className='p-1 px-2 appearance-none outline-none w-full text-gray-800'
        />
    </div>
</div>
</div> */}