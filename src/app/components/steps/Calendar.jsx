"use client"
import React, { useContext, useState, useEffect } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

import { Calendar } from "../../../components/ui/calendar"

const Calendario = () => {
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState();
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState({});

  // Función para obtener las reservas desde el backend
  const fetchReservations = async () => {
    try {
      const response = await fetch(`https://cowork-backend.up.railway.app/reservations/office/66ada0c79717df74ab14d493`);
      const data = await response.json();

      // Procesar las fechas bloqueadas y convertirlas a UTC
      const timeSlots = data.reduce((acc, reservation) => {
        const dateKey = new Date(reservation.date[0]).toISOString().split('T')[0];

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        // Si está reservado todo el día, bloquea el día completo
        if (reservation.timeSlots.includes("Todo el Día")) {
          acc[dateKey] = ["Todo el Día"];
        } else {
          // Agregar los horarios reservados individualmente
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
    
    // Comparar solo las fechas (sin horas) para evitar bloqueos prematuros
    const isSameDay = now.toDateString() === selectedDate.toDateString();
  
    // Permitir seleccionar el día actual si es antes de las 5 PM
    if (isSameDay && now.getHours() < 17) {
      return false;
    }
  
    // Bloquear si el día es pasado o si es el mismo día pero después de las 5 PM
    return selectedDate < now;
  };

  const isBlockedDay = (day) => {
    const dayString = day.toISOString().split('T')[0];
    const blockedTimes = blockedTimeSlots[dayString] || [];
    
    // Bloquear el día completo si tiene la reserva "Todo el Día" o si están todos los horarios ocupados
    return blockedTimes.includes("Todo el Día") || blockedTimes.length >= 13; // 12 horarios + "Todo el Día"
  };

  const isBlockedTimeSlot = (day, time) => {
    const dayString = day
    return blockedTimeSlots[dayString]?.includes(time);
  };

  useEffect(() => {
    getTime();
  }, []);

  useEffect(() => {
    // Función para actualizar el número de calendarios según el ancho de la ventana
    const updateNumberOfMonths = () => {
      if (window.innerWidth >= 768) {
        setNumberOfMonths(2); // Pantallas grandes, muestra 2 calendarios
      } else {
        setNumberOfMonths(1); // Pantallas pequeñas, muestra 1 calendario
      }
    };

    updateNumberOfMonths();
    window.addEventListener('resize', updateNumberOfMonths);

    return () => {
      window.removeEventListener('resize', updateNumberOfMonths);
    };
  }, []);

  return (
    <div className='flex grid-flow-row gap-10'>
      <div className='flex items-center justify-center'>
        <Calendar
          numberOfMonths={numberOfMonths}
          mode="range"
          selected={date}
          onSelect={setDate}
          disabled={(day) => isPastDay(day) || isBlockedDay(day)}
          className="rounded-md border"
        />
      </div>
      <div>
        <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
          {timeSlot?.map((item, index) => (
            <h2
              key={index}
              onClick={() => !isBlockedTimeSlot(date, item.time) && setSelectedTimeSlot(item.time)}
              className={`py-2 px-4 text-center border rounded-full cursor-pointer 
              ${isBlockedTimeSlot(date, item.time) ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-red-600 hover:text-white'} 
              ${item.time === selectedTimeSlot && 'bg-red-600 text-white'}`}
            >
              {item.time}
            </h2>
          ))}
        </div>
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