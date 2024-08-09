"use client"
import React, { useState } from 'react';
import FlechaLeft from './FlechaLeft';
import FlechaRight from './FlechaRight';

const images = [
  { url: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-11_fusjf4.jpg"},
//   { url: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-11_1_e85jn9.jpg"},
//   { url: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-12_hrxjfe.jpg"},
//   { url: "https://inmoking.com/actualidad/wp-content/uploads/2021/05/coworking-oficinas-tradicionales.jpg"},
//   { url: "https://centrodenegociosrbt.com/blog/wp-content/uploads/2018/05/sala-de-reuniones-757x400.jpg"},
];

const ImageSlider = () => {
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
    <div className='my-5 sm:my-10 m-auto  px-4 relative   '>
    <div className="relative w-full sm:w-4/5 mx-auto overflow-hidden ">
      <div className='relative'>
        <button
          className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2  text-white  z-10"
          onClick={prevSlide}
        >
            <FlechaLeft className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((image, index) => (
            <div key={index} className="min-w-full">
              <img src={image.url} alt={`Slide ${index + 1}`} className="w-full h-auto rounded-lg" />
            </div>
          ))}
        </div>
        <button
          className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2  text-white  z-10"
          onClick={nextSlide}
        >
            <FlechaRight className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>
      </div>

      <div className="flex justify-center mt-2 sm:mt-4 space-x-2 sm:space-x-4 overflow-x-auto">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={`Thumbnail ${index + 1}`}
            className={`w-12 sm:w-20 lg:w-36 h-8 sm:h-14 lg:h-20 object-cover cursor-pointer rounded-lg ${index === currentIndex ? 'border-4 border-red-700' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
    </div>
  );
};

export default ImageSlider;