import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js"; // if you exported as named

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different Email",
                success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(201).json({
            message: "Account Created Successfully.",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        //populate each post if in the post array
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post && post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        );

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts.filter(Boolean),
        };

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId)
            .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })
            .populate('bookmarks');
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated',
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers || suggestedUsers.length === 0) {
            return res.status(400).json({
                message: 'Currently do not have any users',
                success: false
            });
        }
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const followOrUnfollow = async (req, res) => {
    try {
        const followKarneWala = req.id; // logged in user id
        const jiskoFollowKarunga = req.params.id; // target user id

        if (followKarneWala === jiskoFollowKarunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKarneWala);
        const targetUser = await User.findById(jiskoFollowKarunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }

        const isFollowing = user.following.includes(jiskoFollowKarunga);

        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.updateOne({ _id: followKarneWala }, { $pull: { following: jiskoFollowKarunga } }),
                User.updateOne({ _id: jiskoFollowKarunga }, { $pull: { followers: followKarneWala } }),
            ]);
            const updatedUser = await User.findById(followKarneWala).select("following");
            const updatedProfile = await User.findById(jiskoFollowKarunga).select("followers");

            return res.status(200).json({
                message: 'Unfollowed successfully',
                success: true,
                updatedUser,
                updatedProfile
            });
        } else {
            // Follow logic
            await Promise.all([
                User.updateOne({ _id: followKarneWala }, { $push: { following: jiskoFollowKarunga } }),
                User.updateOne({ _id: jiskoFollowKarunga }, { $push: { followers: followKarneWala } }),
            ]);
            const updatedUser = await User.findById(followKarneWala).select("following");
            const updatedProfile = await User.findById(jiskoFollowKarunga).select("followers");

            return res.status(200).json({
                message: 'Followed successfully',
                success: true,
                updatedUser,
                updatedProfile
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("followers", "-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({ success: true, followers: user.followers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("following", "-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({ success: true, following: user.following });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};
