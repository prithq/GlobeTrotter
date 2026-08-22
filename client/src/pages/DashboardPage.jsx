import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiPlus, 
  HiSearch, 
  HiCalendar, 
  HiLocationMarker, 
  HiUsers,
  HiStar,
  HiChevronRight,
  HiGlobeAlt
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

import { tripAPI } from '../api/trips';
import { cityAPI } from '../api/cities';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('');
  const [selectedSort, setSelectedSort] = useState('popularity');

  const [recentTrips, setRecentTrips] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [userRegion, setUserRegion] = useState('Asia');
  const [userLocationName, setUserLocationName] = useState('Detecting location...');
  const [isLoading, setIsLoading] = useState(true);

  // Live dynamic search states
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showLiveDropdown, setShowLiveDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveSearchResults([]);
      setShowLiveDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      setShowLiveDropdown(true);
      try {
        const response = await cityAPI.getCities({ search: searchQuery.trim(), limit: 6 });
        setLiveSearchResults(response.data?.data || []);
      } catch (err) {
        console.warn('Live search error:', err.message);
      } finally {
        setIsSearchingLive(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Based on lat/lng or timezone, infer regional proximity
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          let reg = 'Asia';
          if (tz.includes('Europe')) reg = 'Europe';
          else if (tz.includes('America')) reg = 'North America';
          else if (tz.includes('Africa')) reg = 'Africa';
          else if (tz.includes('Australia') || tz.includes('Pacific')) reg = 'Oceania';
          
          setUserRegion(reg);
          setUserLocationName(`Near ${reg}`);
          loadDashboardData(reg);
        },
        (err) => {
          console.warn('Geolocation fallback:', err.message);
          setUserRegion('Asia');
          setUserLocationName('Asia Region');
          loadDashboardData('Asia');
        },
        { timeout: 5000 }
      );
    } else {
      loadDashboardData('Asia');
    }
  };

  const loadDashboardData = async (regionName) => {
    setIsLoading(true);
    try {
      const [tripsRes, citiesRes] = await Promise.allSettled([
        tripAPI.getTrips(1, 6),
        cityAPI.getCities({ region: regionName, sort: selectedSort, limit: 8 })
      ]);

      if (tripsRes.status === 'fulfilled') {
        setRecentTrips(tripsRes.value.data?.data || []);
      }
      if (citiesRes.status === 'fulfilled') {
        let cityList = citiesRes.value.data?.data || [];
        if (cityList.length === 0) {
          const fallbackCities = await cityAPI.getCities({ sort: 'popularity', limit: 8 });
          cityList = fallbackCities.data?.data || [];
        }
        setPopularCities(cityList);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cities?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/cities');
    }
  };

  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}/build`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg shadow-sm">
                ✈️
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                GlobeTrotter
              </span>
            </Link>
            
            <div className="flex items-center space-x-5">
              <Link to="/my-trips" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                My Trips
              </Link>
              <Link to="/calendar" className="text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <HiCalendar className="h-4 w-4 text-blue-600" />
                Trip Calendar
              </Link>
              <Link to="/community" className="text-sm font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <HiUsers className="h-4 w-4 text-purple-600" />
                Community
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-blue-200 shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-semibold hidden sm:inline">{user?.name || 'Traveler'}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl text-white">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative p-8 sm:p-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <HiGlobeAlt className="h-4 w-4 text-blue-200" /> Personalized Travel Planning
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Explore the World, {user?.name?.split(' ')[0] || 'Traveler'} 🌏
            </h1>
            <p className="text-blue-100 text-base sm:text-lg">
              Dream, design, and organize your multi-city journeys with real-time AI assistance and route cost optimization.
            </p>
          </div>
        </div>

        {/* Search Box Directly Below Banner (Matching Screen 3 Wireframe) */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, city stops, or travel activities..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                />

                {/* Floating Live Search Dropdown */}
                {showLiveDropdown && searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-96 overflow-y-auto">
                    {isSearchingLive ? (
                      <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Searching live destinations with OpenAI...
                      </div>
                    ) : liveSearchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold uppercase text-gray-500 tracking-wider flex items-center justify-between">
                          <span>Live AI Search Results</span>
                          <span>{liveSearchResults.length} places found</span>
                        </div>
                        {liveSearchResults.map((city) => (
                          <div
                            key={city._id || city.name}
                            onClick={() => {
                              setShowLiveDropdown(false);
                              navigate(`/cities?search=${encodeURIComponent(city.name)}`);
                            }}
                            className="p-3.5 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={city.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200'}
                                alt={city.name}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-xs"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                  {city.name}
                                </h4>
                                <p className="text-xs text-gray-500">{city.country} • {city.region}</p>
                              </div>
                            </div>
                            <HiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-500">
                        Press Enter or click Search to find global destination "{searchQuery}".
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <HiSearch className="h-5 w-5" /> Search
              </button>
            </div>

            {/* Filter controls row below search input (Screen 3 layout: Group by, Filter, Sort by) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-xs font-semibold uppercase">Group by:</span>
                  <select 
                    value={selectedRegionFilter}
                    onChange={(e) => {
                      setSelectedRegionFilter(e.target.value);
                      loadDashboardData(e.target.value || userRegion);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium bg-white"
                  >
                    <option value="">User Location ({userRegion})</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 text-xs font-semibold uppercase">Filter:</span>
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="budget">Budget Friendly</option>
                    <option value="luxury">Popular Luxury</option>
                    <option value="culture">Culture & History</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-xs font-semibold uppercase">Sort by:</span>
                <select 
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    loadDashboardData(userRegion);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium bg-white"
                >
                  <option value="popularity">Popularity</option>
                  <option value="costLow">Cost: Low to High</option>
                  <option value="costHigh">Cost: High to Low</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Link
            to="/create-trip"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-sm"
          >
            <HiPlus className="h-5 w-5" />
            <span>Plan a Trip</span>
          </Link>
          <button 
            onClick={() => navigate('/cities')}
            className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-100 font-semibold text-sm text-gray-700"
          >
            <HiLocationMarker className="h-5 w-5 text-blue-600" />
            <span>Explore Cities</span>
          </button>
          <button 
            onClick={() => navigate('/my-trips')}
            className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-100 font-semibold text-sm text-gray-700"
          >
            <HiCalendar className="h-5 w-5 text-blue-600" />
            <span>My Trips</span>
          </button>
          <button 
            onClick={() => navigate('/calendar')}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-blue-200 font-semibold text-sm text-blue-700"
          >
            <HiCalendar className="h-5 w-5 text-blue-600" />
            <span>Trip Calendar</span>
          </button>
          <button 
            onClick={() => navigate('/community')}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-purple-200 font-semibold text-sm text-purple-800"
          >
            <HiUsers className="h-5 w-5 text-purple-600" />
            <span>Community</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-100 font-semibold text-sm text-gray-700"
          >
            <HiUsers className="h-5 w-5 text-blue-600" />
            <span>Profile</span>
          </button>
        </div>

        {/* Top Regional Selections Based on User Current Location */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">Top Regional Selections</h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">
                  📍 {userRegion}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">Popular travel destinations near your location ({userLocationName})</p>
            </div>
            <button
              onClick={() => navigate('/cities')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
            >
              Explore All <HiChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCities.map((city) => (
              <div
                key={city._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
                onClick={() => navigate('/cities')}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={city.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                    <HiStar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">{city.popularityScore}%</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">{city.region}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{city.name}, {city.country}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-600">
                      Cost Index: {city.costIndex}%
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      Explore <HiChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Previous / Active Trips */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Planned Trips</h2>
              <p className="text-gray-600 text-sm mt-1">Manage your active and planned adventures</p>
            </div>
            <Link
              to="/my-trips"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
            >
              View All <HiChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100"
                  onClick={() => handleTripClick(trip._id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 px-4 py-2 rounded-lg">
                        Build Itinerary →
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors truncate">
                      {trip.name}
                    </h3>
                    {trip.description && <p className="text-gray-600 text-sm mb-3 line-clamp-1">{trip.description}</p>}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <HiCalendar className="h-4 w-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HiLocationMarker className="h-4 w-4" />
                        <span>{trip.destinationCount || 0} stops</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTripClick(trip._id);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center"
                      >
                        Build Itinerary <HiChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure today!</p>
              <Link
                to="/create-trip"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
              >
                <HiPlus className="h-5 w-5 mr-2" />
                Plan Your First Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;