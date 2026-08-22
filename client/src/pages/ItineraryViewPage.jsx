import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import { 
  HiArrowLeft, 
  HiCalendar, 
  HiLocationMarker, 
  HiCash,
  HiClock,
  HiMap,
  HiChevronDown,
  HiChevronUp,
  HiShare,
  HiDownload,
  HiPrinter
} from 'react-icons/hi';
import { FaPlane, FaHotel, FaUtensils, FaCamera } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ItineraryViewPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grouped'); // grouped or list

  useEffect(() => {
    loadItinerary();
  }, [tripId]);

  const loadItinerary = async () => {
    setIsLoading(true);
    try {
      const response = await tripAPI.getItinerary(tripId);
      setItinerary(response.data);
    } catch (error) {
      toast.error('Failed to load itinerary');
      // Mock data for demo
      setItinerary({
        tripId: tripId,
        tripName: 'European Summer Adventure',
        startDate: '2026-06-15',
        endDate: '2026-06-30',
        totalDays: 15,
        stops: [
          {
            stopId: '1',
            cityId: '1',
            cityName: 'Paris',
            orderIndex: 0,
            startDate: '2026-06-15',
            endDate: '2026-06-20',
            days: [
              {
                date: '2026-06-15',
                dayNumber: 1,
                activities: [
                  { id: '1', activityId: '1', name: 'Eiffel Tower Visit', category: 'sightseeing', scheduledTime: '10:00', cost: 30 },
                  { id: '2', activityId: '2', name: 'Lunch at Le Meurice', category: 'food', scheduledTime: '13:00', cost: 45 }
                ]
              },
              {
                date: '2026-06-16',
                dayNumber: 2,
                activities: [
                  { id: '3', activityId: '3', name: 'Louvre Museum Tour', category: 'culture', scheduledTime: '09:30', cost: 25 }
                ]
              }
            ]
          },
          {
            stopId: '2',
            cityId: '2',
            cityName: 'Rome',
            orderIndex: 1,
            startDate: '2026-06-20',
            endDate: '2026-06-25',
            days: [
              {
                date: '2026-06-20',
                dayNumber: 6,
                activities: [
                  { id: '4', activityId: '4', name: 'Colosseum Visit', category: 'sightseeing', scheduledTime: '09:00', cost: 20 }
                ]
              }
            ]
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      sightseeing: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
      culture: 'bg-purple-100 text-purple-700',
      adventure: 'bg-green-100 text-green-700',
      other: 'bg-gray-100 text-gray-700'
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

  const calculateDailyCost = (activities) => {
    return activities.reduce((total, activity) => total + (activity.cost || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                <HiShare className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                <HiDownload className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                <HiPrinter className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.name || 'Traveler'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{itinerary?.tripName}</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(itinerary?.startDate)} - {formatDate(itinerary?.endDate)} • {itinerary?.totalDays} days
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grouped' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Grouped by City
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            List View
          </button>
        </div>

        {/* Itinerary Content */}
        <div className="space-y-8">
          {itinerary?.stops?.map((stop) => (
            <div key={stop.stopId} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* City Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiLocationMarker className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{stop.cityName}</h2>
                      <p className="text-sm text-gray-600">
                        {formatDate(stop.startDate)} - {formatDate(stop.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Activities</p>
                    <p className="text-lg font-bold text-blue-600">
                      {stop.days?.reduce((total, day) => total + (day.activities?.length || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Days */}
              <div className="divide-y divide-gray-100">
                {stop.days?.map((day) => (
                  <div key={day.date} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {day.dayNumber}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Day {day.dayNumber} - {formatDate(day.date)}
                      </h3>
                      <span className="ml-auto text-sm text-gray-500">
                        Cost: ${calculateDailyCost(day.activities)}
                      </span>
                    </div>

                    {/* Activities */}
                    <div className="space-y-3 ml-11">
                      {day.activities?.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className={`p-2 rounded-lg ${getCategoryColor(activity.category)}`}>
                            {getCategoryIcon(activity.category)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.name}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <HiClock className="h-4 w-4" />
                                {activity.scheduledTime || 'Flexible'}
                              </span>
                              <span className="flex items-center gap-1">
                                <HiCash className="h-4 w-4" />
                                ${activity.cost || 0}
                              </span>
                              <span className="capitalize px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700">
                                {activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!day.activities || day.activities.length === 0) && (
                        <p className="text-sm text-gray-400 italic">No activities planned for this day</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8">
          <button
            onClick={() => navigate(`/trip/${tripId}/build`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Edit Itinerary
          </button>
          <button
            onClick={() => navigate(`/trip/${tripId}/calendar`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <HiCalendar className="h-5 w-5" />
            View Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryViewPage;