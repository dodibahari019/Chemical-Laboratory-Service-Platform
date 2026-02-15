import express from "express";
import cors from "cors";
import databaseRoutes from "./routes/DbTestRoute.js";
import userRoutes from './routes/UserRoute.js';
import authRoutes from './routes/AuthRoutes.js';
import requestRoutes from './routes/RequestRoutes.js';
import toolRoutes from "./routes/ToolRoute.js";
import reagentRoutes from "./routes/ReagentRoute.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/", databaseRoutes);
app.use("/users", userRoutes);
app.use("/requests", requestRoutes);
app.use("/tools", toolRoutes);
app.use("/reagents", reagentRoutes);

export default app;