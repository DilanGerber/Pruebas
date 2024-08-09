"use client"
import React, { useState } from 'react'
import MultiStep from './MultiStep'
import SteperControl from './SteperControl'
import Calendar from './steps/Calendar'
import Form from './steps/Form'
import Payment from './steps/Payment'
import { StepperContext } from '@/contexts/StepperContex'
import IconBack from './icons/IconBack'


const Modal = () => {
    const [isOpen, setIsOpen] = useState(false)

    const handlerClose = () => {
        setIsOpen(false)
    }

    const handlerOpen = () => {
        setIsOpen(true)
    }

    const [calendarData, setCalendarData] = useState('')

    const steps = [
        "Calendar",
        "Form",
        "Payment"
    ]

    const [currentStep, setCurrentStep] = useState(1)

    const displayStep = (step) => {
        switch(step) {
            case 1:
                return <Calendar/>
            case 2:
                return <Form/>
            case 3: 
                return <Payment/>
            default:
        }
    }

    const handlerClick = (direction) => {
        let newStep = currentStep

        direction === "next" ? newStep++ : newStep--

        newStep > 0 && newStep <= steps.length && setCurrentStep(newStep)
    }

  return (
    <div className='my-4 sm:my-8 px-4'>
        <div className='relative max-w-[1100px] w-full sm:w-4/5 m-auto flex flex-row justify-between items-start gap-4 sm:gap-8'>
        <button className=' bg-red-600 py-2 px-10 rounded-xl w-full border border-transparent shadow-sm text-sm sm:text-base font-medium transition-colors duration-300  text-white hover:bg-red-700  ' onClick={handlerOpen}>Reservar</button>
        <button className=' bg-gray-300 py-2 px-8 rounded-xl w-full border border-transparent shadow-sm text-sm sm:text-base font-semibold transition-colors duration-300  text-black hover:bg-gray-400' onClick={() => window.open("https://wa.me/59175888736", "_blank")}>Consultar</button>
        {isOpen && (
            <div className=' fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className=' bg-white relative  rounded flex flex-col justify-center items-center gap-4 sm:w-2/3 w-3/4'>
                    <div className=' absolute top-0 left-0 mt-1 ml-3 sm:mt-2 sm:ml-4'>
                        <IconBack className=" w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-gray-500" onClick={handlerClose} />
                    </div>
                    <div className=' container mx-auto shadow-lg  rounded-2xl py-2 sm:pt-5 '>
                        <div className=' container horizontal mt-5'>
                            <MultiStep steps={steps} currentStep={currentStep}/> 
                            <div className=' my-5 sm:my-10 p-5 sm:p-10'>
                                <StepperContext.Provider value={{
                                    calendarData,
                                    setCalendarData
                                }}>
                                    {displayStep(currentStep)}
                                </StepperContext.Provider>
                            </div>
                        </div>
                        <SteperControl steps={steps} currentStep={currentStep} handlerClick={handlerClick}/>
                    </div>
                </div>
            </div>
        )}
        </div>
    </div>
  )
}

export default Modal