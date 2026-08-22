import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiCalendar, 
  HiLocationMarker, 
  HiSparkles,
  HiLightBulb,
  HiX,
  HiChevronRight,
  HiMap,
  HiCash,
  HiTrendingUp
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { getPlaceImageUrl } from '../utils/imageHelper';
import axiosInstance from '../api/axios';
import { suggestAPI } from '../api/suggest';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [selectedPlace, setSelectedPlace] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tripPlaces, setTripPlaces] = useState([]);

  // Real-time Route Stops & Budget state
  const [isSuggestingRoute, setIsSuggestingRoute] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [showRouteStops, setShowRouteStops] = useState(false);

  const [isEstimatingBudget, setIsEstimatingBudget] = useState(false);
  const [realtimeBudget, setRealtimeBudget] = useState(null);
  const [showRealtimeBudget, setShowRealtimeBudget] = useState(false);

  // Route Order Optimization state
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);
  const [routeReasoning, setRouteReasoning] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceChange = (e) => {
    setSelectedPlace(e.target.value);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getSuggestions = async () => {
    if (!selectedPlace.trim()) {
      toast.error('Please enter a place name first');
      return;
    }

    setIsSuggesting(true);
    setShowSuggestions(true);
    
    try {
      const response = await suggestAPI.getSuggestions(selectedPlace);
      setSuggestions(response.data.suggestions || []);
      
      if (response.data.suggestions?.length === 0) {
        toast.info('No suggestions found for this place');
      }
    } catch (error) {
      toast.error('Failed to get suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const getRouteStopSuggestions = async () => {
    if (tripPlaces.length < 2) {
      toast.error('Add at least 2 destinations to find stops along the route!');
      return;
    }
    const from = tripPlaces[0];
    const to = tripPlaces[tripPlaces.length - 1];

    setIsSuggestingRoute(true);
    setShowRouteStops(true);
    try {
      const response = await suggestAPI.getRouteStops(from, to);
      setRouteStops(response.data.suggestedStops || []);
      toast.success(`Found route stop suggestions between ${from} and ${to}!`);
    } catch (err) {
      toast.error('Failed to suggest route stops');
      setRouteStops([]);
    } finally {
      setIsSuggestingRoute(false);
    }
  };

  const handleOptimizeRouteOrder = async () => {
    if (tripPlaces.length < 2) {
      toast.error('Add at least 2 destinations to optimize travel sequence');
      return;
    }
    setIsOptimizingRoute(true);
    try {
      const response = await suggestAPI.optimizeRoute(tripPlaces[0], tripPlaces.slice(1));
      const { optimizedSequence, reasoning } = response.data;
      if (Array.isArray(optimizedSequence) && optimizedSequence.length > 0) {
        setTripPlaces(optimizedSequence);
        setRouteReasoning(reasoning || '');
        toast.success(`Route optimized geographically: ${optimizedSequence.join(' → ')}`);
      }
    } catch (err) {
      toast.error('Failed to optimize route order');
    } finally {
      setIsOptimizingRoute(false);
    }
  };

  const getRealtimeBudgetEstimate = async () => {
    if (tripPlaces.length === 0) {
      toast.error('Add at least 1 destination to estimate budget!');
      return;
    }
    setIsEstimatingBudget(true);
    setShowRealtimeBudget(true);

    const startMs = new Date(formData.startDate || today).getTime();
    const endMs = new Date(formData.endDate || today).getTime();
    const totalDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
    const daysPerStop = Math.max(1, Math.floor(totalDays / tripPlaces.length));

    const stopsParam = tripPlaces.map(place => ({ cityName: place, days: daysPerStop }));
    try {
      const response = await suggestAPI.getRealtimeBudget(stopsParam);
      setRealtimeBudget(response.data.aiEstimate);
      toast.success('Real-time AI budget estimate calculated!');
    } catch (err) {
      toast.error('Failed to calculate real-time AI budget');
    } finally {
      setIsEstimatingBudget(false);
    }
  };

  const addPlaceToTrip = (placeName) => {
    if (!tripPlaces.includes(placeName)) {
      setTripPlaces([...tripPlaces, placeName]);
      toast.success(`Added ${placeName} to your trip`);
    } else {
      toast.info(`${placeName} is already in your trip`);
    }
  };

  const removePlaceFromTrip = (placeName) => {
    setTripPlaces(tripPlaces.filter(p => p !== placeName));
    toast.success(`Removed ${placeName} from your trip`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    if (tripPlaces.length === 0) {
      toast.error('Please add at least one destination');
      return;
    }

    setIsLoading(true);
    try {
      const tripData = {
        name: formData.name,
        description: `${formData.name} trip across ${tripPlaces.join(', ')}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        targetBudget: formData.targetBudget ? Number(formData.targetBudget) : 0,
        coverPhotoUrl: getPlaceImageUrl(tripPlaces[0] || formData.name),
      };

      const response = await axiosInstance.post('/trips', tripData);
      const newTrip = response.data;

      // Add stops for each destination city in optimized sequence
      const startMs = new Date(formData.startDate).getTime();
      const endMs = new Date(formData.endDate).getTime();
      const totalDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
      const daysPerStop = Math.max(1, Math.floor(totalDays / tripPlaces.length));

      // Fetch all cities from backend to match cityId
      const citiesRes = await axiosInstance.get('/cities?limit=100');
      const allCities = citiesRes.data?.data || [];

      let currentStart = new Date(formData.startDate);

      for (let i = 0; i < tripPlaces.length; i++) {
        const placeName = tripPlaces[i];
        const matchedCity = allCities.find(c => c.name.toLowerCase() === placeName.toLowerCase()) || allCities[0];
        
        const stopEnd = new Date(currentStart);
        const addDays = (i === tripPlaces.length - 1) 
          ? Math.max(0, Math.floor((endMs - currentStart.getTime()) / (1000 * 60 * 60 * 24)))
          : daysPerStop - 1;
        stopEnd.setDate(stopEnd.getDate() + addDays);

        if (matchedCity?._id) {
          await axiosInstance.post(`/trips/${newTrip._id}/stops`, {
            cityId: matchedCity._id,
            cityName: placeName,
            startDate: currentStart.toISOString().slice(0, 10),
            endDate: stopEnd.toISOString().slice(0, 10),
          });
        }

        currentStart = new Date(stopEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }

      toast.success('Trip created with optimized stops! 🎉');
      navigate(`/trip/${newTrip._id}/build`);
    } catch (error) {
      toast.error('Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const minEndDate = formData.startDate || today;

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
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.name || 'Traveler'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Plan a New Trip</h1>
          <p className="text-gray-600 mt-1">Create your dream itinerary with real-time geographical route and budget optimization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Trip Details Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Trip Details */}
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Trip Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., India Heritage Express"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        min={today}
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiCalendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        required
                        min={minEndDate}
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="targetBudget" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Set Your Target Budget ($) <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HiCash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="targetBudget"
                      name="targetBudget"
                      type="number"
                      min="0"
                      value={formData.targetBudget}
                      onChange={handleChange}
                      placeholder="e.g. 2500"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm font-medium text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Destinations */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Destinations <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Add Destination */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiLocationMarker className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={selectedPlace}
                        onChange={handlePlaceChange}
                        placeholder="Enter a destination e.g. Gujarat..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPlace.trim()) {
                          addPlaceToTrip(selectedPlace.trim());
                          setSelectedPlace('');
                        }
                      }}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <HiPlus className="h-5 w-5" />
                      Add
                    </button>
                  </div>

                  {/* AI Place Suggestions Button */}
                  {selectedPlace && (
                    <button
                      type="button"
                      onClick={getSuggestions}
                      disabled={isSuggesting}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
                    >
                      {isSuggesting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting real-time place suggestions...
                        </>
                      ) : (
                        <>
                          <HiSparkles className="h-5 w-5" />
                          Get Realtime AI Suggestions for {selectedPlace}
                        </>
                      )}
                    </button>
                  )}

                  {/* Selected Places */}
                  {tripPlaces.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Your Route Destinations</h4>
                        {tripPlaces.length >= 2 && (
                          <button
                            type="button"
                            onClick={handleOptimizeRouteOrder}
                            disabled={isOptimizingRoute}
                            className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                            title="Reorder destinations geographically to keep distance and cost low (e.g. Gujarat -> Mumbai -> Bangalore)"
                          >
                            <HiSparkles className="h-3.5 w-3.5" />
                            {isOptimizingRoute ? 'Optimizing Route...' : '⚡ Optimize Route Order (Low Cost Path)'}
                          </button>
                        )}
                      </div>

                      {routeReasoning && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg mb-2 border border-emerald-200">
                          💡 <strong>Optimized Route:</strong> {routeReasoning}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {tripPlaces.map((place, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200"
                          >
                            <span>{index + 1}. {place}</span>
                            <button
                              type="button"
                              onClick={() => removePlaceFromTrip(place)}
                              className="hover:text-blue-900"
                            >
                              <HiX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Route Stop Assistant Button */}
                  {tripPlaces.length >= 2 && (
                    <button
                      type="button"
                      onClick={getRouteStopSuggestions}
                      disabled={isSuggestingRoute}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium disabled:opacity-50"
                    >
                      {isSuggestingRoute ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing route...
                        </>
                      ) : (
                        <>
                          <HiSparkles className="h-5 w-5" />
                          Suggest Intermediate City Stops Along Route ({tripPlaces[0]} → {tripPlaces[tripPlaces.length - 1]})
                        </>
                      )}
                    </button>
                  )}

                  {/* Realtime Budget Preview Button */}
                  {tripPlaces.length > 0 && (
                    <button
                      type="button"
                      onClick={getRealtimeBudgetEstimate}
                      disabled={isEstimatingBudget}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                      {isEstimatingBudget ? (
                        <span>Calculating budget...</span>
                      ) : (
                        <>
                          <HiCash className="h-4 w-4" />
                          Estimate Budget
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Route Stops Display */}
          {showRouteStops && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-md p-6 sm:p-8 border-2 border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiSparkles className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">Suggested Stops Along Route</h2>
                </div>
                <button type="button" onClick={() => setShowRouteStops(false)} className="text-gray-400 hover:text-gray-600">
                  <HiX className="h-6 w-6" />
                </button>
              </div>

              {isSuggestingRoute ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-3 text-emerald-700 font-medium">Finding best cities along your travel route...</p>
                </div>
              ) : routeStops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routeStops.map((stop, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-lg">{stop.name}</span>
                          {stop.country && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{stop.country}</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{stop.why}</p>
                        {stop.suggestedDays && <p className="text-xs text-gray-500 mt-1">Suggested stay: {stop.suggestedDays} days</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => addPlaceToTrip(stop.name)}
                        className="ml-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <HiPlus className="h-4 w-4" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No route stops found.</p>
              )}
            </div>
          )}

          {/* Realtime AI Budget Preview Display */}
          {showRealtimeBudget && realtimeBudget && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-md p-6 sm:p-8 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiTrendingUp className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Real-Time AI Budget Estimation</h2>
                </div>
                <button type="button" onClick={() => setShowRealtimeBudget(false)} className="text-gray-400 hover:text-gray-600">
                  <HiX className="h-6 w-6" />
                </button>
              </div>

              {isEstimatingBudget ? (
                <div className="text-center py-6">
                  <p className="text-purple-700 font-medium">Calculating real-time estimates...</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Transportation</p>
                      <p className="text-lg font-bold text-gray-900">${realtimeBudget.summary?.total_transportation_usd || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Accommodation</p>
                      <p className="text-lg font-bold text-gray-900">${realtimeBudget.summary?.total_accommodation_usd || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Food</p>
                      <p className="text-lg font-bold text-gray-900">${realtimeBudget.summary?.total_food_usd || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-xs text-gray-500">Activities</p>
                      <p className="text-lg font-bold text-gray-900">${realtimeBudget.summary?.total_activities_usd || 0}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-200 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Estimated Total Cost for Trip</span>
                    <span className="text-2xl font-extrabold text-purple-700">${realtimeBudget.summary?.grand_total_usd || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Places Display */}
          {showSuggestions && (
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <HiLightBulb className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">Realtime Suggestions for {selectedPlace}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiX className="h-6 w-6" />
                </button>
              </div>

              {isSuggesting ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-gray-600">Searching top attractions in {selectedPlace}...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-900">{suggestion.name}</h4>
                            <button
                              type="button"
                              onClick={() => addPlaceToTrip(suggestion.name)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                              Add <HiPlus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.what}</p>
                          <p className="text-xs text-gray-500 mt-1">{suggestion.why}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No suggestions found for this place.</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || tripPlaces.length === 0}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Trip...
                </>
              ) : (
                <>
                  Create Trip
                  <HiChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripPage;