import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
import Landing from "./pages/public/landingPage.jsx";
import Login from "./pages/auth/login.jsx";
import Register from "./pages/auth/register.jsx";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import Reagents from "./pages/public/managementReagents.jsx";
import Tools from "./pages/public/managementTools.jsx";
// import Reports from "./pages/public/managementReporting.jsx";
import Users from "./pages/public/users.jsx";
import Request from "./pages/public/requests.jsx";
import Schedules from "./pages/public/schedules.jsx";
import Payments from "./pages/public/payments.jsx";
import { CartProvider } from "./pages/context/CartContex.jsx"; 
import { AuthProvider } from './pages/context/AuthContext.jsx';
import AjukanPeminjaman from "./pages/public/ajukanPeminjaman.jsx"; 
import CustomerDashboard from "./pages/public/customerDashboard.jsx";
import MyRequests from "./pages/public/myRequests.jsx";
import RequestDetail from "./pages/public/requestDetail.jsx";
import LoginStaff from "./pages/auth/loginStaff.jsx";
// import Settings from "./pages/settings/settings.jsx";

import KatalogPage from './pages/public/KatalogPage.jsx';
// import AjukanPeminjaman from './pages/AjukanPeminjaman';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* AFTER LOGIN */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reagents" element={<Reagents />} />
            <Route path="/tools" element={<Tools />} />
            {/* <Route path="/reports" element={<Reports />} /> */}
            <Route path="/users" element={<Users />} />
            <Route path="/requests" element={<Request />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/payments" element={<Payments />} />

            <Route path="/katalog" element={<KatalogPage />} />
            <Route path="/ajukan-peminjaman" element={<AjukanPeminjaman />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/requests" element={<MyRequests />} />
            <Route path="/customer/requests/:id" element={<RequestDetail />} />
            <Route path="/staff/login" element={<LoginStaff />} />
            {/* <Route path="/settings" element={<Settings />} /> */}

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
