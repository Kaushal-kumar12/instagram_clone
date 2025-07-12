import Signup from "./components/Signup"
import Login from "./components/Login"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import MainLayot from "./components/MainLayout"
import Home from "./components/Home"
import Profile from "./components/Profile"
import EditProfile from "./components/EditProfile"
import ChatPage from "./components/ChatPage"
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { setSocket } from "./redux/socketSlice"
import { setOnlineUsers } from "./redux/chatSlice"
import { setLikeNotification } from "./redux/rtnSlice"
import ProtectedRoute from "./components/ProtectedRoute"
import FollowersList from "./components/FollowersList"
import FollowingList from "./components/FollowingList"



const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><MainLayot /></ProtectedRoute>,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/profile/:id",
        element: <Profile />,
      },
      {
        path: "/account/edit",
        element: <EditProfile />,
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "/profile/:id/followers",      // <--- add this route
        element: <FollowersList />,
      },
      {
        path: "/profile/:id/following",      // <--- add this route
        element: <FollowingList />,
      },
    ]
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const {socket} = useSelector(store=>store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if(user) {
      const socketio = io(`${import.meta.env.VITE_BACKEND_URL}`, {
        query: {
          userId: user?._id
        },
        transports:['websocket']
      });
      dispatch(setSocket(socketio));

      //listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if(socket) {
      socket?.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch])
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
  
}

export default App;
