"use client"
import React, { useState } from 'react';

const PricingInteractive = ({ priceData, fullWidth = false }) => {
  const [selectedOption, setSelectedOption] = useState('privateOffice');
  const [hours, setHours] = useState(1);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setHours(1); // Reinicia a 1 cuando se cambia la opción
  };

  const handleHoursChange = (e) => {
    setHours(Number(e.target.value));
  };

  const calculatePrice = () => {
    if (selectedOption === 'privateOffice') {
      if (priceData.type === 'capacitacion') {
        switch (hours) {
          case 1:
            return priceData.price_for_hour;
          case 2:
            return priceData.price_for_two_hours;
          case 3:
            return 230;
          case 4:
            return priceData.price_for_halfday;
          case 5:
            return priceData.price_for_five_to_six_hours;
          case 6:
            return priceData.price_for_day;
          default:
            return 0;
        }
      } else {
        switch (hours) {
          case 1:
            return priceData.price_for_hour;
          case 2:
            return priceData.price_for_two_hours;
          case 3:
            return priceData.price_for_halfday;
          case 4:
            return priceData.price_for_five_to_six_hours;
          case 5:
            return priceData.price_for_day;
          default:
            return 0;
        }
      }
    } else {
      switch (hours) {
        case 1:
          return priceData.price_for_day;
        case 2:
          return priceData.price_for_halfWeek;
        case 3:
          return priceData.price_for_week;
        case 4:
          return priceData.price_for_halfMonth;
        case 5:
          return priceData.price_for_month;
        default:
          return 0;
      }
    }
  };

  const maxHours = selectedOption === 'privateOffice' && priceData.type === 'capacitacion' ? 6 : 5;

  const getLabel = () => {
    if (selectedOption === 'privateOffice') {
      if (priceData.type === 'capacitacion') {
        switch (hours) {
          case 1:
            return "1 Hora";
          case 2:
            return "2 Horas";
          case 3:
            return "3 Horas";
          case 4:
            return "4 Horas";
          case 5:
            return "5 a 6 Horas";
          case 6:
            return "Por Día";
          default:
            return "";
        }
      } else {
        switch (hours) {
          case 1:
            return "1 Hora";
          case 2:
            return "2 Horas";
          case 3:
            return "Medio Día";
          case 4:
            return "5 a 6 Horas";
          case 5:
            return "Por Día";
          default:
            return "";
        }
      }
    } else {
      switch (hours) {
        case 1:
          return "Un Día";
        case 2:
          return "3 a 4 Días";
        case 3:
          return "Una Semana";
        case 4:
          return "15 Días";
        case 5:
          return "Por Mes";
        default:
          return "";
      }
    }
  };

  const rangeWidth = 100; // width of the range input in percentage

  return (
    <div className='my-8 sm:my-16 px-4'>
      <div className={`max-w-[1100px] w-full ${fullWidth ? '' : 'sm:w-4/5'} m-auto flex flex-row justify-between items-start gap-4 sm:gap-8 `}>
        <div className='w-full flex flex-col gap-1 md:gap-2'>
          <div className="flex flex-row gap-5 ">
            <div className='flex items-center'>
              <input 
                type="radio" 
                id="privateOffice" 
                name="officeType" 
                value="privateOffice"
                checked={selectedOption === 'privateOffice'}
                onChange={handleOptionChange}
                className="form-radio h-4 w-4 sm:h-5 sm:w-5"
                style={{
                  accentColor: '#ef4444',
                }}
              />
              <label htmlFor="privateOffice" className=" ml-1 sm:ml-2 text-[0.8rem] sm:text-base font-medium text-gray-700">Por Horas</label>
            </div>
            <div className='flex items-center'>
              <input 
                type="radio" 
                id="meetingRoom" 
                name="officeType" 
                value="meetingRoom"
                checked={selectedOption === 'meetingRoom'}
                onChange={handleOptionChange}
                className="form-radio h-4 w-4 sm:h-5 sm:w-5"
                style={{
                  accentColor: '#ef4444',
                }}
              />
              <label htmlFor="meetingRoom" className=" ml-1 sm:ml-2 text-[0.8rem] sm:text-base font-medium text-gray-700">Por Días</label>
            </div>
          </div>

          <div className="relative mt-2 sm:mt-4">
            <input
              type="range"
              id="hours"
              name="hours"
              min="1"
              max={maxHours}
              value={hours}
              onChange={handleHoursChange}
              className="cursor-pointer appearance-none w-full bg-transparent focus:outline-none"
              style={{
                '--thumb-size': '20px',
                '--track-height': '16px',
                '--thumb-color': '#dc2626',
                '--track-color': '#e5e7eb',
                '--fill-color': '#ef4444',
              }}
            />
            <div
              className="absolute text-xs sm:text-sm font-semibold text-red-600"
              style={{
                left: `calc(${((hours - 1) / (maxHours - 1)) * rangeWidth}% - ${((hours - 1) / (maxHours - 1)) * 40}px)`, // Adjust the position of the label
                top: '1.5rem',
              }}
            >
              {getLabel()}
            </div>
            <style jsx>{`
              input[type='range']::-webkit-slider-runnable-track {
                width: 100%;
                height: var(--track-height);
                background: var(--track-color);
                border-radius: 10px;
                background: linear-gradient(to right, var(--fill-color) 0%, var(--fill-color) ${(hours - 1) * (100 / (maxHours - 1))}%, var(--track-color) ${(hours - 1) * (100 / (maxHours - 1))}%, var(--track-color) 100%);
              }
              input[type='range']::-webkit-slider-thumb {
                appearance: none;
                width: var(--thumb-size);
                height: var(--thumb-size);
                background: var(--thumb-color);
                border-radius: 50%;
                cursor: pointer;
                margin-top: -2px; /* Offset for centering the thumb */
              }
              input[type='range']::-moz-range-track {
                width: 100%;
                height: var(--track-height);
                background: var(--track-color);
                border-radius: 10px;
              }
              input[type='range']::-moz-range-progress {
                background: var(--fill-color);
              }
              input[type='range']::-moz-range-thumb {
                width: var(--thumb-size);
                height: var(--thumb-size);
                background: var(--thumb-color);
                border-radius: 50%;
                cursor: pointer;
              }
              input[type='range']::-ms-track {
                width: 100%;
                height: var(--track-height);
                background: transparent;
                border-color: transparent;
                color: transparent;
              }
              input[type='range']::-ms-fill-lower {
                background: var(--fill-color);
                border-radius: 10px;
              }
              input[type='range']::-ms-fill-upper {
                background: var(--track-color);
                border-radius: 10px;
              }
              input[type='range']::-ms-thumb {
                width: var(--thumb-size);
                height: var(--thumb-size);
                background: var(--thumb-color);
                border-radius: 50%;
                cursor: pointer;
              }
            `}</style>
          </div>
        </div>

        <div className="">
          <div className='gap-1 border-2 border-red-600 shadow-md rounded-xl p-[8px] sm:p-4 w-[90px] sm:w-[110px] md:w-[140px] lg:w-[150px] flex flex-col items-start hover:scale-105 hover:transition-all hover:duration-300'>
          <h3 class="text-black text-[0.6rem] md:text-base font-bold leading-tight">Costo</h3>
            <p className="flex flex-row items-baseline gap-1 text-black tracking-tighter">
              <span className="text-black text-lg sm:text-xl md:text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">{`${calculatePrice()}`}</span>
              <span className="text-black text-[0.6rem] md:text-base font-bold leading-tight">Bs</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingInteractive;