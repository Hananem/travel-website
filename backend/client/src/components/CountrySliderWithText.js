import { useState, useRef, useEffect } from 'react';

const MultiImageCarousel = () => {
  const countries = [
    {
      id: 1,
      name: "Japan",
      description: "Japan is an island country in East Asia known for its cherry blossoms, Mount Fuji, and advanced technology. Tokyo is the bustling capital with a perfect blend of traditional culture and modern innovation.",
      image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      name: "France",
      description: "France is famous for its wine, cheese, and the Eiffel Tower in Paris. It's known for its rich history, art museums like the Louvre, and beautiful countryside with lavender fields in Provence.",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      name: "Italy",
      description: "Italy is home to ancient Roman ruins, Renaissance art, and delicious cuisine including pizza and pasta. Cities like Rome, Venice, and Florence are filled with historic landmarks and artistic treasures.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9vdbX-SDEofKNhwXkGgzjILnFXECJFCydsA&s"
    },
    {
      id: 4,
      name: "USA",
      description: "The United States is a diverse country with landmarks like the Statue of Liberty, Grand Canyon, and Golden Gate Bridge. It's known for its cultural influence through Hollywood, music, and technology.",
      image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 5,
      name: "Brazil",
      description: "Brazil is the largest country in South America, famous for the Amazon rainforest, Rio de Janeiro's Carnival, and beautiful beaches like Copacabana. It's a vibrant country with rich cultural traditions.",
      image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 6,
      name: "Australia",
      description: "Australia is known for the Sydney Opera House, the Great Barrier Reef, and unique wildlife like kangaroos and koalas. It offers stunning landscapes from beaches to the Outback desert.",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(window.innerWidth >= 1024 ? 3 : 1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % countries.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + countries.length) % countries.length);
  };

  // Get the first visible country for description
  const visibleCountries = [];
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % countries.length;
    visibleCountries.push(countries[index]);
  }

  const currentDescriptionCountry = visibleCountries[0];

  return (
    <div className="bg-white py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Text Section */}
<div className="w-full lg:w-1/2 px-6">
  <h2 className="text-3xl font-bold mb-8">Explore Countries</h2>
  <div className="flex items-start space-x-6">
    {/* Vertical Circle Indicators with Continuous Line */}
    <div className="relative">
      {/* Continuous background line */}
      <div className="absolute left-1/2 top-3 bottom-3 w-px bg-gray-200 transform -translate-x-1/2"></div>
      
      {/* Circles positioned over the line */}
      <div className="flex flex-col space-y-16">
        {countries.map((country, index) => (
          <div
            key={index}
            className={`
              relative z-10 w-1.5 h-1.5 rounded-full cursor-pointer
              ${currentIndex === index ? 'bg-blue-500 shadow-lg' : 'bg-gray-400'}
              transition-all duration-200 hover:scale-110
            `}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
    
    {/* Description Box */}
    <div className="bg-gray-50 p-6 rounded-lg flex-1">
      <h3 className="text-xl font-semibold mb-3">{countries[currentIndex].name}</h3>
      <p className="text-gray-600">{countries[currentIndex].description}</p>
    </div>
  </div>
</div>

        {/* Image Carousel Section */}
        <div className="w-full lg:w-1/2 relative">
          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-hidden"
          >
            {visibleCountries.map((country, index) => (
  <div 
    key={`${country.id}-${index}`}
    className={`flex-shrink-0 ${visibleCount === 3 ? 'w-1/3' : 'w-full'}`}
  >
    <div className={`relative ${index === 0 ? 'h-82' : 'h-74'} transition-all duration-300`}>
      <img
        src={country.image}
        alt={country.name}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
    <p className="mt-2 text-center font-medium">{country.name}</p>
  </div>
))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 z-10"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiImageCarousel;