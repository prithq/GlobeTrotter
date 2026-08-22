import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiSearch, 
  HiPlus, 
  HiCalendar, 
  HiLocationMarker, 
  HiUsers,
  HiStar,
  HiChevronRight
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTrips, setRecentTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const loadTrips = async () => {
      setIsLoading(true);
      // In production: const response = await tripAPI.getTrips();
      const mockTrips = [
        {
          id: '1',
          name: 'European Summer Adventure',
          destination: 'Paris, Rome, Barcelona',
          startDate: '2026-06-15',
          endDate: '2026-06-30',
          coverPhoto: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
          stops: 5,
          days: 15,
          status: 'upcoming'
        },
        {
          id: '2',
          name: 'Japan Cherry Blossom Tour',
          destination: 'Tokyo, Kyoto, Osaka',
          startDate: '2026-03-20',
          endDate: '2026-04-05',
          coverPhoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
          stops: 4,
          days: 16,
          status: 'planning'
        },
        {
          id: '3',
          name: 'Bali Relaxation Retreat',
          destination: 'Ubud, Seminyak, Nusa Dua',
          startDate: '2025-12-01',
          endDate: '2025-12-10',
          coverPhoto: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
          stops: 3,
          days: 9,
          status: 'completed'
        }
      ];
      setRecentTrips(mockTrips);
      setIsLoading(false);
    };
    loadTrips();
  }, []);

  // Popular destinations data
  const popularDestinations = [
    {
      id: 1,
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
      costIndex: '$$',
      popularity: 98,
      region: 'Europe'
    },
    {
      id: 2,
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
      costIndex: '$$$',
      popularity: 95,
      region: 'Asia'
    },
    {
      id: 3,
      name: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600',
      costIndex: '$$$',
      popularity: 92,
      region: 'North America'
    },
    {
      id: 4,
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600',
      costIndex: '$',
      popularity: 90,
      region: 'Asia'
    },
    {
      id: 5,
      name: 'Rome, Italy',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600',
      costIndex: '$$',
      popularity: 88,
      region: 'Europe'
    },
    {
      id: 6,
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
      costIndex: '$$$$',
      popularity: 85,
      region: 'Middle East'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'upcoming': return '✈️';
      case 'planning': return '📝';
      case 'completed': return '✅';
      default: return '📌';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Navigate to trip builder
  const handleTripClick = (tripId) => {
    navigate(`/trip/${tripId}/build`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌍</span>
              <h1 className="text-xl font-bold text-blue-600">GlobeTrotter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                Welcome, {user?.name || 'Traveler'}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="relative rounded-2xl overflow-hidden mb-10">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200"
              alt="Travel banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60"></div>
          </div>
          <div className="relative px-6 py-16 sm:px-12 sm:py-24">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Explore the World 🌏
              </h1>
              <p className="text-blue-100 text-lg mb-8">
                Discover new destinations, plan your perfect trip, and create unforgettable memories.
              </p>
              
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for destinations, trips, or activities..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <Link
            to="/create-trip"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <HiPlus className="h-5 w-5" />
            <span className="font-medium">Plan a Trip</span>
          </Link>
          <button 
            onClick={() => navigate('/cities')}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-100"
          >
            <HiLocationMarker className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700">Explore Cities</span>
          </button>
          <button 
            onClick={() => navigate('/calendar')}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-100"
          >
            <HiCalendar className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700">My Calendar</span>
          </button>
          <button 
            onClick={() => navigate('/shared-trips')}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-gray-100"
          >
            <HiUsers className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-700">Shared Trips</span>
          </button>
        </div>

        {/* Top Regional Selections */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Top Regional Selections</h2>
              <p className="text-gray-600 mt-1">Most popular destinations right now</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Group by Region</option>
                <option>Europe</option>
                <option>Asia</option>
                <option>North America</option>
                <option>South America</option>
                <option>Africa</option>
                <option>Oceania</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Filter</option>
                <option>Budget Friendly</option>
                <option>Luxury</option>
                <option>Adventure</option>
                <option>Relaxation</option>
                <option>Culture</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                <option>Sort by Popularity</option>
                <option>Cost: Low to High</option>
                <option>Cost: High to Low</option>
                <option>Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularDestinations.map((destination) => (
              <div
                key={destination.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/city/${destination.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                    <HiStar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">{destination.popularity}%</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">{destination.region}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{destination.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-600">
                      Cost: {destination.costIndex}
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

        {/* Previous Trips */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Previous Trips</h2>
              <p className="text-gray-600 mt-1">Relive your adventures and plan new ones</p>
            </div>
            <Link
              to="/my-trips"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View All <HiChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => handleTripClick(trip.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.coverPhoto}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`${getStatusColor(trip.status)} px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center space-x-1`}>
                        <span>{getStatusEmoji(trip.status)}</span>
                        <span>{trip.status}</span>
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 px-4 py-2 rounded-lg">
                        Build Itinerary →
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {trip.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{trip.destination}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <HiCalendar className="h-4 w-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HiLocationMarker className="h-4 w-4" />
                        <span>{trip.stops} stops</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-600">{trip.days} days</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTripClick(trip.id);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        Build Itinerary <HiChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 mb-6">Start planning your first adventure today!</p>
              <Link
                to="/create-trip"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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