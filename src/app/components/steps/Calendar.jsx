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
const [conflictDetails, setConflictDetails] = useState([]);

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

  const isPastDay = (day) => {
    const now = new Date();
    const selectedDate = new Date(day);
    const isSameDay = now.toDateString() === selectedDate.toDateString();

    if (isSameDay && now.getHours() < 17) {
      return false;
    }

    return selectedDate < now;
  };

  const isBlockedDay = (day) => {
    const dayString = day.toISOString().split("T")[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
    return blockedTimes.includes("Todo el Día") || blockedTimes.length >= 13;
  };

  const isBlockedTimeSlot = (day, time) => {
    // console.log(day); // Depuración: verificar qué valor tiene `day`
  
    if (!(day instanceof Date) || isNaN(day)) {
      return false;
    }
  
    const dayString = day.toISOString().split("T")[0];
    return blockedTimeSlots[dayString]?.includes(time);
  };

  const isFullDayDisabled = (day) => {
    const dayString = day?.toISOString().split("T")[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
    return blockedTimes.length > 0 && !blockedTimes.includes("Todo el Día");
  };

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

  const handleDateChange = (newRange) => {
    setRange(newRange);
    setSelectedHours([]);
    setConflictDays([]);
  };

  const handleSelectHours = (hours) => {
    setSelectedHours(hours);
    checkForConflicts(hours);
  };

const checkForConflicts = (hours) => {
  const days = eachDayOfInterval({ start: range.from, end: range.to || range.from });
  const conflicts = days
    .filter(day => {
      const dayString = day.toISOString().split("T")[0];
      const blockedTimes = blockedTimeSlots[dayString] || [];
      return hours.some(hour => hour !== "Todo el Día" && blockedTimes.includes(hour));
    })
    .map(day => {
      const dayString = day.toISOString().split("T")[0];
      const blockedTimes = blockedTimeSlots[dayString] || [];
      const hasAnyBlockedTime = blockedTimes.length > 0; // Verificar si hay horas bloqueadas

      return {
        date: day,
        editableHours: hours.map(hour => {
          const isAvailable = !blockedTimes.includes(hour);

          // Si hay alguna hora bloqueada, deshabilitar "Todo el Día"
          if (hour === "Todo el Día" && hasAnyBlockedTime) {
            return {
              time: hour,
              available: false,
              selected: false,
            };
          }

          return {
            time: hour,
            available: isAvailable,
            selected: false,
          };
        }),
      };
    });

  console.log("Conflicts generados:", conflicts);
  setConflictDays(conflicts);
};

const handleResolveConflicts = () => {
  setConflictDays(prevDays =>
    prevDays.map(day => ({
      ...day,
      editableHours: timeSlot.map(item => ({
        time: item.time,
        available: !isBlockedTimeSlot(day, item.time),
        selected: selectedHours.includes(item.time)
      }))
    }))
  );
  setEditingConflicts(true);
};

  const formatDate = (from, to) => {
    if (to) {
      return `${format(new Date(from), "PPP")} hasta ${format(new Date(to), "PPP")}`;
    }
    return format(new Date(from), "PPP");
  };

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
            <div className="mt-4">
              <h2 className="font-semibold">Selecciona los horarios</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {timeSlot.map((item, index) => (
                  <h2
                    key={index}
                    onClick={() =>
                      handleSelectHours(
                        selectedHours.includes(item.time)
                          ? selectedHours.filter((t) => t !== item.time)
                          : [...selectedHours, item.time]
                      )
                    }
                    className={`py-2 px-4 text-center border rounded-full cursor-pointer 
                      ${selectedHours.includes(item.time) ? "bg-red-600 text-white" : "hover:bg-red-600 hover:text-white"} 
                      ${isBlockedTimeSlot(range.from, item.time) ? "bg-gray-400 cursor-not-allowed" : ""}`}
                  >
                    {item.time}
                  </h2>
                ))}
              </div>
            </div>
            {selectedHours.length > 0 && (
              <div className="mt-8 p-4 border rounded-lg bg-gray-100">
                <h3 className="text-lg font-semibold">Resumen de la Reserva</h3>
                <p className="mt-2">
                  <strong>Fecha:</strong> {formatDate(range.from, range.to)}
                </p>
                <p className="mt-2">
                  <strong>Horarios seleccionados:</strong> {selectedHours.join(", ")}
                </p>
              </div>
            )}
            {conflictDays.length > 0 && (
              <div className="mt-8 p-4 border rounded-lg bg-yellow-100">
                <h3 className="text-lg font-semibold">Advertencia de Conflictos</h3>
                <p className="mt-2">
                  Existen conflictos en los siguientes días con las horas seleccionadas:
                </p>
                <ul className="mt-2 list-disc pl-5">
                {conflictDays.map((day, index) => (
  <li key={index}>
    {day instanceof Date && !isNaN(day) ? format(day, "PPP") : "Fecha no válida"} - Horarios en conflicto
  </li>
))}
                </ul>
                <button onClick={handleResolveConflicts} className="mt-4 bg-red-600 text-white py-2 px-4 rounded">
                  Editar Conflictos
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {editingConflicts && (
        <EditConflictForm
          conflictDays={conflictDays}
          onClose={() => setEditingConflicts(false)}
        />
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