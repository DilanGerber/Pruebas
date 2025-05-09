import React from 'react'
import IconDobleUsers from '../icons/IconDobleUsers'
import IconCharacterSpecial from '../icons/IconCharacterSpecial'

const DetailsOffice = ({ office, fullWidth = false }) => {
  return (
    <div className='my-5 sm:my-10 px-4'>
    <div className={`max-w-[1100px] w-full m-auto relative ${fullWidth ? '' : 'sm:w-4/5'}`}>
        <div className='grid grid-cols-2 gap-5'>
        <div className="border border-gray-300 shadow-md rounded-xl p-2 sm:p-4 md:p-8  w-full flex flex-row hover:scale-105 transition-transform duration-300 gap-1 sm:gap-5 items-center">
    <IconDobleUsers className="w-12 h-10 sm:w-16 sm:h-12 md:w-24 md:h-20 lg:w-32 lg:h-24 flex-shrink-0" />
    <div className="flex flex-col">
        <span className="text-black font-semibold text-xs sm:text-sm md:text-base lg:text-2xl mb-1 md:mb-2">
            Puestos de {office?.positionsMin} personas
            {office?.positionsMax ? ` hasta ${office.positionsMax} personas` : ''}
        </span>
        <p className="text-gray-600 text-[0.5rem] sm:text-[0.8rem] md:text-sm lg:text-base">
            {office?.messagePositions}
        </p>
    </div>
</div>

            { office.special_character && (
                <div className='  border border-gray-300 shadow-md rounded-xl p-2 sm:p-4 md:p-8  w-full flex flex-row hover:scale-105 transition-transform duration-300 gap-1 sm:gap-5 items-center'>
                    <IconCharacterSpecial className=" w-12 h-10 sm:w-16 sm:h-12 md:w-24 md:h-20 lg:w-32 lg:h-24 flex-shrink-0" />
                    <div className='flex flex-col'>
                        <span className='text-black font-semibold text-xs sm:text-sm md:text-base lg:text-2xl mb-1 md:mb-2'> {office?.special_character} </span>
                        <p className='text-gray-600 text-[0.5rem] sm:text-[0.8rem] md:text-sm lg:text-base'>
                            {office?.messageSpecialOffice}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
    </div>
  )
}

export default DetailsOffice