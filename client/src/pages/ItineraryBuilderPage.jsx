import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  HiPencil,
  HiHome,
  HiOfficeBuilding,
  HiPhotograph
} from 'react-icons/hi';
import { 
  FaPlane, 
  FaTrain, 
  FaCar, 
  FaBus, 
  FaHotel, 
  FaUtensils,
  FaCamera,
  FaMapMarkedAlt,
  FaBeer
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ItineraryBuilderPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState([
    {
      id: 1,
      type: 'transport',
      title: 'Flight to Paris',
      description: 'Delta Airlines - Flight DL123',
      startDate: '2026-06-15',
      endDate: '2026-06-15',
      budget: 850,
      icon: 'plane',
      details: {
        airline: 'Delta Airlines',
        flightNumber: 'DL123',
        departure: 'New York (JFK)',
        arrival: 'Paris (CDG)',
        departureTime: '22:00',
        arrivalTime: '11:30',
        seat: '12A'
      },
      isExpanded: true,
      isEditing: false
    },
    {
      id: 2,
      type: 'hotel',
      title: 'Hotel Continental Paris',
      description: 'Luxury stay in the heart of Paris',
      startDate: '2026-06-15',
      endDate: '2026-06-20',
      budget: 1200,
      icon: 'hotel',
      details: {
        hotelName: 'Hotel Continental',
        address: '3 Rue de Castiglione, 75001 Paris',
        checkIn: '15:00',
        checkOut: '11:00',
        roomType: 'Deluxe Suite',
        amenities: ['WiFi', 'Breakfast', 'Pool', 'Spa']
      },
      isExpanded: false,
      isEditing: false
    },
    {
      id: 3,
      type: 'activity',
      title: 'Eiffel Tower Visit',
      description: 'Guided tour of the Eiffel Tower',
      startDate: '2026-06-16',
      endDate: '2026-06-16',
      budget: 75,
      icon: 'camera',
      details: {
        activityName: 'Eiffel Tower Guided Tour',
        location: 'Eiffel Tower, Paris',
        duration: '2 hours',
        time: '10:00',
        guide: 'Marie Dupont',
        includes: ['Skip the line', 'Top floor access', 'Guided commentary']
      },
      isExpanded: false,
      isEditing: false
    }
  ]);

  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({
    type: 'transport',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0
  });

  const sectionTypes = [
    { value: 'transport', label: '🚗 Transport', icon: 'plane' },
    { value: 'hotel', label: '🏨 Hotel', icon: 'hotel' },
    { value: 'activity', label: '🎯 Activity', icon: 'camera' },
    { value: 'dining', label: '🍽️ Dining', icon: 'utensils' },
    { value: 'sightseeing', label: '📸 Sightseeing', icon: 'camera' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      plane: <FaPlane className="h-5 w-5" />,
      train: <FaTrain className="h-5 w-5" />,
      car: <FaCar className="h-5 w-5" />,
      bus: <FaBus className="h-5 w-5" />,
      hotel: <FaHotel className="h-5 w-5" />,
      home: <HiHome className="h-5 w-5" />,
      building: <HiOfficeBuilding className="h-5 w-5" />,
      utensils: <FaUtensils className="h-5 w-5" />,
      camera: <FaCamera className="h-5 w-5" />,
      beer: <FaBeer className="h-5 w-5" />
    };
    return icons[iconName] || <FaMapMarkedAlt className="h-5 w-5" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      transport: 'bg-blue-100 text-blue-600 border-blue-200',
      hotel: 'bg-purple-100 text-purple-600 border-purple-200',
      activity: 'bg-green-100 text-green-600 border-green-200',
      dining: 'bg-orange-100 text-orange-600 border-orange-200',
      sightseeing: 'bg-pink-100 text-pink-600 border-pink-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      transport: 'bg-blue-600',
      hotel: 'bg-purple-600',
      activity: 'bg-green-600',
      dining: 'bg-orange-600',
      sightseeing: 'bg-pink-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  const toggleExpand = (id) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const deleteSection = (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter(section => section.id !== id));
      toast.success('Section deleted successfully');
    }
  };

  const handleAddSection = () => {
    if (!newSection.title || !newSection.startDate || !newSection.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const section = {
      id: Date.now(),
      type: newSection.type,
      title: newSection.title,
      description: newSection.description || `${newSection.type} experience`,
      startDate: newSection.startDate,
      endDate: newSection.endDate,
      budget: newSection.budget || 0,
      icon: sectionTypes.find(t => t.value === newSection.type)?.icon || 'camera',
      details: {},
      isExpanded: false,
      isEditing: false
    };

    setSections([...sections, section]);
    setNewSection({
      type: 'transport',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      budget: 0
    });
    setShowAddSection(false);
    toast.success('Section added successfully');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotalBudget = () => {
    return sections.reduce((total, section) => total + section.budget, 0);
  };

  const handleContinue = () => {
    navigate(`/trip/${tripId}/itinerary-view`);
  };

  const today = new Date().toISOString().split('T')[0];

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
            <h1 className="text-3xl font-bold text-gray-900">Build Itinerary</h1>
            <p className="text-gray-600 mt-1">Plan your trip day by day</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(calculateTotalBudget())}</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              {/* Section Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(section.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${getTypeColor(section.type)} border-2`}>
                      {getIcon(section.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getTypeBadgeColor(section.type)}`}>
                          {section.type.toUpperCase()}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {section.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{section.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <HiCalendar className="h-4 w-4" />
                          <span>{formatDate(section.startDate)} - {formatDate(section.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-medium text-blue-600">
                          <HiCash className="h-4 w-4" />
                          <span>{formatCurrency(section.budget)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      {section.isExpanded ? (
                        <HiChevronUp className="h-5 w-5" />
                      ) : (
                        <HiChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Details - Expanded */}
              {section.isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(section.details || {}).map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-gray-800 mt-1">
                          {typeof value === 'string' ? value : 
                           Array.isArray(value) ? value.join(', ') : 
                           String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Section Button */}
        {!showAddSection ? (
          <button
            onClick={() => setShowAddSection(true)}
            className="mt-6 w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 text-gray-600 hover:text-blue-600 hover:border-blue-400 transition-all group"
          >
            <div className="flex items-center justify-center gap-2">
              <HiPlus className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Add Another Section</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Add transport, hotel, activity, dining, or sightseeing</p>
          </button>
        ) : (
          <div className="mt-6 bg-white rounded-2xl shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Add New Section</h3>
              <button
                onClick={() => setShowAddSection(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Section Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sectionTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g., Flight to Paris"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newSection.startDate}
                  onChange={(e) => setNewSection({ ...newSection, startDate: e.target.value })}
                  min={today}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newSection.endDate}
                  onChange={(e) => setNewSection({ ...newSection, endDate: e.target.value })}
                  min={newSection.startDate || today}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={newSection.description}
                  onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                  placeholder="Brief description of this section"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Budget (USD)
                </label>
                <input
                  type="number"
                  value={newSection.budget}
                  onChange={(e) => setNewSection({ ...newSection, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddSection}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Section
              </button>
              <button
                onClick={() => setShowAddSection(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Save as Draft
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            Continue to Itinerary View
            <HiChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryBuilderPage;