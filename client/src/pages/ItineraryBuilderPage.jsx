import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import { cityAPI } from '../api/cities';
import { activityAPI } from '../api/activity';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiCalendar, 
  HiLocationMarker, 
  HiCash,
  HiX,
  HiChevronDown,
  HiChevronUp,
  HiTrash,
  HiClock
} from 'react-icons/hi';
import { 
  FaPlane, 
  FaHotel, 
  FaUtensils,
  FaCamera,
  FaMapMarkedAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ItineraryBuilderPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals / forms state
  const [showAddStop, setShowAddStop] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [stopStartDate, setStopStartDate] = useState('');
  const [stopEndDate, setStopEndDate] = useState('');

  const [activeStopIdForActivity, setActiveStopIdForActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({
    activityId: '',
    name: '',
    category: 'sightseeing',
    scheduledDate: '',
    scheduledTime: '10:00',
    cost: 0
  });

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    setIsLoading(true);
    try {
      const [tripRes, citiesRes, actRes] = await Promise.all([
        tripAPI.getTrip(tripId),
        cityAPI.getCities({ limit: 100 }),
        activityAPI.getActivities({ limit: 100 })
      ]);
      setTrip(tripRes.data);
      setCities(citiesRes.data?.data || []);
      setAvailableActivities(actRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to load trip builder data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedCityId || !stopStartDate || !stopEndDate) {
      toast.error('Please select a city and dates');
      return;
    }

    const city = cities.find(c => c._id === selectedCityId);
    if (!city) return;

    try {
      const response = await tripAPI.addStop(tripId, {
        cityId: city._id,
        cityName: city.name,
        startDate: stopStartDate,
        endDate: stopEndDate
      });
      setTrip(response.data);
      setShowAddStop(false);
      setSelectedCityId('');
      setStopStartDate('');
      setStopEndDate('');
      toast.success(`Added ${city.name} to itinerary!`);
    } catch (error) {
      toast.error('Failed to add city stop');
    }
  };

  const handleDeleteStop = async (stopId, cityName) => {
    if (!window.confirm(`Remove ${cityName} stop from trip?`)) return;
    try {
      const response = await tripAPI.deleteStop(tripId, stopId);
      setTrip(response.data);
      toast.success(`Removed ${cityName}`);
    } catch (error) {
      toast.error('Failed to remove stop');
    }
  };

  const handleAddActivity = async (stopId) => {
    if (!newActivity.name || newActivity.cost === undefined) {
      toast.error('Activity name and cost are required');
      return;
    }

    const matchedAct = availableActivities.find(a => a.name.toLowerCase() === newActivity.name.toLowerCase());
    const activityId = matchedAct?._id || "64f1a2b3c4d5e6f7a8b9c0d2"; // fallback valid objectid

    try {
      const response = await tripAPI.addActivity(tripId, stopId, {
        activityId,
        name: newActivity.name,
        category: newActivity.category,
        scheduledDate: newActivity.scheduledDate || undefined,
        scheduledTime: newActivity.scheduledTime || undefined,
        cost: Number(newActivity.cost) || 0
      });
      setTrip(response.data);
      setActiveStopIdForActivity(null);
      setNewActivity({
        activityId: '',
        name: '',
        category: 'sightseeing',
        scheduledDate: '',
        scheduledTime: '10:00',
        cost: 0
      });
      toast.success('Added activity to stop!');
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (stopId, activityId, actName) => {
    try {
      const response = await tripAPI.deleteActivity(tripId, stopId, activityId);
      setTrip(response.data);
      toast.success(`Removed ${actName}`);
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  const calculateTotalCost = () => {
    if (!trip || !trip.stops) return 0;
    return trip.stops.reduce((total, stop) => {
      const stopActivitiesCost = stop.activities ? stop.activities.reduce((s, a) => s + (a.cost || 0), 0) : 0;
      return total + stopActivitiesCost;
    }, 0);
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.name || 'Traveler'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip?.name} — Itinerary Builder</h1>
            <p className="text-gray-600 mt-1">
              {formatDate(trip?.startDate)} - {formatDate(trip?.endDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Activities Cost</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalCost())}</p>
          </div>
        </div>

        {/* City Stops list */}
        <div className="space-y-6">
          {trip?.stops?.map((stop, index) => (
            <div key={stop._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{stop.cityName}</h2>
                    <p className="text-sm text-gray-600">
                      {formatDate(stop.startDate)} - {formatDate(stop.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteStop(stop._id, stop.cityName)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Stop"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Stop Activities */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Activities ({stop.activities?.length || 0})
                  </h3>
                  <button
                    onClick={() => {
                      setActiveStopIdForActivity(stop._id);
                      setNewActivity({
                        activityId: '',
                        name: '',
                        category: 'sightseeing',
                        scheduledDate: stop.startDate ? new Date(stop.startDate).toISOString().slice(0, 10) : '',
                        scheduledTime: '10:00',
                        cost: 0
                      });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <HiPlus className="h-4 w-4" /> Add Activity
                  </button>
                </div>

                <div className="space-y-3">
                  {stop.activities?.map((act) => (
                    <div key={act._id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                          🎯
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{act.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            {act.scheduledDate && <span>📅 {formatDate(act.scheduledDate)}</span>}
                            {act.scheduledTime && <span>⏰ {act.scheduledTime}</span>}
                            <span className="capitalize bg-gray-200 text-gray-700 px-2 py-0.5 rounded">{act.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-600">{formatCurrency(act.cost)}</span>
                        <button
                          onClick={() => handleDeleteActivity(stop._id, act._id, act.name)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!stop.activities || stop.activities.length === 0) && (
                    <p className="text-sm text-gray-400 italic py-2 text-center">No activities added to {stop.cityName} yet.</p>
                  )}
                </div>

                {/* Add Activity Form inside stop */}
                {activeStopIdForActivity === stop._id && (
                  <div className="mt-4 p-4 border border-blue-200 rounded-xl bg-blue-50/50">
                    <h4 className="font-semibold text-gray-900 text-sm mb-3">Add Activity to {stop.cityName}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Select / Enter Activity</label>
                        <input
                          type="text"
                          value={newActivity.name}
                          onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                          placeholder="e.g., Eiffel Tower Visit"
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                        <select
                          value={newActivity.category}
                          onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                          <option value="sightseeing">Sightseeing</option>
                          <option value="food">Food</option>
                          <option value="adventure">Adventure</option>
                          <option value="culture">Culture</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          value={newActivity.scheduledDate}
                          onChange={(e) => setNewActivity({ ...newActivity, scheduledDate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Cost (USD)</label>
                        <input
                          type="number"
                          value={newActivity.cost}
                          onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => setActiveStopIdForActivity(null)}
                        className="px-4 py-2 border text-gray-600 rounded-lg text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddActivity(stop._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                      >
                        Save Activity
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Stop Button / Form */}
        {!showAddStop ? (
          <button
            onClick={() => setShowAddStop(true)}
            className="mt-6 w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 text-gray-600 hover:text-blue-600 hover:border-blue-400 transition-all text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <HiPlus className="h-6 w-6" />
              <span className="font-semibold text-lg">Add City Stop</span>
            </div>
          </button>
        ) : (
          <form onSubmit={handleAddStop} className="mt-6 bg-white rounded-2xl shadow-md p-6 border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Add City Stop</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select City</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                >
                  <option value="">Choose a city...</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>{city.name}, {city.country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={stopStartDate}
                  onChange={(e) => setStopStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={stopEndDate}
                  onChange={(e) => setStopEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddStop(false)}
                className="px-5 py-2.5 border text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Stop
              </button>
            </div>
          </form>
        )}

        {/* Action Navigation Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <Link
            to="/my-trips"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to My Trips
          </Link>
          <button
            onClick={() => navigate(`/trip/${tripId}/itinerary`)}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
          >
            View Full Itinerary →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilderPage;