import express from "express";
import cors from "cors";
import testRoutes from "./routes/test.routes.js";
import usersRoutes from "./routes/users.route.js";
import toolsRoutes from './routes/tools.route.js';
import path from 'path';
import reagentsRoutes from './routes/reagents.route.js';
import requestsRoutes from './routes/requests.route.js';
import dashboardRoutes from "./routes/dashboard.route.js";
import schedulesRoutes from './routes/schedules.route.js';
import paymentsRoutes from './routes/payments.route.js';
import reportingRoutes from './routes/reporting.route.js';
import landingRoutes from './routes/landing.route.js';
import catalogRoutes from './routes/catalog.route.js';
import authRoutes from './routes/auth.route.js';
import customerRoutes from './routes/customer.route.js';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // frontend Vite
  credentials: true
}));

app.use(passport.initialize()); 
app.use(express.json());

// test nyawa
app.get("/", (req, res) => {
  res.json({ message: "API OK" });
});

app.use("/test", testRoutes);
app.use("/users", usersRoutes);
app.use('/tools', toolsRoutes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/reagents', reagentsRoutes);

app.use('/requests', requestsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use('/schedules', schedulesRoutes);
app.use('/payments', paymentsRoutes);
app.use('/reporting', reportingRoutes);
app.use('/landing', landingRoutes);

app.use('/catalog', catalogRoutes);
app.use('/auth', authRoutes);
app.use('/customer', customerRoutes);

export default app;