"use client"
import React, { useState } from 'react';
import FlechaLeft from '../icons/FlechaLeft';
import FlechaRight from '../icons/FlechaRight';

const GallerySlider = ({ name, images, fullWidth = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className='my-5 sm:my-10 m-auto px-4 relative'>
      <div className={`relative w-full ${fullWidth ? '' : 'sm:w-4/5'} mx-auto overflow-hidden`}>
        {images.length === 0 ? (
          <div className="w-full h-[180px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-slate-300 flex items-center justify-center rounded-lg">
            <p className="text-gray-700 text-lg sm:text-xl font-semibold">No hay imágenes disponibles</p>
          </div>
        ) : (
          <div className='relative '>
            {/* Mostrar flecha izquierda solo si hay más de una imagen */}
            {images.length > 1 && (
              <button
                className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 text-white z-10"
                onClick={prevSlide}
              >
                <FlechaLeft className="w-6 h-6 sm:w-10 sm:h-10" />
              </button>
            )}
            <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {images.map((image, index) => (
                <div key={index} className="min-w-full">
                  <img src={image} alt={`Slide ${index + 1}`} className="w-full h-[180px] sm:h-[300px] md:h-[400px] lg:h-[500px] object-cover rounded-lg" />
                </div>
              ))}
            </div>
            {/* Mostrar flecha derecha solo si hay más de una imagen */}
            {images.length > 1 && (
              <button
                className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 text-white z-10"
                onClick={nextSlide}
              >
                <FlechaRight className="w-6 h-6 sm:w-10 sm:h-10" />
              </button>
            )}
            <h1 className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap drop-shadow-xl">
              {name}
            </h1>
          </div>
        )}

        {images.length > 1 && (
          <div className="flex justify-center mt-2 sm:mt-4 space-x-2 sm:space-x-4 overflow-x-auto">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-12 sm:w-20 lg:w-36 h-8 sm:h-14 lg:h-20 object-cover cursor-pointer rounded-xl ${index === currentIndex ? 'border-4 border-red-700' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GallerySlider;