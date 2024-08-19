import React, { useContext } from 'react'
import ErrorIcon from '../icons/ErrorIcon';
import Link from 'next/link';
import { StepperContext } from '@/contexts/StepperContext';

const CheckoutError = () => {
    const { dispatch } = useContext(StepperContext);

    const handleRetry = () => {
        dispatch({ type: 'RETRY_CHECKOUT' });;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <ErrorIcon className="w-24 h-24 sm:w-48 sm:h-48 text-red-600 mx-auto" />
            <h2 className="text-3xl font-bold text-red-600">¡Error en la reserva!</h2>
            <p className="text-lg text-gray-600">
                Lo sentimos, ocurrió un problema al procesar tu reserva. Por favor, inténtalo nuevamente.
            </p>
            <div className="flex space-x-4">
                <button onClick={handleRetry} className="text-lg text-red-600 hover:underline hover:text-red-700">
                    Volver a intentar
                </button>
                <Link href="/" className="text-lg text-gray-600 hover:underline hover:text-gray-700">
                    Ir a Inicio
                </Link>
            </div>
        </div>
    );
};

export default CheckoutError;