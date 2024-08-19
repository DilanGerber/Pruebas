"use client"
import React, { useState, useEffect, useContext } from 'react'
import { StepperContext } from '@/contexts/StepperContext'

const MultiStep = ({ steps }) => {
    const { state } = useContext(StepperContext)
    const { currentStep, stepsCompleted } = state

    const [newStep, setNewStep] = useState([])

    const updateStep = (stepNumber) => {
        // Actualiza el estado de los pasos basados en el paso actual
        return steps.map((step, index) => ({
            description: step,
            highlighted: index === stepNumber,
            selected: index <= stepNumber,
            completed: index < stepNumber ? true : stepsCompleted[step] || false,
        }))
    }

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
                    <div className='relative flex flex-col items-center text-teal-600'>
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
                        <div className={`flex-auto border-t-2 transition duration-500 ease-in-out ${step.completed ? 'border-red-600' : 'border-gray-300'}`}></div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default MultiStep