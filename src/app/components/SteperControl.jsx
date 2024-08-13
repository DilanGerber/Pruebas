"use client"
import React, { useContext } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

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
                className={`bg-white text-slate-400 uppercase py-1.5 sm:py-2 px-4 rounded-lg font-semibold border-2 border-slate-300 transition duration-200 ease-in-out text-xs sm:text-base ${
                    currentStep === 1 ? "  opacity-50 cursor-not-allowed" : "hover:bg-slate-700 hover:text-white cursor-pointer"
                }`}
                disabled={currentStep === 1}
            >
                Volver
            </button>

            <button
                onClick={handleNextClick}
                className={`bg-red-500 text-white uppercase py-1.5 sm:py-2 px-4 rounded-lg font-semibold transition duration-200 ease-in-out text-xs sm:text-base ${
                    isNextDisabled() ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700 hover:text-white cursor-pointer"
                }`}
                disabled={isNextDisabled()}
            >
                {currentStep === steps.length ? "Confirmar" : "Siguiente"}
            </button>
        </div>
    );
};

export default SteperControl;