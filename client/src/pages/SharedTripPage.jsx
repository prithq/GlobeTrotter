import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tripAPI } from '../api/trips';
import { 
  HiLocationMarker, 
  HiCalendar, 
  HiClock, 
  HiCash, 
  HiShare, 
  HiDuplicate,
  HiGlobe
} from 'react-icons/hi';
import { FaCamera, FaUtensils, FaPlane, FaHotel } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const SharedTripPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPublicTrip();
  }, [slug]);

  const loadPublicTrip = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await tripAPI.getPublicTrip(slug);
      setTrip(response.data);
    } catch (err) {
      setError('This public trip could not be found or is no longer public.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      sightseeing: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
      culture: 'bg-purple-100 text-purple-700',
      adventure: 'bg-green-100 text-green-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sightseeing: <FaCamera className="h-4 w-4" />,
      food: <FaUtensils className="h-4 w-4" />,
      culture: <FaPlane className="h-4 w-4" />,
      adventure: <FaHotel className="h-4 w-4" />
    };
    return icons[category] || <FaCamera className="h-4 w-4" />;
  };

  const handleCopyTrip = () => {
    navigate('/create-trip', { state: { prefillName: `${trip?.tripName} (Copy)` } });
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Public trip link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
        <p className="text-gray-600 max-w-md mb-6">{error}</p>
        <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          Go to GlobeTrotter Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🌍</span>
              <h1 className="text-xl font-bold text-blue-600">GlobeTrotter</h1>
              <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <HiGlobe className="h-3.5 w-3.5" /> Shared Trip
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareLink}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <HiShare className="h-4 w-4" /> Share
              </button>
              <button
                onClick={handleCopyTrip}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <HiDuplicate className="h-4 w-4" /> Copy Trip
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Cover Header */}
      <div className="relative bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        {trip.coverPhotoUrl && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <img src={trip.coverPhotoUrl} alt={trip.tripName} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">{trip.tripName}</h1>
          {trip.description && <p className="text-blue-100 text-lg mb-6 max-w-2xl">{trip.description}</p>}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <HiCalendar className="h-5 w-5 text-blue-400" />
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiClock className="h-5 w-5 text-blue-400" />
              <span>{trip.totalDays} Days</span>
            </div>
            <div className="flex items-center gap-2">
              <HiLocationMarker className="h-5 w-5 text-blue-400" />
              <span>{trip.stops?.length || 0} Cities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {trip.stops?.map((stop) => (
            <div key={stop.stopId} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiLocationMarker className="h-7 w-7 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{stop.cityName}</h2>
                    <p className="text-sm text-gray-600">{formatDate(stop.startDate)} - {formatDate(stop.endDate)}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {stop.days?.map((day) => (
                  <div key={day.date} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {day.dayNumber}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Day {day.dayNumber} — {formatDate(day.date)}
                      </h3>
                    </div>

                    <div className="space-y-3 ml-11">
                      {day.activities?.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl">
                          <div className={`p-2.5 rounded-lg ${getCategoryColor(activity.category)}`}>
                            {getCategoryIcon(activity.category)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{activity.name}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              {activity.scheduledTime && (
                                <span className="flex items-center gap-1">
                                  <HiClock className="h-4 w-4" /> {activity.scheduledTime}
                                </span>
                              )}
                              {activity.cost > 0 && (
                                <span className="flex items-center gap-1 font-medium text-gray-700">
                                  <HiCash className="h-4 w-4" /> ${activity.cost}
                                </span>
                              )}
                              <span className="capitalize px-2 py-0.5 rounded-md text-xs bg-gray-200 text-gray-700">
                                {activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!day.activities || day.activities.length === 0) && (
                        <p className="text-sm text-gray-400 italic">No scheduled activities for this day</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedTripPage;
