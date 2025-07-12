import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { updateFollowing } from '@/redux/authSlice';

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers, user } = useSelector(store => store.auth);

  // 🔄 Track which suggested users the current user is following
  const [followingMap, setFollowingMap] = useState({});

  // 🔁 Set local follow map when component mounts or user.following changes
  useEffect(() => {
    if (user?.following) {
      const map = {};
      user.following.forEach(userId => {
        map[userId] = true;
      });
      setFollowingMap(map);
    }
  }, [user?.following]);

  // ✅ Follow or unfollow logic with instant button update
  const handleFollowToggle = async (targetUserId) => {
    // Optimistic UI update
    setFollowingMap(prev => ({
      ...prev,
      [targetUserId]: !prev[targetUserId],
    }));

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/followorunfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );

      const { updatedUser } = res.data;

      // ✅ Update Redux with new following list
      dispatch(updateFollowing({ following: updatedUser.following }));

      // ✅ Optional: Sync UI map to actual data (in case API fails or modifies more)
      const syncedMap = {};
      updatedUser.following.forEach(id => {
        syncedMap[id] = true;
      });
      setFollowingMap(syncedMap);

    } catch (error) {
      console.error("Follow/Unfollow failed", error);
      // Revert optimistic UI if request fails
      setFollowingMap(prev => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));
    }
  };

  return (
    <div className='my-10'>
      <div className='flex items-center justify-between text-sm'>
        <h1 className='font-semibold text-gray-600'>Suggested for you</h1>
        <span className='font-medium cursor-pointer'>See All</span>
      </div>

      {suggestedUsers.map((suggestedUser) => {
        const isFollowing = followingMap[suggestedUser._id];

        return (
          <div key={suggestedUser._id} className='flex items-center justify-between my-5'>
            <div className='flex items-center gap-2'>
              <Link to={`/profile/${suggestedUser._id}`}>
                <Avatar>
                  <AvatarImage src={suggestedUser?.profilePicture} alt="profile" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className='font-semibold text-sm'>
                  <Link to={`/profile/${suggestedUser._id}`}>{suggestedUser?.username}</Link>
                </h1>
                <span className='text-gray-600 text-sm'>{suggestedUser?.bio || 'bio here...'}</span>
              </div>
            </div>

            {user?._id !== suggestedUser._id && (
              <span
                className={`text-xs font-bold cursor-pointer ${
                  isFollowing ? 'text-red-500 hover:text-red-600' : 'text-[#3BADF8] hover:text-[#3495d6]'
                }`}
                onClick={() => handleFollowToggle(suggestedUser._id)}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
