import React, { useContext } from 'react';
import { StepperContext } from '@/contexts/StepperContext';

const Form = () => {
    const { state, dispatch } = useContext(StepperContext);
    const { formData } = state;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...formData,
            [name]: value,
        };

        dispatch({ type: 'SET_FORM_DATA', payload: updatedData });

        // Verifica si todos los campos del formulario están completos
        const isComplete = Object.values(updatedData).every(field => field !== '');
        if (isComplete) {
            dispatch({ type: 'COMPLETE_STEP', step: 'form', completed: true  });
        }
    };

    return (
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
                        value={formData.username || ""}
                        placeholder='Username'
                        className='p-1 px-2 appearance-none outline-none w-full text-gray-800'
                    />
                </div>
            </div>
        </div>
    );
};

export default Form