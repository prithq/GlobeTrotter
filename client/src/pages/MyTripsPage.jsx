import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiCalendar, 
  HiLocationMarker, 
  HiTrash, 
  HiPencil, 
  HiShare, 
  HiGlobe, 
  HiLockClosed,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const MyTripsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrips(pagination.page);
  }, [pagination.page]);

  const loadTrips = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await tripAPI.getTrips(page, pagination.limit);
      setTrips(response.data.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load your trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId, tripName) => {
    if (!window.confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await tripAPI.deleteTrip(tripId);
      toast.success('Trip deleted successfully');
      loadTrips(pagination.page);
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const handleTogglePublish = async (tripId, currentStatus) => {
    try {
      const response = await tripAPI.publishTrip(tripId, !currentStatus);
      const isPublic = response.data.isPublic;
      const slug = response.data.publicSlug;
      
      toast.success(isPublic ? 'Trip is now public! Share link created.' : 'Trip set to private.');
      if (isPublic && slug) {
        const shareUrl = `${window.location.origin}/shared/${slug}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
      loadTrips(pagination.page);
    } catch (error) {
      toast.error('Failed to update trip visibility');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-1">Manage and organize all your travel itineraries</p>
          </div>
          <Link
            to="/create-trip"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <HiPlus className="h-5 w-5" />
            Plan New Trip
          </Link>
        </div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              </div>
            ))}
          </div>
        ) : trips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image & Badges */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'}
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => handleTogglePublish(trip._id, trip.isPublic)}
                          title={trip.isPublic ? "Public trip (click to make private)" : "Private trip (click to publish)"}
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-md transition-colors ${
                            trip.isPublic 
                              ? 'bg-green-600/90 text-white' 
                              : 'bg-black/60 text-white'
                          }`}
                        >
                          {trip.isPublic ? (
                            <>
                              <HiGlobe className="h-3.5 w-3.5" /> Public
                            </>
                          ) : (
                            <>
                              <HiLockClosed className="h-3.5 w-3.5" /> Private
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-xl mb-1 truncate">
                        {trip.name}
                      </h3>
                      {trip.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trip.description}</p>
                      )}

                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <HiCalendar className="h-4 w-4 text-blue-500" />
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiLocationMarker className="h-4 w-4 text-blue-500" />
                          <span>{trip.destinationCount || 0} stops</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/trip/${trip._id}/build`)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        Builder
                      </button>
                      <button
                        onClick={() => navigate(`/trip/${trip._id}/itinerary`)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteTrip(trip._id, trip.name)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Trip"
                      >
                        <HiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <HiChevronLeft className="h-5 w-5" /> Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trips created yet</h3>
            <p className="text-gray-600 mb-6">Start planning your dream journey today!</p>
            <Link
              to="/create-trip"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors gap-2"
            >
              <HiPlus className="h-5 w-5" />
              Create Your First Trip
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage;
