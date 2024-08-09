import React from 'react'

const SteperControl = ({ steps, currentStep, handlerClick}) => {
  return (
    <div className=' container flex justify-around mt-2 mb-4 sm:mt-4 sm:mb-8'>
        <button onClick={()=>handlerClick()} className={`bg-white text-slate-400 uppercase py-1.5 sm:py-2 px-4 rounded-lg font-semibold cursor-pointer border-2 border-slate-300 hover:bg-slate-700 hover:text-white transition  duration-200 ease-in-out text-xs sm:text-base ${currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
            Volver
        </button>

        <button onClick={()=>handlerClick("next")} className=' bg-red-500 text-white uppercase py-1.5 sm:py-2 px-4 rounded-lg font-semibold cursor-pointer hover:bg-red-700 hover:text-white transition  duration-200 ease-in-out text-xs sm:text-base'>
            {currentStep === steps.length - 1 ? "Confirmar" : "Siguiente"}
        </button>
    </div>
  )
}

export default SteperControl