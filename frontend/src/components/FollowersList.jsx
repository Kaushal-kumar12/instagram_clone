import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { updateFollowing } from '@/redux/authSlice'; // update redux following list

const FollowersList = () => {
  const { id } = useParams(); // profile user id
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [followers, setFollowers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  // Setup map for quick check if logged-in user follows someone
  useEffect(() => {
    if (user?.following) {
      const map = {};
      user.following.forEach(followingId => {
        map[followingId] = true;
      });
      setFollowingMap(map);
    }
  }, [user]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/${id}/followers`, { withCredentials: true });
        setFollowers(res.data.followers || []);
      } catch (err) {
        console.error("Failed to load followers:", err);
      }
    };
    fetchFollowers();
  }, [id]);

  // Follow/Unfollow toggle handler
  const handleFollowToggle = async (targetUserId) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/user/followorunfollow/${targetUserId}`, {}, { withCredentials: true });

      // Update local map to toggle follow state immediately
      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));

      // Update redux store's following list to keep global state in sync
      let newFollowing;
      if (followingMap[targetUserId]) {
        // Unfollow - remove from following
        newFollowing = user.following.filter(id => id !== targetUserId);
      } else {
        // Follow - add to following
        newFollowing = [...user.following, targetUserId];
      }
      dispatch(updateFollowing({ following: newFollowing }));

    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Followers</h2>
      {followers.length === 0 && <p>No followers found.</p>}
      {followers.map(follower => {
        const isFollowing = followingMap[follower._id];
        const isSelf = follower._id === user._id;

        return (
          <div key={follower._id} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${follower._id}`)}>
              <Avatar>
                <AvatarImage src={follower.profilePicture} alt={follower.username} />
                <AvatarFallback>{follower.username[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span>{follower.username}</span>
            </div>
            {!isSelf && (
              <button
                onClick={() => handleFollowToggle(follower._id)}
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  isFollowing ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FollowersList;
