import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI } from '../api/trips';
import { 
  HiArrowLeft, 
  HiCash, 
  HiChartPie, 
  HiTrendingUp,
  HiTrendingDown,
  HiExclamationCircle,
  HiCheckCircle
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const BudgetPage = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const [budget, setBudget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIEstimate, setShowAIEstimate] = useState(false);

  useEffect(() => {
    loadBudget();
  }, [tripId]);

  const loadBudget = async () => {
    setIsLoading(true);
    try {
      const response = await tripAPI.getBudget(tripId);
      setBudget(response.data);
    } catch (error) {
      toast.error('Failed to load budget');
      // Mock data
      setBudget({
        tripId: tripId,
        tripName: 'European Summer Adventure',
        totalDays: 15,
        summary: {
          activities: 450,
          transport: 1200,
          stay: 2400,
          meals: 600,
          misc: 300,
          grandTotal: 4950,
          averageDailyCost: 330
        },
        stopBreakdown: [
          { stopId: '1', cityName: 'Paris', activityTotal: 1200, days: 5 },
          { stopId: '2', cityName: 'Rome', activityTotal: 1800, days: 6 },
          { stopId: '3', cityName: 'Barcelona', activityTotal: 1500, days: 4 }
        ],
        perDayBreakdown: [
          { date: '2026-06-15', cost: 280 },
          { date: '2026-06-16', cost: 350 },
          { date: '2026-06-17', cost: 310 },
          { date: '2026-06-18', cost: 290 },
          { date: '2026-06-19', cost: 420 }
        ],
        overbudgetDays: [
          { date: '2026-06-19', cost: 420 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIEstimate = async () => {
    setShowAIEstimate(true);
    try {
      const response = await tripAPI.getBudgetEstimate(tripId);
      // Merge AI estimate with budget data
      setBudget(prev => ({
        ...prev,
        aiEstimate: response.data.aiEstimate
      }));
      toast.success('AI budget estimate loaded!');
    } catch (error) {
      toast.error('Failed to load AI estimate');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Budget</h1>
            <p className="text-gray-600 mt-1">{budget?.tripName}</p>
          </div>
          <button
            onClick={loadAIEstimate}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors hover:from-purple-600 hover:to-blue-600 flex items-center gap-2"
          >
            <HiTrendingUp className="h-5 w-5" />
            Estimate Budget
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(budget?.summary?.grandTotal)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Average Daily Cost</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(budget?.summary?.averageDailyCost)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Total Days</p>
            <p className="text-2xl font-bold text-purple-600">{budget?.totalDays} days</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Overbudget Days</p>
            <p className="text-2xl font-bold text-red-600">{budget?.overbudgetDays?.length || 0}</p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h2>
            <div className="space-y-3">
              {budget?.summary && Object.entries(budget.summary).map(([key, value]) => {
                if (key === 'grandTotal' || key === 'averageDailyCost') return null;
                const percentage = ((value / budget.summary.grandTotal) * 100).toFixed(1);
                const colors = {
                  activities: 'bg-blue-500',
                  transport: 'bg-green-500',
                  stay: 'bg-purple-500',
                  meals: 'bg-orange-500',
                  misc: 'bg-gray-500'
                };
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{key}</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(value)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${colors[key] || 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Stop Breakdown</h2>
            <div className="space-y-3">
              {budget?.stopBreakdown?.map((stop) => (
                <div key={stop.stopId} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{stop.cityName}</span>
                    <span className="text-sm text-gray-600">{stop.days} days</span>
                  </div>
                  <p className="text-sm text-blue-600">{formatCurrency(stop.activityTotal)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Cost Breakdown</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {budget?.perDayBreakdown?.map((day) => {
                const isOverbudget = budget.overbudgetDays?.some(d => d.date === day.date);
                return (
                  <div key={day.date} className="flex-shrink-0 w-24 text-center">
                    <div className={`p-3 rounded-lg ${isOverbudget ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-500">{formatDate(day.date)}</p>
                      <p className={`font-bold ${isOverbudget ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatCurrency(day.cost)}
                      </p>
                      {isOverbudget && (
                        <HiExclamationCircle className="h-4 w-4 text-red-500 mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Estimate */}
        {showAIEstimate && budget?.aiEstimate && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <HiTrendingUp className="h-6 w-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">AI-Powered Budget Estimate</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Transport</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(budget.aiEstimate.summary?.total_transportation_usd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Accommodation</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(budget.aiEstimate.summary?.total_accommodation_usd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Food</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(budget.aiEstimate.summary?.total_food_usd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Activities</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(budget.aiEstimate.summary?.total_activities_usd)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-600">Total Estimated Cost</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(budget.aiEstimate.summary?.grand_total_usd)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;