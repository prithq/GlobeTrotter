import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cityAPI } from '../api/cities';
import { suggestAPI } from '../api/suggest';
import { 
  HiArrowLeft, 
  HiSearch, 
  HiLocationMarker, 
  HiStar,
  HiPlus,
  HiCheck,
  HiChevronRight,
  HiGlobe,
  HiSparkles
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
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCities, setSelectedCities] = useState([]);

  // Live search as user types with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const searchCities = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchQuery,
        ...filters
      };
      const response = await cityAPI.getCities(params);
      let list = response.data?.data || [];

      // Fetch dynamic place & attraction suggestions when a search query is typed (e.g. Manali)
      if (searchQuery.trim().length > 1) {
        try {
          const aiRes = await suggestAPI.getSuggestions(searchQuery.trim());
          const aiPlaces = aiRes.data?.suggestions || [];
          setNearbyAttractions(aiPlaces);

          // If local DB returned fewer than 2 results, append dynamic results
          if (list.length < 2 && aiPlaces.length > 0) {
            const dynamicResults = aiPlaces.map((place, idx) => ({
              _id: `dynamic-${idx}-${Date.now()}`,
              name: place.name,
              country: 'Featured Destination',
              region: `${searchQuery.trim()} Region`,
              costIndex: 55,
              popularityScore: 92 - idx * 2,
              imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
              description: place.what
            }));
            
            // Deduplicate
            const existingNames = new Set(list.map(c => c.name.toLowerCase()));
            const filteredDynamic = dynamicResults.filter(d => !existingNames.has(d.name.toLowerCase()));
            list = [...list, ...filteredDynamic];
          }
        } catch (aiErr) {
          console.warn('Nearby place suggestions error:', aiErr.message);
        }
      } else {
        setNearbyAttractions([]);
      }

      setCities(list);
    } catch (error) {
      toast.error('Failed to load cities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCities();
  };

  const toggleCitySelection = (cityName) => {
    setSelectedCities(prev => 
      prev.includes(cityName) 
        ? prev.filter(c => c !== cityName)
        : [...prev, cityName]
    );
  };

  const addToTrip = () => {
    if (selectedCities.length === 0) {
      toast.error('Please select at least one city or place');
      return;
    }
    toast.success(`${selectedCities.length} destinations selected for your trip!`);
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
              <Link to="/dashboard" className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm">
                  ✈️
                </div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  GlobeTrotter
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline font-medium">
                {user?.name || 'Traveler'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <HiGlobe className="h-8 w-8 text-blue-600" /> Explore Global Cities & Nearby Places
            </h1>
            <p className="text-gray-600 mt-1">Search any city or region (e.g., Manali, Paris, Tokyo, Goa) to view cities and nearby attractions</p>
          </div>
          {selectedCities.length > 0 && (
            <button
              onClick={addToTrip}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-md"
            >
              <HiPlus className="h-5 w-5" />
              Add {selectedCities.length} Places to Trip
            </button>
          )}
        </div>

        {/* Global Live Search Bar */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any city or region (e.g. Manali, Paris, Kyoto, Goa, Shimla...)"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-xs font-bold text-gray-700"
              >
                <option value="">All Countries</option>
                <option value="India">India</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="USA">USA</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Italy">Italy</option>
              </select>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-xs font-bold text-gray-700"
              >
                <option value="">All Regions</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
              </select>
            </div>
          </form>
        </div>

        {/* Nearby Attractions Banner Section when searching a specific city like "Manali" */}
        {searchQuery.trim() && nearbyAttractions.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-md p-6 border-2 border-blue-200 space-y-4">
            <div className="flex items-center gap-2">
              <HiSparkles className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Top Must-Visit Places & Attractions in & around "{searchQuery.trim()}"
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyAttractions.map((att, aIdx) => (
                <div 
                  key={aIdx} 
                  onClick={() => toggleCitySelection(att.name)}
                  className={`bg-white p-4 rounded-xl shadow-xs border transition-all cursor-pointer hover:shadow-md ${
                    selectedCities.includes(att.name) ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                      📍 {att.name}
                    </h3>
                    {selectedCities.includes(att.name) && (
                      <span className="bg-blue-600 text-white text-xs p-1 rounded-full">
                        <HiCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{att.what}</p>
                  <p className="text-xs text-blue-700 font-semibold italic">💡 {att.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cities Results Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {searchQuery.trim() ? `Search Results for "${searchQuery.trim()}"` : 'Featured Global Destinations'}
          </h2>

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
                  className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 ${
                    selectedCities.includes(city.name) ? 'border-blue-600 ring-2 ring-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => toggleCitySelection(city.name)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={city.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {selectedCities.includes(city.name) && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                        <HiCheck className="h-5 w-5" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-medium">{city.region}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{city.name}</h3>
                        <p className="text-sm text-gray-600">{city.country}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiStar className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-semibold">{city.popularityScore || 90}%</span>
                      </div>
                    </div>
                    {city.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{city.description}</p>}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-600">Cost Index: {city.costIndex}%</span>
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center">
                        {selectedCities.includes(city.name) ? 'Selected' : 'Select Destination'} <HiChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🏙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No cities found for "{searchQuery}"</h3>
              <p className="text-gray-600 text-sm">Try adjusting your search query or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySearchPage;