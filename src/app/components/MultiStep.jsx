"use client"
import React, { useState, useEffect, useContext } from 'react'
import { StepperContext } from '@/contexts/StepperContext'

const MultiStep = ({ steps }) => {
    const { state } = useContext(StepperContext)
    const { currentStep, stepsCompleted } = state

    const [newStep, setNewStep] = useState([])

    const updateStep = (stepNumber) => {
        return steps.map((step, index) => {
            let isCompleted = stepsCompleted[step] || index < stepNumber;
    
            // Marcar el último paso como completado en caso de éxito
            if (state.checkoutStatus === 'success' && index === steps.length - 1) {
                isCompleted = true;
            }
    
            return {
                description: step,
                highlighted: index === stepNumber,
                selected: index <= stepNumber,
                completed: isCompleted,
            };
        });
    };

    useEffect(() => {
        // Actualiza los pasos solo si currentStep cambia
        const updatedSteps = updateStep(currentStep - 1)

        // Solo actualiza si el nuevo estado es diferente al actual
        if (JSON.stringify(updatedSteps) !== JSON.stringify(newStep)) {
            setNewStep(updatedSteps)
        }
    }, [currentStep, stepsCompleted, steps]) 

    return (
        <div className='mx-4 p-2 sm:p-4 flex justify-between items-center'>
            {newStep.map((step, index) => (
                <div key={index} className={index !== newStep.length - 1 ? 'w-full flex items-center' : 'flex items-center'}>
                    <div className='relative flex flex-col items-center text-gray-400'>
                        <div className={`rounded-full transition duration-500 ease-in-out border-2 border-gray-300 h-8 sm:h-12 w-8 sm:w-12 flex items-center justify-center py-3 ${step.selected ? 'bg-red-600 text-white font-bold border border-red-600' : ''}`}>
                            {step.completed ? (
                                <span className='text-white text-xl font-bold'>&#10003;</span>
                            ) : (
                                index + 1
                            )}
                        </div>
                        <div className={`absolute top-0 text-center mt-8 sm:mt-16 w-32 text-[0.6rem] sm:text-xs font-medium uppercase ${step.highlighted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.description}
                        </div>
                    </div>
                    {index < newStep.length - 1 && (
                        <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${step.completed ? 'border-red-500' : 'border-gray-300'}`}></div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default MultiStep