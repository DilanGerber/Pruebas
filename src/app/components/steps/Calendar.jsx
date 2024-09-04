"use client"
import React, { useContext, useState, useEffect } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

import { Calendar } from "../../../components/ui/calendar"
import { format } from 'date-fns';

const Calendario = () => {
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [range, setRange] = useState({ from: null, to: null });
  const [timeSlot, setTimeSlot] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});

  const fetchReservations = async () => {
    try {
      const response = await fetch(`https://cowork-backend.up.railway.app/reservations/office/66ada0c79717df74ab14d493`);
      const data = await response.json();

      const timeSlots = data.reduce((acc, reservation) => {
        const dateKey = new Date(reservation.date[0]).toISOString().split('T')[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        if (reservation.timeSlots.includes("Todo el Día")) {
          acc[dateKey] = ["Todo el Día"];
        } else {
          acc[dateKey].push(...reservation.timeSlots);
        }

        return acc;
      }, {});

      setBlockedTimeSlots(timeSlots);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const getTime = () => {
    const timeList = [];
    for (let i = 8; i <= 12; i++) {
      timeList.push({ time: i + ':00 AM' });
    }
    for (let i = 1; i <= 8; i++) {
      timeList.push({ time: i + ':00 PM' });
    }
    timeList.push({ time: 'Todo el Día' });
    setTimeSlot(timeList);
  };

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
    const dayString = day.toISOString().split('T')[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
    return blockedTimes.includes("Todo el Día") || blockedTimes.length >= 13;
  };

  const isBlockedTimeSlot = (day, time) => {
    const dayString = day?.toISOString().split('T')[0];
    return blockedTimeSlots[dayString]?.includes(time);
  };

  const isFullDayDisabled = (day) => {
    const dayString = day?.toISOString().split('T')[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
    return blockedTimes.length > 0 && !blockedTimes.includes("Todo el Día");
  };

  useEffect(() => {
    getTime();
  }, []);

  useEffect(() => {
    const updateNumberOfMonths = () => {
      if (window.innerWidth >= 768) {
        setNumberOfMonths(2);
      } else {
        setNumberOfMonths(1);
      }
    };

    updateNumberOfMonths();
    window.addEventListener('resize', updateNumberOfMonths);

    return () => {
      window.removeEventListener('resize', updateNumberOfMonths);
    };
  }, []);

  const handleDateChange = (newRange) => {
    setRange(newRange);
    setSelectedTimeSlots([]); // Reiniciar la selección de horarios al cambiar la fecha
  };

  const handleTimeSlotClick = (time) => {
    const dayString = range?.from?.toISOString().split('T')[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];

    if (time === "Todo el Día" && blockedTimes.length > 0) {
      return;
    }

    if (time === "Todo el Día") {
      setSelectedTimeSlots(["Todo el Día"]);
    } else {
      setSelectedTimeSlots((prevSelected) => {
        // Si "Todo el Día" está seleccionado, deseleccionamos todo
        if (prevSelected.includes("Todo el Día")) {
          return [time];
        }

        // Alternar la selección de horarios individuales
        if (prevSelected.includes(time)) {
          return prevSelected.filter((t) => t !== time);
        } else {
          return [...prevSelected, time];
        }
      });
    }
  };

  // Formatear la fecha seleccionada o el rango de fechas
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {timeSlot?.map((item, index) => (
              <h2
                key={index}
                onClick={() =>
                  !isBlockedTimeSlot(range.from, item.time) &&
                  handleTimeSlotClick(item.time)
                }
                className={`py-2 px-4 text-center border rounded-full cursor-pointer 
              ${isBlockedTimeSlot(range.from, item.time) || (item.time === 'Todo el Día' && isFullDayDisabled(range.from)) ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-red-600 hover:text-white'} 
              ${
                selectedTimeSlots.includes(item.time) && 'bg-red-600 text-white'
              }`}
              >
                {item.time}
              </h2>
            ))}
          </div>
        )}

        {/* Sección de detalle de reserva */}
        {range?.from && selectedTimeSlots.length > 0 && (
          <div className="mt-8 p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold">Detalle de la Reserva</h3>
            <p className="mt-2">
              <strong>Fecha:</strong>{" "}
                {formatDate(range.from, range.to)}
            </p>
            <p className="mt-2">
              <strong>Horarios seleccionados:</strong>{" "}
                {selectedTimeSlots}
            </p>
          </div>
        )}
      </div>
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