// components/Carousel.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeftConflictDays from '../icons/LeftConflictDays';
import RightConflictDays from '../icons/RightConflictDays';

const images = ['/5.webp', '/7.webp', '/9.webp', '/10.webp', '/14.webp'];
const titles = ['Switzerland', 'Finland', 'Iceland', 'Australia', 'Netherlands'];
const descriptions = [
  'Paisajes de ensueño y montañas nevadas.',
  'Auroras boreales y lagos cristalinos.',
  'Un paraíso natural lleno de volcanes y glaciares.',
  'Playas, desiertos y ciudades modernas.',
  'Canales, bicicletas y arquitectura única.',
];
const slides = [
  {
    id: 1,
    image: 'https://i.ibb.co/qCkd9jS/img1.jpg',
    name: 'Switzerland',
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!'
  },
  {
    id: 2,
    image: 'https://i.ibb.co/jrRb11q/img2.jpg',
    name: 'Finland',
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!'
  },
  {
    id: 3,
    image: 'https://i.ibb.co/NSwVv8D/img3.jpg',
    name: 'Iceland',
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!'
  },
  {
    id: 4,
    image: 'https://i.ibb.co/Bq4Q0M8/img4.jpg',
    name: 'Australia',
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!'
  },
  {
    id: 5,
    image: 'https://i.ibb.co/jTQfmTq/img5.jpg',
    name: 'Netherland',
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!'
  },
  {
    id: 6,
    image: 'https://i.ibb.co/RNkk6L0/img6.jpg',
    name: 'Ireland',
    description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!'
  }
];

const Slider = () => {
  const [items, setItems] = useState(slides);

  const handleNext = () => {
    setItems(prev => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handlePrev = () => {
    setItems(prev => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, -1);
      return [last, ...rest];
    });
  };

  return (
    <div className="min-h-screen bg-gray-200 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gray-50 shadow-xl z-50">
        <div className="relative w-full h-full">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="absolute transition-all duration-500 rounded-xl shadow-xl bg-cover bg-center z-50"
              style={{
                backgroundImage: `url(${item.image})`,
                width: index <= 1 ? '100%' : '200px',
                height: index <= 1 ? '100%' : '300px',
                top: index <= 1 ? '0' : '50%',
                left: index === 2 ? '50%' : 
                      index === 3 ? 'calc(50% + 220px)' : 
                      index === 4 ? 'calc(50% + 440px)' : 
                      index >= 5 ? 'calc(50% + 660px)' : '0',
                transform: index <= 1 ? 'translateY(0)' : 'translateY(-50%)',
                borderRadius: index <= 1 ? '0' : '20px',
                opacity: index >= 5 ? 0 : 1,
                zIndex: 10 - index
              }}
            >
              <div className={`absolute top-1/2 left-24 w-[300px] text-gray-100 transform -translate-y-1/2  ${
                index === 1 ? 'visible' : 'hidden'
              }`}>
                <h2 className="text-4xl font-bold uppercase mb-2 animate-fadeInUp">
                  {item.name}
                </h2>
                <p className="text-lg mb-4 animate-fadeInUp delay-300">
                  {item.description}
                </p>
                <button className="px-4 py-2 bg-transparent border border-white rounded-lg animate-fadeInUp delay-600">
                  See More
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 w-full text-center space-x-4">
          <button
            onClick={handlePrev}
            className="w-10 h-9 inline-flex items-center justify-center rounded-lg border border-black hover:bg-gray-600 hover:text-white transition-colors"
          >
            <LeftConflictDays className=' size-8 z-30' />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-9 inline-flex items-center justify-center rounded-lg border border-black hover:bg-gray-600 hover:text-white transition-colors"
          >
            <RightConflictDays className=' size-8 z-30' />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(100px);
            filter: blur(33px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-in-out forwards;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default Slider;

// import LeftConflictDays from '../icons/LeftConflictDays';
// import RightConflictDays from '../icons/RightConflictDays';
{/* <LeftConflictDays />
<RightConflictDays /> */}