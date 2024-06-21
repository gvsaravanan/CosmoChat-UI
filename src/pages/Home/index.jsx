// Import necessary components and hooks from React and Material-UI
import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import {
  Button, 
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import Images from "../../constants/images"; 
import AllStyles from "../../styles/home";
import api from "../../api/session"; 
import ChatHistory from "../../components/ChatHistory"; 
import { useNavigate } from "react-router"; 
import useMediaQuery from "@mui/material/useMediaQuery"; 
import WidthError from "../../components/WidthError"; 


function Home() {
  const [sessions, setSessions] = useState([]);
  const navigator = useNavigate();
  const matches = useMediaQuery("(min-width:600px)");
  const [loading, setLoading] = useState(true);
  const reXIntro = [
    "Hello User, I am ReX. 😁",
    "What aspect of your career would you like guidance on?",
  ];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  useEffect(() => {
    const controller = new AbortController();
    const fetchSessions = async () => {
      try {
        // Fetching sessions from the API
        const response = await api.get("/sessions", {
          signal: controller.signal, // Pass the abort signal to the fetch request
        });

        console.log("response = ", response);

        // Updating the sessions state with fetched data
        setSessions(response.data.reverse());
        // Setting loading state to false after data is fetched
        setLoading(false);
      } catch (err) {
        console.log(err);
        // Error handling
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          console.log(err);
        }
      }
      // Cleanup function to abort the fetch request
      return () => controller?.abort();
    };
    // Calling fetchSessions to fetch the sessions data
    fetchSessions();
  }, []);

  // Function to handle submission of a new session
  const handleSubmit = async () => {
    // Generating a new session ID
    const id = sessions.length
      ? (parseInt(sessions[0].id) + 1).toString()
      : "1";
    // Getting the current date
    const date = new Date();
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    // Formatting the date in a readable format
    const formattedDate = months[month] + " " + day + ", " + year;
    // Initial chat data for the new session
    const chat = [{ ReX: reXIntro }];
    // Flag to indicate if the session has ended
    const isSessionEnded = false;

    // Creating a new session object
    const newSession = {
      id,
      date: formattedDate,
      chats: chat,
      isSessionEnded,
    };

    try {
      // Checking if there's a previous session to mark as ended
      if (parseInt(id) > 1) {
        const lastSessionid = (parseInt(id) - 1).toString();
        const activeSession = sessions.filter(
          (session) => session.id === lastSessionid
        );
        activeSession[0].isSessionEnded = true;
        // Updating the previous session's status to ended
        const res = await api.patch(
          `/sessions/${lastSessionid}`,
          activeSession[0]
        );
        setSessions(
          sessions.map((session) =>
            session.id === lastSessionid ? res.data : session
          )
        );
      }
      // Posting the new session to the server
      const response = await api.post("/sessions", newSession);
      // Updating the sessions state with the new session
      const allSessions = [...sessions, response.data];
      setSessions(allSessions);
      // Navigating to the new session's page
      navigator(`/sessions/${id}`);
    } catch (err) {
      // Error handling
      console.log(`Error: ${err.message}`);
    }
  };

  // Function to handle deletion of a session
  const handleDelete = async (id) => {
    try {
      // Sending a delete request to the server
      await api.delete(`/sessions/${id}`);
      // Updating the sessions state to remove the deleted session
      setSessions(sessions.filter((session) => session.id !== id));
    } catch (err) {
      // Error handling
      console.log(`Error: ${err.message}`);
    }
  };

  // Returning the JSX for the Home component
  return (
    // If the screen size is more than 600px then displaying the message to set the width to 600px else displaying the content.
    matches ? (
      <WidthError />
    ) : (
      // Grid container for the main layout
      <Grid container /* style={{ display: matches ? "none" : "block" }} */>
        {loading ? (
          // If loading is true, display a loading spinner
          <CircularProgress style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        ) : sessions.length === 0 ? (
          // If there are no sessions, display the welcome message and start chat button
          <Grid item {...AllStyles.homeBody}>
            <Grid>
              <img src={Images.HomeRex} alt="homeRex" />
            </Grid>
            <Grid className="greetings">
              <Typography {...AllStyles.greetings}>
                Welcome, User! 👋
              </Typography>
            </Grid>
            <Grid>
              <Typography {...AllStyles.message}>
                Start a conversation with ReX right now!
              </Typography>
            </Grid>
            <Grid>
              <Button {...AllStyles.startChatButton} onClick={handleSubmit}>
                <Typography {...AllStyles.startChatButtonText}>
                  Start Chat With ReX
                </Typography>
              </Button>
            </Grid>
          </Grid>
        ) : (
          // If there are sessions, display the active and ended chats
          // For Active chats.
          <Grid item >
            <Grid {...AllStyles.ChatsTitle}>
              <Grid {...AllStyles.ChatsTitleText}>Active Chats</Grid>
            </Grid>
            <Grid>
              {sessions.length
                ? sessions.map((session) =>
                    !session.isSessionEnded ? (
                      <ChatHistory
                        key={session.id}
                        id={session.id}
                        date={session.date}
                        lastChatText={
                          session?.chats?.length > 0
                            ? session.chats[session.chats.length - 1].ReX.slice(0,100)
                            : ""
                        }
                        sessionEnded={session?.isSessionEnded}
                        handleDelete={null}
                      />
                    ) : null
                  )
                : null}
            </Grid>
            {/* For ended chats */}
            <Grid {...AllStyles.ChatsTitle}>
              <Grid {...AllStyles.ChatsTitleText}>Ended Chats </Grid>
              <Grid>
                <Link {...AllStyles.seeAllLink} to="/endedChats">
                  See All
                </Link>
              </Grid>
            </Grid>
            <Grid>
              {sessions.map((session, i) =>
                session.isSessionEnded && i < 4 ? (
                  <ChatHistory
                    key={session.id}
                    id={session.id}
                    date={session.date}
                    session
                    lastChatText={
                      session?.chats?.length > 0
                              ? session?.chats[session.chats.length - 1].ReX.slice(0,100)
                              : ""
                    }
                    sessionEnded={session.isSessionEnded}
                    handleDelete={() => handleDelete(session.id)}
                  />
                ) : null
              )}
            </Grid>
            {/* For start Chat button */}
            <Grid {...AllStyles.startAnotherChatButtonGrid}>
              <Button {...AllStyles.startChatButton} onClick={handleSubmit}>
                <Typography {...AllStyles.startChatButtonText}>
                  Start Another Chat With ReX
                </Typography>
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    )
  );
}

// Exporting the Home component as the default export
export default Home;