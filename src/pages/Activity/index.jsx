import React, { useEffect, useState } from "react"; 
import api from "../../api/session"; 
import {
  Grid, 
  CircularProgress, 
  Typography, 
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart"; 
import ActivityStyles from "../../styles/activity"; 
import ActivityChatHistory from "../../components/ActivityChatHistory";
import useMediaQuery from "@mui/material/useMediaQuery"; 
import AllStyles from "../../styles/home";
import WidthError from "../../components/WidthError";


const Activity = () => {
  const [loading, setLoading] = useState(true);
  const [sessionDates, setSessionDates] = useState([]);
  const [sessionChatLengths, setSessionChatLengths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const matches = useMediaQuery("(min-width:600px)");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get("/sessions");
        setSessions(response.data.reverse());
        setSessionDates([
          ...Array.from(response.data, (data) => {
            console.log("data.date = ", data.date);
            return data.date.split(",")[0]
          }),
        ]);
        setSessionChatLengths([
          ...Array.from(response.data, (data) => data.chats.length),
        ]);
        // Setting loading to false after data is fetched
        setLoading(false);
      } catch (err) {
        // Error handling
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else {
          console.log(err);
        }
      }
    };
    // Calling fetchSessions to fetch the sessions data
    fetchSessions();
  }, []);

  // Returning the JSX for the Activity component
  return (
    // If the screen size is more than 600px then displaying the message to set the width to 600px else displaying the content.
    matches ? (
      <WidthError />
    ) : (
      // Grid container for the main layout
      <Grid container {...ActivityStyles.activityBody}>
        {/* Grid for displaying the title */}
        <Grid container item {...ActivityStyles.titleOutline}>
          <Typography {...ActivityStyles.title}>Your Statistics</Typography>
        </Grid>
        {/* Grid for displaying the description */}
        <Grid container item>
          <Typography {...ActivityStyles.description}>
            Graph of the conversation you had with ReX.
          </Typography>
        </Grid>
        {/* Grid for displaying the bar chart */}
        <Grid container item>
          {loading ? (
            <CircularProgress /> // Display loading indicator while data is being fetched
          ) : (
            <BarChart
              xAxis={[{ scaleType: "band", data: [...sessionDates] }]} // X-axis data for the bar chart
              series={[{ data: [...sessionChatLengths] }]} // Data series for the bar chart
              width={500}
              height={300}
            />
          )}
          {/* {console.log("sessions = ", sessions)}
          {console.log("sessionChatLengths = ", sessionChatLengths)}
          {console.log("sessionDates = ", sessionDates)} */}
        </Grid>
        {/* Grid for displaying individual chat history */}
        <Grid>
          {loading ? (
            <CircularProgress {...AllStyles.circularProgressStyle}/> // Display loading indicator while data is being fetched
          ) : (
            <>
              <Typography {...ActivityStyles.description}>
                Active Chat:
              </Typography>
              {sessions.map((session, i) => {
                return !session.isSessionEnded ? (
                  <ActivityChatHistory 
                    key={session.id} // Unique key for each ChatHistory component
                    date={session.date} // Session date
                    chatsLength={session.chats.length} // Number of chats in the session
                  />
                ) : null
              })}
              <Typography {...ActivityStyles.description}>
                Ended Chats:
              </Typography>
              {sessions.map((session, i) =>
                session.isSessionEnded && i < 4 ? ( // Display only ended sessions and limit to 4
                  <ActivityChatHistory
                    key={session.id} // Unique key for each ChatHistory component
                    date={session.date} // Session date
                    chatsLength={session.chats.length} // Number of chats in the session
                  />
                ) : null
              )}
            </>
          )}
        </Grid>
      </Grid>
    )
  );
};

// Exporting the Activity component as the default export
export default Activity;