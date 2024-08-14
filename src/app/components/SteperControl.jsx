"use client"
import React, { useContext, useState } from 'react';
import { StepperContext } from '@/contexts/StepperContext';
import PaymentButton from './uiPayment/PaymentButton';

const SteperControl = ({ steps }) => {
    const { state, dispatch } = useContext(StepperContext);
    const { currentStep, stepsCompleted } = state;

    const handleNextClick = () => {
        if (currentStep < steps.length) {
            dispatch({ type: 'SET_CURRENT_STEP', step: currentStep + 1 });
        }
    };

    const handleBackClick = () => {
        if (currentStep > 1) {
            dispatch({ type: 'SET_CURRENT_STEP', step: currentStep - 1 });
        }
    };

    const isNextDisabled = () => {
        switch (currentStep) {
            case 1:
                return !stepsCompleted.calendar;
            case 2:
                return !stepsCompleted.form;
            case 3:
                return !stepsCompleted.payment;
            default:
                return true;
        }
    };

    return (
        <div className='container flex justify-around mt-2 mb-4 sm:mt-4 sm:mb-8'>
            <button
                onClick={handleBackClick}
                className={`bg-white text-slate-400 uppercase py-1.5 sm:py-2 px-4 rounded-lg font-semibold border-2 border-slate-300 transition duration-200 ease-in-out text-xs sm:text-base shadow-md ${
                    currentStep === 1 ? "  opacity-50 cursor-not-allowed" : "hover:bg-slate-700 hover:text-white cursor-pointer"
                }`}
                disabled={currentStep === 1}
            >
                Volver
            </button>

            {currentStep === steps.length ? ( <PaymentButton isNextDisabled={isNextDisabled} /> ) : (
                <button
                    onClick={handleNextClick}
                    className={`bg-red-600 text-white uppercase py-1.5 sm:py-2 px-4 rounded-lg font-semibold transition duration-200 ease-in-out text-xs sm:text-base shadow-md ${
                        isNextDisabled() ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 hover:text-white cursor-pointer"
                    }`}
                    disabled={isNextDisabled()}
                >
                    Siguiente
                </button>
            )}

        </div>
    );
};

export default SteperControl;


// (
//     <button 
    // className={`flex items-center py-1.5 sm:py-2 px-4 rounded-lg font-semibold transition duration-200 ease-in-out text-xs sm:text-base shadow-md ${
    //     isLoading ? 'bg-gray-500 text-gray-300 hover:bg-gray-500 cursor-not-allowed' 
    //     : 'bg-red-600 text-white '
    // } ${isNextDisabled() ? "opacity-50 cursor-not-allowed" : " hover:bg-red-700 "}`}
//     onClick={handlerClickPayment}
//     disabled={isLoading || isNextDisabled() }
// >
//     {isLoading ? (
//         <>
//             <span>Cargando</span> 
//             <SpinnerIcon className="animate-spin h-5 w-5 ml-3" />
//         </>
//     ) : (
//         'Confirmar'
//     )}
// </button>
// )