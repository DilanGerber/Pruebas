'use client';

import { useState } from 'react';
import LeftConflictDays from '../icons/LeftConflictDays';
import RightConflictDays from '../icons/RightConflictDays';

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
  const [direction, setDirection] = useState('next');

  const handleNext = () => {
    setDirection('next');
    setItems(prev => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handlePrev = () => {
    setDirection('prev');
    setItems(prev => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, -1);
      return [last, ...rest];
    });
  };

  return (
    <div className="relative h-screen bg-gray-50 overflow-hidden">
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute transition-all duration-500 rounded-xl shadow-xl bg-cover bg-center ${
              direction === 'prev' && index === 2 ? 'animate-shrinkSlide' : ''
            }`}
            style={{
              backgroundImage: `url(${item.image})`,
              width: index === 1 ? '100%' : '200px',
              height: index === 1 ? '100%' : '300px',
              top: index === 1 ? '0' : '50%',
              left: index === 1
                ? '0'
                : `calc(50% + ${(index - 2) * 220}px)`,
              transform: index === 1 ? 'none' : 'translateY(-50%)',
              borderRadius: index === 1 ? '0' : '20px',
              opacity: index > 4 ? 0 : 1,
              zIndex: index === 1 ? 20 : 50 - index,
              display: index === 0 ? 'none' : 'block'
            }}
          >
            <div className={`absolute top-1/2 left-4 md:left-12 lg:left-24 w-[300px] text-gray-100 transform -translate-y-1/2 ${
              index === 1 ? 'visible' : 'hidden'
            }`}>
              <h2 className="text-4xl text-white font-bold uppercase mb-2 animate-fadeInUp">
                {item.name}
              </h2>
              <p className="text-lg text-white mb-4 animate-fadeInUp delay-300">
                {item.description}
              </p>
              <button className="px-4 py-2 bg-transparent border border-white text-white rounded-lg animate-fadeInUp delay-600">
                See More
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 w-full text-center space-x-4">
        <button
          onClick={handlePrev}
          className="w-10 h-9 inline-flex items-center justify-center rounded-lg  text-white/90 hover:text-white transition-colors"
        >
          <LeftConflictDays className="size-8 z-30" />
        </button>
        <button
          onClick={handleNext}
          className="w-10 h-9 inline-flex items-center justify-center rounded-lg  text-white/90 hover:text-white transition-colors"
        >
          <RightConflictDays className="size-8 z-30" />
        </button>
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

        @keyframes shrinkSlide {
          from {
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            transform: none;
            border-radius: 0;
          }
          to {
            width: 200px;
            height: 300px;
            top: 50%;
            left: calc(50% - 0px);
            transform: translateY(-50%);
            border-radius: 20px;
          }
        }

        .animate-shrinkSlide {
          animation: shrinkSlide 0.5s ease-in-out forwards;
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

// const images = ['/5.webp', '/7.webp', '/9.webp', '/10.webp', '/14.webp'];