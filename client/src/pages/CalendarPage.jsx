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
  HiPlus,
  HiSelector,
  HiSearch
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  
  const [userTrips, setUserTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId || '');
  const [calendar, setCalendar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Search & Filter controls matching Screen 11 mockup
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedSortBy, setSelectedSortBy] = useState('');

  useEffect(() => {
    loadUserTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      loadCalendar(selectedTripId);
    }
  }, [selectedTripId]);

  const loadUserTrips = async () => {
    try {
      const response = await tripAPI.getTrips(1, 50);
      const list = response.data?.data || [];
      setUserTrips(list);
      
      if (!selectedTripId && list.length > 0) {
        setSelectedTripId(list[0]._id);
      }
    } catch (err) {
      console.warn('Failed to load user trips list');
    }
  };

  const loadCalendar = async (targetTripId) => {
    setIsLoading(true);
    try {
      const response = await tripAPI.getCalendar(targetTripId);
      setCalendar(response.data);
      if (response.data?.startDate) {
        setCurrentMonth(new Date(response.data.startDate));
      }
    } catch (error) {
      toast.error('Failed to load calendar for selected trip');
      setCalendar({
        tripId: targetTripId,
        tripName: 'Trip Calendar',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        days: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with Consistent GlobeTrotter Brand Logo */}
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
              <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                {user?.name || 'Traveler'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Header Controls Matching Screen 11 Wireframe */}
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <HiCalendar className="h-7 w-7 text-blue-600" /> Trip Calendar & Timeline
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">Visualize your trip itineraries, activities, and daily schedules</p>
            </div>

            {/* Trip Selector Dropdown */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {userTrips.length === 0 && <option value="">No trips available</option>}
                  {userTrips.map((t) => (
                    <option key={t._id} value={t._id}>
                      ✈️ {t.name} ({new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <HiSelector className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {selectedTripId && (
                <button
                  onClick={() => navigate(`/trip/${selectedTripId}/build`)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-xs transition-colors shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <HiCalendar className="h-4 w-4" /> Build Itinerary
                </button>
              )}
            </div>
          </div>

          {/* Search bar & Filter row (Screen 11 layout: Search bar ... [Group by] [Filter] [Sort by...]) */}
          <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-gray-100">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities or places in calendar..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={selectedGroupBy}
                onChange={(e) => setSelectedGroupBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white font-medium"
              >
                <option value="">Group by: City</option>
                <option value="category">Group by: Activity Type</option>
                <option value="date">Group by: Date</option>
              </select>

              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white font-medium"
              >
                <option value="">Filter: All Activities</option>
                <option value="hasCost">Filter: With Expense</option>
                <option value="free">Filter: Free Activities</option>
              </select>

              <select
                value={selectedSortBy}
                onChange={(e) => setSelectedSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white font-medium"
              >
                <option value="">Sort by: Date</option>
                <option value="costHigh">Sort by: Expense (High)</option>
                <option value="costLow">Sort by: Expense (Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar View Card (Screen 11 mockup style) */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-white/70 rounded-lg transition-colors"
            >
              <HiChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{monthName}</h2>
              {calendar?.tripName && (
                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mt-0.5">
                  Trip: {calendar.tripName}
                </p>
              )}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-white/70 rounded-lg transition-colors"
            >
              <HiChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4 sm:p-6">
            {/* Day Name Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="text-center text-xs font-black text-gray-500 py-2 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="min-h-[110px] bg-gray-50/50 rounded-xl"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
                const dateString = date.toISOString().split('T')[0];
                const dayData = getDayActivities(dateString);
                const hasActivities = dayData && dayData.activities && dayData.activities.length > 0;
                const isToday = new Date().toISOString().split('T')[0] === dateString;

                // Match against all user trips to render multi-trip span badges (Screen 11 mockup style)
                const matchingTrips = userTrips.filter(t => 
                  t.startDate && t.endDate && 
                  dateString >= t.startDate.slice(0, 10) && 
                  dateString <= t.endDate.slice(0, 10)
                );

                return (
                  <div
                    key={dayNumber}
                    className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                      matchingTrips.length > 0 ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-gray-100'
                    } ${isToday ? 'ring-2 ring-blue-500 bg-blue-100/40' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>
                        {dayNumber}
                      </span>
                      {isToday && (
                        <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1 rounded uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Render Multi-Day Trip Span Badges (Screen 11 style: e.g. PARIS TRIP 15-22, NYC GETAWAY) */}
                    <div className="space-y-1 my-1">
                      {matchingTrips.map((mt, mIdx) => (
                        <div
                          key={mIdx}
                          onClick={() => setSelectedTripId(mt._id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1 rounded text-[10px] font-black uppercase truncate shadow-xs cursor-pointer hover:opacity-90"
                          title={`${mt.name} (${new Date(mt.startDate).toLocaleDateString()} - ${new Date(mt.endDate).toLocaleDateString()})`}
                        >
                          {mt.name}
                        </div>
                      ))}
                    </div>

                    {dayData && (
                      <div className="mt-auto">
                        {dayData.cityName && (
                          <p className="text-[11px] font-bold text-gray-900 truncate">
                            📍 {dayData.cityName}
                          </p>
                        )}
                        {hasActivities && (
                          <div className="mt-0.5 bg-blue-100 text-blue-900 px-1 py-0.5 rounded text-[10px] font-bold truncate">
                            🎯 {dayData.activities.length} act (${dayData.activities.reduce((s, a) => s + (a.cost || 0), 0)})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day-by-Day Schedule List (Screen 9 / Screen 11 style: Day 1 Physical Activity Expense) */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center animate-pulse">
            <p className="text-gray-500">Loading trip schedule...</p>
          </div>
        ) : calendar?.days?.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>📅</span> Day-by-Day Activity & Expense Agenda ({calendar.tripName})
            </h3>

            <div className="space-y-6">
              {calendar.days.map((day, idx) => {
                const dayCost = day.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0;
                return (
                  <div key={idx} className="border-l-4 border-blue-600 pl-4 py-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wide">
                          Day {day.dayNumber} • {formatDate(day.date)}
                        </span>
                        <h4 className="font-bold text-gray-900 text-lg">{day.cityName}</h4>
                      </div>
                      {dayCost > 0 && (
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          Activities Total: ${dayCost}
                        </span>
                      )}
                    </div>

                    {day.activities && day.activities.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {day.activities.map((act, aIdx) => (
                          <div key={aIdx} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between text-sm hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-bold">🎯</span>
                              <span className="font-semibold text-gray-800">{act.name}</span>
                              {act.scheduledTime && (
                                <span className="text-xs text-gray-500 font-medium">({act.scheduledTime})</span>
                              )}
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded capitalize">
                                {act.category || 'activity'}
                              </span>
                            </div>
                            <span className="font-bold text-blue-600">${act.cost || 0}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mt-1">Free day / Exploration in {day.cityName}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-5xl mb-3">✈️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No itinerary plan generated yet</h3>
            <p className="text-gray-600 text-sm mb-4">Add city stops and activities to build your trip schedule.</p>
            {selectedTripId && (
              <button
                onClick={() => navigate(`/trip/${selectedTripId}/build`)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700"
              >
                Build Itinerary
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;