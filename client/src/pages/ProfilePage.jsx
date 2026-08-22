import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/users';
import { tripAPI } from '../api/trips';
import { 
  HiArrowLeft, 
  HiUser, 
  HiMail, 
  HiCamera,
  HiGlobe,
  HiSave,
  HiTrash,
  HiExclamationCircle,
  HiCalendar,
  HiLocationMarker,
  HiChevronRight
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserInContext } = useAuth();
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [trips, setTrips] = useState([]);
  const [isTripsLoading, setIsTripsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photoUrl: '',
    languagePref: 'en'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        photoUrl: user.photoUrl || '',
        languagePref: user.languagePref || 'en'
      });
    }
    loadUserTrips();
  }, [user]);

  const loadUserTrips = async () => {
    setIsTripsLoading(true);
    try {
      const response = await tripAPI.getTrips(1, 100);
      setTrips(response.data?.data || []);
    } catch (err) {
      console.warn('Failed to fetch user trips for profile:', err.message);
    } finally {
      setIsTripsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photoUrl: reader.result
      }));
      toast.success('Image preview updated! Click "Save Changes" to finalize.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await userAPI.updateUser(user._id, formData);
      updateUserInContext(response.data || formData);
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await userAPI.deleteUser(user._id);
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Split trips into Preplanned Trips vs Previous Trips (Screen 7 format)
  const { preplannedTrips, previousTrips } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const preplanned = [];
    const previous = [];

    trips.forEach(t => {
      const endDateStr = t.endDate ? t.endDate.slice(0, 10) : '';
      if (endDateStr < today) {
        previous.push(t);
      } else {
        preplanned.push(t);
      }
    });

    return { preplannedTrips: preplanned, previousTrips: previous };
  }, [trips]);

  const renderTripCard = (trip) => (
    <div
      key={trip._id}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-gray-100 min-w-[280px]"
    >
      <div>
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="p-4">
          <h4 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">
            {trip.name}
          </h4>
          <div className="space-y-1.5 text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1.5">
              <HiCalendar className="h-4 w-4 text-blue-500" />
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HiLocationMarker className="h-4 w-4 text-blue-500" />
              <span>{trip.destinationCount || 0} stops</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => navigate(`/trip/${trip._id}/itinerary`)}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
        >
          View <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* User Details Banner Section (Screen 7 format: Image on left, Edit options on right) */}
        <div className="bg-white rounded-3xl shadow-md p-6 sm:p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Left Column: Image of the User */}
            <div className="md:col-span-1 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-40 h-40 mx-auto mb-4 group cursor-pointer"
                title="Click to choose a picture from your computer"
              >
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt={formData.name}
                    className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-lg group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-6xl font-black shadow-lg group-hover:opacity-80 transition-opacity border-4 border-blue-500">
                    {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <HiCamera className="h-10 w-10 text-white" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-xs"
              >
                <HiCamera className="h-4 w-4" /> Change Profile Picture
              </button>
              <h2 className="text-xl font-bold text-gray-900 mt-3">{formData.name}</h2>
              <p className="text-gray-500 text-xs">{formData.email}</p>
            </div>

            {/* Right Column: User Details with appropriate option to edit those information... */}
            <div className="md:col-span-2 space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">User Details & Profile Options</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HiUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HiMail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900"
                      placeholder="Your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="languagePref" className="block text-xs font-bold text-gray-700 mb-1">
                    Language Preference
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HiGlobe className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="languagePref"
                      name="languagePref"
                      value={formData.languagePref}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900 bg-white"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg text-sm"
                  >
                    {isLoading ? (
                      <span>Saving Changes...</span>
                    ) : (
                      <>
                        <HiSave className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Preplanned Trips Section (Screen 7 format) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>✈️</span> Preplanned Trips
            </h2>
            <Link to="/my-trips" className="text-xs font-bold text-blue-600 hover:underline">
              View All ({preplannedTrips.length})
            </Link>
          </div>

          {isTripsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-64 p-4 animate-pulse"></div>
              ))}
            </div>
          ) : preplannedTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {preplannedTrips.map(renderTripCard)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-gray-500 text-sm mb-4">No upcoming or preplanned trips currently scheduled.</p>
              <Link to="/create-trip" className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs">
                Plan a New Trip
              </Link>
            </div>
          )}
        </section>

        {/* Previous Trips Section (Screen 7 format) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>🏁</span> Previous Trips
            </h2>
            <Link to="/my-trips" className="text-xs font-bold text-blue-600 hover:underline">
              View All ({previousTrips.length})
            </Link>
          </div>

          {isTripsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-64 p-4 animate-pulse"></div>
              ))}
            </div>
          ) : previousTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousTrips.map(renderTripCard)}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <p className="text-gray-500 text-sm">No completed or past trips logged yet.</p>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl shadow-xs p-6 border border-red-200">
          <h3 className="text-base font-bold text-red-700 mb-2 flex items-center gap-2">
            <HiExclamationCircle className="h-5 w-5" />
            Danger Zone
          </h3>
          <p className="text-xs text-red-600 mb-4">
            Deleting your account will remove all your saved trips and custom itineraries.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 text-xs"
          >
            <HiTrash className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;