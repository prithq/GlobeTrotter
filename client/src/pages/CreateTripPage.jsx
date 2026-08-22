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
  HiChevronRight
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import axiosInstance from '../api/axios';

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
      const response = await axiosInstance.get(`/suggest?place=${encodeURIComponent(selectedPlace)}`);
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

    // Validation
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
        description: `${formData.name} trip`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        coverPhotoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      };

      const response = await axiosInstance.post('/trips', tripData);
      
      toast.success('Trip created successfully! 🎉');
      navigate(`/trip/${response.data._id}`);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Plan a New Trip</h1>
          <p className="text-gray-600 mt-1">Create your dream itinerary and explore the world</p>
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
                    placeholder="e.g., European Summer Adventure"
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
                        placeholder="Enter a destination..."
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

                  {/* AI Suggestions Button */}
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
                          Getting suggestions...
                        </>
                      ) : (
                        <>
                          <HiSparkles className="h-5 w-5" />
                          Get AI Suggestions for {selectedPlace}
                        </>
                      )}
                    </button>
                  )}

                  {/* Selected Places */}
                  {tripPlaces.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Destinations</h4>
                      <div className="flex flex-wrap gap-2">
                        {tripPlaces.map((place, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                          >
                            <span>{place}</span>
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
                </div>

                {/* Trip Summary */}
                {tripPlaces.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Trip Summary</h4>
                    <div className="space-y-1.5">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{tripPlaces.length}</span> destinations
                      </p>
                      {formData.startDate && formData.endDate && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">
                            {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                          </span> days
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Suggestions Display */}
          {showSuggestions && (
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <HiLightBulb className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">Suggestions for {selectedPlace}</h2>
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
                  <p className="mt-4 text-gray-600">Thinking of the best places to visit...</p>
                  <p className="text-sm text-gray-400">This may take 15-30 seconds</p>
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
                  <p className="text-sm text-gray-400 mt-1">Try a different city or check your spelling.</p>
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

          {tripPlaces.length === 0 && (
            <p className="text-sm text-amber-600 text-center -mt-4">
              Please add at least one destination to create your trip
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTripPage;