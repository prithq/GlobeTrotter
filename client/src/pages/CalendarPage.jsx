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
  HiChevronLeft,
  HiChevronRight,
  HiPlus
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const [calendar, setCalendar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadCalendar();
  }, [tripId]);

  const loadCalendar = async () => {
    setIsLoading(true);
    try {
      const response = await tripAPI.getCalendar(tripId);
      setCalendar(response.data);
    } catch (error) {
      toast.error('Failed to load calendar');
      // Mock data
      setCalendar({
        tripId: tripId,
        tripName: 'European Summer Adventure',
        startDate: '2026-06-15',
        endDate: '2026-06-30',
        days: [
          { date: '2026-06-15', dayNumber: 1, cityName: 'Paris', activities: [{ id: '1', name: 'Eiffel Tower Visit', scheduledTime: '10:00', cost: 30 }] },
          { date: '2026-06-16', dayNumber: 2, cityName: 'Paris', activities: [{ id: '2', name: 'Louvre Museum Tour', scheduledTime: '09:30', cost: 25 }] },
          { date: '2026-06-17', dayNumber: 3, cityName: 'Paris', activities: [] },
          { date: '2026-06-20', dayNumber: 6, cityName: 'Rome', activities: [{ id: '3', name: 'Colosseum Visit', scheduledTime: '09:00', cost: 20 }] }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDayActivities = (date) => {
    return calendar?.days?.find(day => day.date === date);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Calendar</h1>
            <p className="text-gray-600 mt-1">{calendar?.tripName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/trip/${tripId}/itinerary`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <HiCalendar className="h-5 w-5" />
              View Itinerary
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <HiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square bg-gray-50 rounded-lg"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                const dateString = date.toISOString().split('T')[0];
                const dayData = getDayActivities(dateString);
                const hasActivities = dayData && dayData.activities && dayData.activities.length > 0;
                const isToday = new Date().toISOString().split('T')[0] === dateString;

                return (
                  <div
                    key={dayNumber}
                    className={`aspect-square p-2 rounded-lg transition-all hover:shadow-md ${
                      hasActivities ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' : 'bg-gray-50 hover:bg-gray-100'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => {
                      if (hasActivities) {
                        navigate(`/trip/${tripId}/itinerary`);
                      }
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {dayNumber}
                      </span>
                      {hasActivities && (
                        <div className="mt-auto">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-blue-600">
                              {dayData.activities.length} activities
                            </span>
                            {dayData.activities.some(a => a.cost > 0) && (
                              <span className="text-xs text-gray-500">
                                ${dayData.activities.reduce((sum, a) => sum + (a.cost || 0), 0)}
                              </span>
                            )}
                          </div>
                          {dayData.cityName && (
                            <span className="text-xs text-gray-500 truncate">
                              📍 {dayData.cityName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-gray-600">Has Activities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span className="text-gray-600">No Activities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-blue-500 bg-white rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;