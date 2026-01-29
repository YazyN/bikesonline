"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselSlide {
  image: string
  heading: string
  paragraph: string
  button?: {
    label: string
    path: string
  }
}

interface CarouselProps {
  slides: CarouselSlide[]
  autoplay?: boolean
  autoplayDelay?: number
}

export function Carousel({ 
  slides, 
  autoplay = true, 
  autoplayDelay = 5000 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(nextSlide, autoplayDelay)
    return () => clearInterval(interval)
  }, [autoplay, autoplayDelay, currentIndex])

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden bg-gray-100">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.heading}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-3xl">
                  <h2 className="text-4xl lg:text-6xl font-bold mb-4">
                    {slide.heading}
                  </h2>
                  <p className="text-lg lg:text-xl mb-8">{slide.paragraph}</p>
                  {slide.button && (
                    <a
                      href={slide.button.path}
                      className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      {slide.button.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-black" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}