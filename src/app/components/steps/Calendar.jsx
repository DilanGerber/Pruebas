"use client"
import React, { useContext, useState, useEffect } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

import { Calendar } from "../../../components/ui/calendar"

const Calendario = () => {
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [range, setRange] = useState({ from: null, to: null });
  const [timeSlot, setTimeSlot] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});

  // Función para obtener las reservas desde el backend
  const fetchReservations = async () => {
    try {
      const response = await fetch(`https://cowork-backend.up.railway.app/reservations/office/66ada0c79717df74ab14d493`);
      const data = await response.json();

      const timeSlots = data.reduce((acc, reservation) => {
        const dateKey = new Date(reservation.date[0]).toISOString().split('T')[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        // Si está reservado todo el día, bloquea el día completo
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

  // Generar la lista de horarios
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
    return blockedTimes.includes("Todo el Día") || blockedTimes.length >= 13; // 12 horarios + "Todo el Día"
  };

  const isBlockedTimeSlot = (day, time) => {
    const dayString = day.toISOString().split('T')[0];
    return blockedTimeSlots[dayString]?.includes(time);
  };

  const isFullDayDisabled = (day) => {
    const dayString = day.toISOString().split('T')[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
    // Deshabilitar "Todo el Día" si ya hay alguna hora reservada en ese día
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
    setSelectedTimeSlots([]); // Resetear la selección de horas al cambiar la fecha
  };

  const handleTimeSlotClick = (time) => {
    const dayString = range?.from?.toISOString().split('T')[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];

    // Prevenir selección de "Todo el Día" si hay horas reservadas
    if (time === "Todo el Día" && blockedTimes.length > 0) {
      return;
    }

    // Si se selecciona "Todo el Día"
    if (time === "Todo el Día") {
      setSelectedTimeSlots(["Todo el Día"]); // Solo se selecciona "Todo el Día"
    } else {
      // Si "Todo el Día" está seleccionado, deseleccionarlo primero
      if (selectedTimeSlots.includes("Todo el Día")) {
        setSelectedTimeSlots([time]);
      } else {
        // Toggle para agregar o eliminar horarios seleccionados
        setSelectedTimeSlots((prevSelected) =>
          prevSelected.includes(time)
            ? prevSelected.filter((t) => t !== time)
            : [...prevSelected, time]
        );
      }
    }
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