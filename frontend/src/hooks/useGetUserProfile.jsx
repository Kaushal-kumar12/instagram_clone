import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`https://instagram-clone-te4g.onrender.com/api/v1/user/${userId}/profile`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchUserProfile();
    }, [userId, dispatch]);
};

export default useGetUserProfile;
