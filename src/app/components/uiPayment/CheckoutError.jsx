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
        <div className=' w-5/6 sm:w-2/3'>
        <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-4 mb-2 mt-5 sm:mt-10">
            <ErrorIcon className="w-24 h-24 sm:w-48 sm:h-48 text-gray-900 mx-auto" />
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800">¡Error en la reserva!</h2>
            <p className="text-[0.8rem] sm:text-lg tracking-tighter text-gray-600">
                Lo sentimos, ocurrió un problema al procesar tu reserva. Por favor, inténtalo nuevamente.
            </p>
            <div className="flex space-x-2 sm:space-x-4">
                <button onClick={handleRetry} className=" py-1.5 sm:py-2 px-4 rounded-lg font-semibold transition duration-200 ease-in-out text-xs sm:text-base shadow-md bg-red-600 text-white hover:bg-red-700 ">
                    Volver a intentar
                </button>
                <Link href="/" className=" py-1.5 sm:py-2 px-4 rounded-lg font-medium transition duration-200 ease-in-out text-xs sm:text-base shadow-md bg-gray-300 text-black hover:bg-gray-400 ">
                    Ir a Inicio
                </Link>
            </div>
        </div>
        </div>
    );
};

export default CheckoutError;