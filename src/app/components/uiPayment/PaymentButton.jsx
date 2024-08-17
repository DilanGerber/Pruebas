"use client"
import React, { useState, useContext } from 'react'
import { StepperContext } from '@/contexts/StepperContext'
import SpinnerIcon from '../icons/SpinnerIcon'

const PaymentButton = ({ isNextDisabled  = () => true }) => {

    const { dispatch } = useContext(StepperContext);
    
    const [isLoading, setIsLoading] = useState(false);

    const handlerClickPayment = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            const isSuccess = Math.random() > 0.5;
            if (isSuccess) {
                dispatch({ type: 'CHECKOUT_SUCCESS' });
            } else {
                dispatch({ type: 'CHECKOUT_ERROR' });
            }
        }, 3000);
    }
 
    return (
        <button 
        className={`flex items-center py-1.5 sm:py-2 px-4 rounded-lg font-semibold transition duration-200 ease-in-out text-xs sm:text-base shadow-md ${
            isLoading ? 'bg-gray-500 text-gray-300 hover:bg-gray-500 cursor-not-allowed' 
            : 'bg-red-600 text-white '
        } ${isNextDisabled() ? "opacity-50 cursor-not-allowed" : " hover:bg-red-700 "}`}
            onClick={handlerClickPayment}
            disabled={isLoading || isNextDisabled()}
        >
            {isLoading ? (
                <>
                    <span>Cargando</span> 
                    <SpinnerIcon className="animate-spin h-5 w-5 ml-3" />
                </>
            ) : (
                'Confirmar'
            )}
        </button>
    );
}

export default PaymentButton;