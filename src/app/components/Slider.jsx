"use client"
import React from 'react'
import ImageGallery from 'react-image-gallery'
import "react-image-gallery/styles/css/image-gallery.css";

const Slider = () => {
    const images = [
        { original: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-11_fusjf4.jpg", thumbnail: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-11_fusjf4.jpg"},
        // { original: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713153470/oficinas_privadas1_gaktj8.jpg", thumbnail: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713153470/oficinas_privadas1_gaktj8.jpg"},
        { original: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-11_1_e85jn9.jpg", thumbnail: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-11_1_e85jn9.jpg"},
        { original: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-12_hrxjfe.jpg", thumbnail: "https://res.cloudinary.com/dqckgu0gd/image/upload/v1713149073/2024-02-12_hrxjfe.jpg"}
      ]

  return (
    <div className='w-[full] sm:w-[1000px] m-auto'>
        <ImageGallery items={images} showPlayButton={false} showFullscreenButton={false} autoPlay={false}/>
    </div>
  )
}

export default Slider