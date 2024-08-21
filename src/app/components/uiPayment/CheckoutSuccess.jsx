import React from 'react'
import CheckIcon from '../icons/CheckIcon';
import Link from 'next/link';

const CheckoutSuccess = () => {
    return (
        <div className=' w-5/6 sm:w-2/3'>
        <div className="flex flex-col items-center justify-center text-center space-y-2 sm:space-y-4 mb-2 mt-5 sm:mt-10">
            <CheckIcon className="w-24 h-24 sm:w-48 sm:h-48 text-gray-900 mx-auto" />
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800">¡Reserva confirmada!</h2>
            <div className=' flex flex-col gap-0.4'>
                <p className='text-[0.8rem] sm:text-lg tracking-tighter text-gray-600'>
                    Se le enviará un comprobante al correo electrónico que dejo como referencia.
                </p>
                <p className=" text-[0.8rem] sm:text-lg tracking-tighter text-gray-600">
                    Gracias por reservar un espacio en Victoria Cowork.
                </p>
            </div>
            <Link className=" py-1.5 sm:py-2 px-4 rounded-lg font-semibold transition duration-200 ease-in-out text-xs sm:text-base shadow-md bg-red-600 text-white hover:bg-red-700 " href="/">
                    Ir a Inicio
            </Link>
            {/* <p className="text-[0.8rem] sm:text-base tracking-tighter text-gray-700">
                Si necesitas asistencia contáctanos al: 65570484.
            </p> */}
        </div>
        </div>
    );

}

export default CheckoutSuccess