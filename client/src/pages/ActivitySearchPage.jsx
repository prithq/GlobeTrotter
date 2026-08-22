import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { activityAPI } from '../api/activity';
import { 
  HiArrowLeft, 
  HiSearch, 
  HiCash, 
  HiClock,
  HiPlus,
  HiCheck,
  HiStar,
  HiFilter
} from 'react-icons/hi';
import { FaCamera, FaUtensils, FaHiking, FaLandmark, FaMusic } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ActivitySearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    costMax: '',
    durationMax: ''
  });
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    searchActivities();
  }, [filters]);

  const searchActivities = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchQuery,
        ...filters
      };
      const response = await activityAPI.getActivities(params);
      setActivities(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load activities');
      // Mock data
      setActivities([
        { _id: '1', name: 'Eiffel Tower Visit', category: 'sightseeing', cost: 30, durationMinutes: 120, description: 'Guided tour of the iconic Eiffel Tower', imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400' },
        { _id: '2', name: 'Louvre Museum Tour', category: 'culture', cost: 25, durationMinutes: 180, description: 'Explore the world-famous Louvre Museum', imageUrl: 'https://images.unsplash.com/photo-1566127241288-1b9a0edc30b6?w=400' },
        { _id: '3', name: 'French Cooking Class', category: 'food', cost: 65, durationMinutes: 240, description: 'Learn to cook authentic French cuisine', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400' },
        { _id: '4', name: 'Seine River Cruise', category: 'sightseeing', cost: 20, durationMinutes: 60, description: 'Romantic cruise along the Seine River', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchActivities();
  };

  const toggleActivitySelection = (activityId) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sightseeing: <FaCamera className="h-5 w-5" />,
      food: <FaUtensils className="h-5 w-5" />,
      adventure: <FaHiking className="h-5 w-5" />,
      culture: <FaLandmark className="h-5 w-5" />,
      other: <FaMusic className="h-5 w-5" />
    };
    return icons[category] || <FaCamera className="h-5 w-5" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      sightseeing: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
      adventure: 'bg-green-100 text-green-700',
      culture: 'bg-purple-100 text-purple-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const addToTrip = () => {
    if (selectedActivities.length === 0) {
      toast.error('Please select at least one activity');
      return;
    }
    toast.success(`${selectedActivities.length} activities added to your trip!`);
    navigate('/create-trip');
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
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
            <h1 className="text-3xl font-bold text-gray-900">Find Activities</h1>
            <p className="text-gray-600 mt-1">Discover and add activities to your trip</p>
          </div>
          {selectedActivities.length > 0 && (
            <button
              onClick={addToTrip}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <HiPlus className="h-5 w-5" />
              Add {selectedActivities.length} Activities
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
                placeholder="Search for activities..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food</option>
                <option value="adventure">Adventure</option>
                <option value="culture">Culture</option>
                <option value="other">Other</option>
              </select>
              <input
                type="number"
                placeholder="Max Cost"
                value={filters.costMax}
                onChange={(e) => setFilters({ ...filters, costMax: e.target.value })}
                className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border-2 ${
                  selectedActivities.includes(activity._id) ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => toggleActivitySelection(activity._id)}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                    <img
                      src={activity.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'}
                      alt={activity.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {selectedActivities.includes(activity._id) && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full">
                        <HiCheck className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{activity.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}>
                            {activity.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <HiCash className="h-4 w-4" />
                        ${activity.cost}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <HiClock className="h-4 w-4" />
                        {formatDuration(activity.durationMinutes)}
                      </span>
                    </div>
                    <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View Details <HiChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySearchPage;