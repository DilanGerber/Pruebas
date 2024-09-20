"use client"
import React, { useState, useReducer } from 'react'
import { stepperReducer, initialState } from '@/contexts/StepperReducer'
import MultiStep from './MultiStep'
import SteperControl from './SteperControl'
import Calendario from './steps/Calendar'
import Form from './steps/Form'
import Payment from './steps/Payment'
import { StepperContext } from '@/contexts/StepperContext'
import IconBack from './icons/IconBack'
import CheckoutSuccess from './uiPayment/CheckoutSuccess'
import CheckoutError from './uiPayment/CheckoutError'


const Modal = () => {

    const [state, dispatch] = useReducer(stepperReducer, initialState);

    const [isOpen, setIsOpen] = useState(false)

    const handlerClose = () => {
        setIsOpen(false)
    }

    const handlerOpen = () => {
        setIsOpen(true)
    }

    const steps = [
        "Calendar",
        "Form",
        "Payment"
    ]

    const displayStep = (step) => {
        switch(step) {
            case 1:
                return <Calendario/>
            case 2:
                return <Form/>
            case 3: 
                return <Payment/>
            default:
        }
    }

    const displayContent = () => {
        if (state.checkoutStatus === 'success') {
            return (
                <>
                    <MultiStep steps={steps} currentStep={state.currentStep} completedSteps={true} />
                    <div className=' flex items-center justify-center'>
                        <CheckoutSuccess />
                    </div>
                </>
            );
        } else if (state.checkoutStatus === 'error') {
            return (
                <>
                    <MultiStep steps={steps} currentStep={state.currentStep} />
                    <div className=' flex items-center justify-center'>
                        <CheckoutError />
                    </div>
                </>
            );
        } else {
            return (
                <div>
                    <MultiStep steps={steps} currentStep={state.currentStep}/> 
                    <div  className='my-4 sm:mt-8 '>
                        {displayStep(state.currentStep)}
                    </div>
                    <SteperControl steps={steps} currentStep={state.currentStep} dispatch={dispatch} />
                </div>
            );
        }
    };

  return (
    <div className='my-4 sm:my-8 px-4'>
        <div className='relative max-w-[1100px] w-full sm:w-4/5 m-auto flex flex-row justify-between items-start gap-4 sm:gap-8'>
        <button className=' bg-red-600 py-2 px-10 rounded-xl w-full border border-transparent shadow-sm text-sm sm:text-base font-medium transition-colors duration-300  text-white hover:bg-red-700  ' onClick={handlerOpen}>Reservar</button>
        <button className=' bg-gray-300 py-2 px-8 rounded-xl w-full border border-transparent shadow-sm text-sm sm:text-base font-semibold transition-colors duration-300  text-black hover:bg-gray-400' onClick={() => window.open("https://wa.me/59175888736", "_blank")}>Consultar</button>
        {isOpen && (
            <div className=' fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                <div className=' bg-white relative  rounded flex flex-col items-center gap-4 sm:w-2/3 w-3/4 overflow-auto' style={{maxHeight: "604px"}} >
                    <div className=' absolute top-0 left-0 mt-1 ml-3 sm:mt-2 sm:ml-4'>
                        <IconBack className=" w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-gray-500" onClick={handlerClose} />
                    </div>
                    <StepperContext.Provider value={{ state, dispatch }}>
                        <div className=' w-full px-2 mx-auto  rounded-2xl py-2  sm:pt-5 '>
                            <div className=' horizontal mt-5'>
                                {displayContent()}
                            </div>
                        </div>
                    </StepperContext.Provider>
                </div>
            </div>
        )}
        </div>
    </div>
  )
}

export default Modal