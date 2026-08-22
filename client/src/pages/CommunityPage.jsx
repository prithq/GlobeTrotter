import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { 
  HiArrowLeft, 
  HiSearch, 
  HiPlus, 
  HiHeart, 
  HiOutlineHeart, 
  HiShare, 
  HiStar, 
  HiLocationMarker, 
  HiX,
  HiBookOpen,
  HiPencilAlt,
  HiUser
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const CommunityPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state matching Screen 10 mockup
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupBy, setSelectedGroupBy] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedSortBy, setSelectedSortBy] = useState('newest');

  // New Experience Note Modal state
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    tripName: '',
    destination: '',
    experience: '',
    rating: 5,
    imageUrl: ''
  });

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/community');
      setPosts(response.data?.data || []);
    } catch (err) {
      console.warn('Community feed load error:', err.message);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axiosInstance.post(`/community/${postId}/like`);
      if (response.data) {
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const isLiked = p.likedBy?.includes(user?._id);
            return {
              ...p,
              likesCount: isLiked ? Math.max(0, (p.likesCount || 1) - 1) : (p.likesCount || 0) + 1,
              likedBy: isLiked ? p.likedBy.filter(id => id !== user?._id) : [...(p.likedBy || []), user?._id]
            };
          }
          return p;
        }));
      }
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleSharePost = (post) => {
    const shareText = `Check out "${post.tripName}" travel note by ${post.userName} in ${post.destination} on GlobeTrotter!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast.success('Travel note link copied to clipboard!');
    }
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.tripName || !newPost.destination || !newPost.experience) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newPost,
        userName: user?.name || 'Traveler',
        userAvatar: user?.photoUrl || ''
      };
      const response = await axiosInstance.post('/community', payload);
      if (response.data) {
        toast.success('Travel note published successfully! ✈️');
        setPosts([response.data, ...posts]);
        setShowNewPostModal(false);
        setNewPost({ tripName: '', destination: '', experience: '', rating: 5, imageUrl: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post note');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search Logic matching Screen 10
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.tripName?.toLowerCase().includes(q) ||
        p.destination?.toLowerCase().includes(q) ||
        p.experience?.toLowerCase().includes(q) ||
        p.userName?.toLowerCase().includes(q)
      );
    }

    if (selectedFilter === 'high_rating') {
      result = result.filter(p => (p.rating || 5) >= 5);
    }

    if (selectedSortBy === 'popular') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (selectedSortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default: newest
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [posts, searchQuery, selectedFilter, selectedSortBy]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              <span>🌍</span> Community
            </h1>
            <p className="text-gray-600 text-sm mt-1 max-w-2xl">
              Read real travel notes published by actual GlobeTrotter travelers. Share your journey notes and experiences with fellow users!
            </p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
          >
            <HiPencilAlt className="h-5 w-5" />
            Share Travel Note
          </button>
        </div>

        {/* Search Bar + Group By + Filter + Sort By (Screen 10 Format) */}
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
                placeholder="Search bar ...... (search travel notes, destinations, or author names)"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-900 placeholder-gray-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedGroupBy}
                onChange={(e) => setSelectedGroupBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Group by: All Notes</option>
                <option value="popular">Group by: Most Popular</option>
              </select>

              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Filter: All Ratings</option>
                <option value="high_rating">Filter: 5-Star Notes Only</option>
              </select>

              <select
                value={selectedSortBy}
                onChange={(e) => setSelectedSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="popular">Sort by: Most Liked</option>
                <option value="rating">Sort by: Highest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real User Travel Notes Feed */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 animate-pulse h-48"></div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No community travel notes posted yet</h3>
            <p className="text-gray-600 text-sm mb-6">Be the first traveler to post a travel note with your name for the community!</p>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md"
            >
              <HiPlus className="h-4 w-4 mr-2" /> Write a Travel Note
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isLiked = post.likedBy?.includes(user?._id);
              return (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-l-blue-600 border border-gray-100 space-y-4 relative"
                >
                  {/* Note Author Header with Prominent User Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {post.userAvatar ? (
                        <img
                          src={post.userAvatar}
                          alt={post.userName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
                          {post.userName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-gray-900 text-base">{post.userName}</h3>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Travel Note
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <HiLocationMarker className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-semibold text-gray-700">{post.destination}</span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                      <HiStar className="h-4 w-4 text-amber-500" />
                      <span>{post.rating || 5} / 5</span>
                    </div>
                  </div>

                  {/* Note Title & Experience Content */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
                      <HiBookOpen className="h-5 w-5 text-blue-600" /> {post.tripName}
                    </h4>
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                      "{post.experience}"
                    </p>
                  </div>

                  {/* Attachment Image */}
                  {post.imageUrl && (
                    <div className="h-60 sm:h-72 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                      <img
                        src={post.imageUrl}
                        alt={post.tripName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Actions & Likes */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500">
                    <button
                      onClick={() => handleLikePost(post._id)}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-colors ${
                        isLiked 
                          ? 'bg-rose-50 text-rose-600 font-bold' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isLiked ? (
                        <HiHeart className="h-4 w-4 text-rose-600" />
                      ) : (
                        <HiOutlineHeart className="h-4 w-4 text-gray-500" />
                      )}
                      <span>{post.likesCount || 0} Likes</span>
                    </button>

                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors font-bold"
                    >
                      <HiShare className="h-4 w-4" />
                      <span>Share Note</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share New Travel Note Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <HiPencilAlt className="h-6 w-6 text-blue-600" /> Share Travel Note
              </h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            {/* Displaying Current Author Name */}
            <div className="bg-blue-50/50 p-3 rounded-xl flex items-center gap-3 border border-blue-100">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-medium">Posting as:</p>
                <p className="text-sm font-extrabold text-gray-900">{user?.name || 'Traveler'}</p>
              </div>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Trip / Experience Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPost.tripName}
                  onChange={(e) => setNewPost({ ...newPost, tripName: e.target.value })}
                  placeholder="e.g., Manali Solang Snow Trail & Cafe Notes"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Destination / City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPost.destination}
                  onChange={(e) => setNewPost({ ...newPost, destination: e.target.value })}
                  placeholder="e.g., Manali, Himachal Pradesh"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Travel Note Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newPost.experience}
                  onChange={(e) => setNewPost({ ...newPost, experience: e.target.value })}
                  placeholder="Write your travel experience note for the community..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  placeholder="e.g., https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
