import React, { useContext } from 'react'
import { StepperContext } from '@/contexts/StepperContex'

const Calendar = () => {

  const { calendarData, setCalendarData } = useContext(StepperContext)

  const handlerChange = (e) => {
    const { name, value } = e.target
    setCalendarData({...calendarData, [name]: value})
  }

  return (
    <div className=' flex flex-col'>
      <div className=' w-full mx-2 flex-1'>
        <div className=' font-bold h-6 mt-3 text-gray-500 text-xs leading-8 uppercase'>
          {" "}
          Username
        </div>
        <div className=' bg-white my-2 p-1 flex border border-gray-200 rounded'>
          <input 
            type="text" 
            onChange={handlerChange}
            name='username'
            value={calendarData["username"] || ""}
            placeholder='Username'
            className=' p-1 px-2 appearance-none outline-none w-full text-gray-800'
          />
        </div>
      </div>
    </div>
  )
}

export default Calendar