import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cityAPI } from '../api/cities';
import { 
  HiArrowLeft, 
  HiSearch, 
  HiLocationMarker, 
  HiStar,
  HiPlus,
  HiCheck,
  HiChevronRight
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const CitySearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    sort: 'popularity'
  });
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);

  useEffect(() => {
    searchCities();
  }, [filters]);

  const searchCities = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchQuery,
        ...filters
      };
      const response = await cityAPI.getCities(params);
      setCities(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load cities');
      // Mock data
      setCities([
        { _id: '1', name: 'Paris', country: 'France', region: 'Europe', costIndex: 85, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
        { _id: '2', name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 90, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
        { _id: '3', name: 'New York', country: 'USA', region: 'North America', costIndex: 95, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
        { _id: '4', name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 60, popularityScore: 90, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCities();
  };

  const toggleCitySelection = (cityId) => {
    setSelectedCities(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  const addToTrip = () => {
    if (selectedCities.length === 0) {
      toast.error('Please select at least one city');
      return;
    }
    toast.success(`${selectedCities.length} cities added to your trip!`);
    navigate('/create-trip');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
                <HiArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌍</span>
                <h1 className="text-xl font-bold text-blue-600">GlobeTrotter</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.name || 'Traveler'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Cities</h1>
            <p className="text-gray-600 mt-1">Discover and add cities to your trip</p>
          </div>
          {selectedCities.length > 0 && (
            <button
              onClick={addToTrip}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <HiPlus className="h-5 w-5" />
              Add {selectedCities.length} Cities to Trip
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a city..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="USA">USA</option>
                <option value="Indonesia">Indonesia</option>
              </select>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="North America">North America</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : cities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => (
              <div
                key={city._id}
                className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 ${
                  selectedCities.includes(city._id) ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => toggleCitySelection(city._id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={city.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {selectedCities.includes(city._id) && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full">
                      <HiCheck className="h-5 w-5" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">{city.region}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{city.name}</h3>
                      <p className="text-sm text-gray-600">{city.country}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <HiStar className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{city.popularityScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-600">Cost Index: {city.costIndex}%</span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View Details <HiChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No cities found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitySearchPage;