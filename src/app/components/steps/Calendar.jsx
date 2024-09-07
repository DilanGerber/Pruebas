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
    return blockedTimes.length > 0 && !blockedTimes.includes("Todo el Día");
  };

  // Handle date change
  const handleDateChange = (newRange) => {
    setRange(newRange);
    setSelectedHours([]);
    setConflictDays([]);
  };

  // Handle hour selection
  const handleSelectHours = (hour) => {
    if (hour === "Todo el Día") {
      setSelectedHours(["Todo el Día"]);
    } else {
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

  // Check for conflicts, including full day reservations
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
  };

  // Resolve conflicts
  const handleResolveConflicts = () => {
    setEditingConflicts(true);
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
            <div className="mt-4">
              <h2 className="font-semibold">Selecciona los horarios</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {timeSlot.map((item, index) => {
                  const isBlocked = isBlockedTimeSlot(range.from, item.time);
                  const isFullDayDisabledFlag =
                    isFullDayDisabled(range.from) && item.time === "Todo el Día";

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        !isBlocked &&
                        !isFullDayDisabledFlag &&
                        handleSelectHours(item.time)
                      }
                      disabled={isBlocked || isFullDayDisabledFlag}
                      className={`py-2 px-4 text-center border rounded-full cursor-pointer 
                        ${selectedHours.includes(item.time)
                          ? "bg-red-600 text-white"
                          : "hover:bg-red-600 hover:text-white"} 
                        ${isBlocked || isFullDayDisabledFlag
                          ? "bg-gray-400 cursor-not-allowed"
                          : ""}`}
                    >
                      {item.time}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedHours.length > 0 && (
              <div className="mt-8 p-4 border rounded-lg bg-gray-100">
                <h3 className="text-lg font-semibold">Resumen de la Reserva</h3>
                <p className="mt-2">
                  <strong>Fecha:</strong> {formatDate(range.from, range.to)}
                </p>
                <p>
                  <strong>Horarios:</strong> {selectedHours.join(", ")}
                </p>
                {conflictDays.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-red-600 font-semibold">
                      Conflictos Detectados
                    </h4>
                    <ul className="list-disc list-inside">
                      {conflictDays.map((conflictDay, index) => (
                        <li key={index}>
                          {format(
                            new Date(conflictDay),
                            "PPP"
                          )}{" "}
                          - Horarios no disponibles
                        </li>
                      ))}
                    </ul>
                    <button
                      className="mt-4 py-2 px-4 bg-red-600 text-white rounded-full"
                      onClick={handleResolveConflicts}
                    >
                      Resolver Conflictos
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {editingConflicts && <EditConflictForm setEditingConflicts={setEditingConflicts} />}
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