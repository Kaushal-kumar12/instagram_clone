import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null,
        bookmarks: [],
    },
    reducers: {
        //actions
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        updateBookmarks: (state, action) => {
            state.user.bookmarks = action.payload.bookmarks;
        },
        updateFollowing: (state, action) => {
            state.user = {
                ...state.user,
                following: action.payload.following
            };
        },
        updateUserProfileFollowers: (state, action) => {
            state.userProfile.followers = action.payload.followers;
        }
    }
});
export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setSelectedUser,
    updateFollowing,
    updateUserProfileFollowers,
    updateBookmarks
} = authSlice.actions;
export default authSlice.reducer;