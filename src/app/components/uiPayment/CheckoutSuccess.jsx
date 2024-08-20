import React from 'react'
import CheckIcon from '../icons/CheckIcon';
import Link from 'next/link';

const CheckoutSuccess = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 mt-10">
            <CheckIcon className="w-24 h-24 sm:w-48 sm:h-48 text-red-600 mx-auto" />
            <h2 className="text-3xl font-bold text-red-600">¡Reserva confirmada!</h2>
            <p className="text-lg text-gray-700">
                Gracias por reservar un espacio en Victoria Cowork. Tu reserva ha sido confirmada exitosamente, y se enviará un comprobante a tu correo electrónico.
            </p>
            <p className="text-lg text-gray-700">
                Si necesitas asistencia o experimentaste algun problema, contáctanos al: +591 65570484.
            </p>
            <Link className="text-lg text-red-600 hover:underline hover:text-red-700" href="/">
                    Ir a Inicio
            </Link>
        </div>
    );

}

export default CheckoutSuccess