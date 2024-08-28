"use client"
import React, { useContext, useState } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

import { Calendar } from "../../../components/ui/calendar"

const Calendario = () => {
    const { state, dispatch } = useContext(StepperContext);
    const { calendarData } = state;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...calendarData,
            [name]: value,
        };

        dispatch({ type: 'SET_CALENDAR_DATA', payload: updatedData });

        // Verifica si todos los campos del formulario están completos
        const isComplete = Object.values(updatedData).every(field => field !== '');
        if (isComplete) {
            dispatch({ type: 'COMPLETE_STEP', step: 'calendar' });
        }
    };

    const [date, setDate] = useState(new Date);

    return (<>
        <div className='flex flex-col'>
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
        </div>
        <div className=' flex items-center justify-center'>
        <Calendar
          numberOfMonths={2}
          mode="range"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
    
        </div>
    </>);
};

export default Calendario;


    // const [isClient, setIsClient] = useState(false);

    // useEffect(() => {
    //   setIsClient(true);
    //   import("cally");
    // }, []);

    // if (!isClient) {
    //     return null;
    // }

// {/* <calendar-range months="2">
//                 <div className="flex flex-wrap gap-4 justify-center">
//                 <calendar-month></calendar-month>
//                 <calendar-month offset="1"></calendar-month>
//                 </div>
//             </calendar-range>

//             <style jsx global>{`
//           calendar-month {
//             --color-accent: #dc2626; /* Color rojo oscuro */
//             --color-text-on-accent: #ffffff; /* Texto blanco sobre fondo rojo oscuro */
//           }

//           /* Estiliza los días individuales */
//           calendar-month::part(day) {
//             color: #000000; /* Color del texto de los días */
//           }

//           /* Estiliza los días seleccionados */
//           calendar-month::part(day-selected) {
//             background-color: #dc2626; /* Color de fondo para días seleccionados */
//             color: #ffffff; /* Color del texto en días seleccionados */
//           }

//           /* Estiliza el rango seleccionado */
//           calendar-month::part(range-inner) {
//             background-color: #ef3344; /* Color de fondo para el rango seleccionado */
//             color: #ffffff; /* Texto blanco en el rango seleccionado */
//           }

//           /* Estiliza el inicio del rango */
//           calendar-month::part(range-start) {
//             background-color: #dc2626; /* Color para el inicio del rango */
//             color: #ffffff; /* Texto blanco en el inicio del rango */
//             border-radius: 0.375rem 0 0 0.375rem; /* Bordes exteriores redondeados */
//           }

//           /* Estiliza el fin del rango */
//           calendar-month::part(range-end) {
//             background-color: #dc2626; /* Color para el fin del rango */
//             color: #ffffff; /* Texto blanco en el fin del rango */
//             border-radius: 0 0.375rem 0.375rem 0; /* Bordes exteriores redondeados */
//           }

//           /* Si solo hay una fecha seleccionada, redondea todos los bordes */
//           calendar-month::part(range-start):last-child,
//           calendar-month::part(range-end):first-child {
//             border-radius: 0.375rem; /* Redondea todos los bordes */
//           }
//         `}</style> */}