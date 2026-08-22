import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import { 
  HiArrowLeft, 
  HiPlus, 
  HiCalendar, 
  HiLocationMarker, 
  HiTrash, 
  HiShare, 
  HiGlobe, 
  HiLockClosed,
  HiChevronLeft,
  HiChevronRight,
  HiSearch,
  HiCash,
  HiClock
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const MyTripsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter controls matching Screen 6 wireframe
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('status');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedSortBy, setSelectedSortBy] = useState('newest');

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const response = await tripAPI.getTrips(1, 100);
      setTrips(response.data.data || []);
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
      loadTrips();
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
      loadTrips();
    } catch (error) {
      toast.error('Failed to update trip visibility');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter & Search Logic
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name?.toLowerCase().includes(q) || 
        t.description?.toLowerCase().includes(q)
      );
    }

    // Filter dropdown (Public vs Private)
    if (selectedFilter === 'public') {
      result = result.filter(t => t.isPublic);
    } else if (selectedFilter === 'private') {
      result = result.filter(t => !t.isPublic);
    }

    // Sorting
    if (selectedSortBy === 'oldest') {
      result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    } else if (selectedSortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
    }

    return result;
  }, [trips, searchQuery, selectedFilter, selectedSortBy]);

  // Group trips into Ongoing, Up-coming, and Completed categories (Screen 6 format)
  const categorizedTrips = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const ongoing = [];
    const upcoming = [];
    const completed = [];

    filteredTrips.forEach(t => {
      const start = t.startDate ? t.startDate.slice(0, 10) : '';
      const end = t.endDate ? t.endDate.slice(0, 10) : '';

      if (start <= today && end >= today) {
        ongoing.push(t);
      } else if (start > today) {
        upcoming.push(t);
      } else {
        completed.push(t);
      }
    });

    return { ongoing, upcoming, completed };
  }, [filteredTrips]);

  const renderTripCard = (trip) => (
    <div
      key={trip._id}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-gray-100"
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

        {/* Short Overview of the Trip (Screen 6 format) */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-xl mb-1 truncate group-hover:text-blue-600 transition-colors">
            {trip.name}
          </h3>
          {trip.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trip.description}</p>
          )}

          <div className="space-y-2 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-2">
              <HiCalendar className="h-4 w-4 text-blue-500" />
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiLocationMarker className="h-4 w-4 text-blue-500" />
                <span>{trip.destinationCount || 0} stops</span>
              </div>
              {trip.targetBudget > 0 && (
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                  Target: ${trip.targetBudget}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/trip/${trip._id}/build`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Build Itinerary
          </button>
          <button
            onClick={() => navigate(`/trip/${trip._id}/itinerary`)}
            className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-semibold transition-colors"
          >
            View
          </button>
        </div>

        <button
          onClick={() => handleDeleteTrip(trip._id, trip.name)}
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete Trip"
        >
          <HiTrash className="h-5 w-5" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header with Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">User Trip Listing</h1>
            <p className="text-gray-600 text-sm mt-1">Manage, search, and organize all your travel itineraries</p>
          </div>
          <Link
            to="/create-trip"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <HiPlus className="h-5 w-5" />
            Plan New Trip
          </Link>
        </div>

        {/* Search Bar + Filter Bar (Screen 6 Format: Search bar... [Group by] [Filter] [Sort by...]) */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bar ...... (type to filter trips by title or description)"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900 placeholder-gray-400"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedGroupBy}
                onChange={(e) => setSelectedGroupBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="status">Group by: Status (Ongoing / Upcoming / Completed)</option>
                <option value="all">Group by: All Trips</option>
              </select>

              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Filter: All Trips</option>
                <option value="public">Filter: Public Only</option>
                <option value="private">Filter: Private Only</option>
              </select>

              <select
                value={selectedSortBy}
                onChange={(e) => setSelectedSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="name">Sort by: Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trips Grouped into Ongoing, Up-coming, and Completed Sections (Screen 6 format) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matching trips found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search bar query or filter selection.</p>
            <Link
              to="/create-trip"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
            >
              <HiPlus className="h-5 w-5 mr-2" />
              Plan New Trip
            </Link>
          </div>
        ) : selectedGroupBy === 'status' ? (
          <div className="space-y-10">
            {/* Ongoing Section */}
            {categorizedTrips.ongoing.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-emerald-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  Ongoing Trips ({categorizedTrips.ongoing.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedTrips.ongoing.map(renderTripCard)}
                </div>
              </section>
            )}

            {/* Up-coming Section */}
            {categorizedTrips.upcoming.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-blue-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <span>✈️</span> Up-coming Trips ({categorizedTrips.upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedTrips.upcoming.map(renderTripCard)}
                </div>
              </section>
            )}

            {/* Completed Section */}
            {categorizedTrips.completed.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <span>🏁</span> Completed Trips ({categorizedTrips.completed.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorizedTrips.completed.map(renderTripCard)}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(renderTripCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTripsPage;
