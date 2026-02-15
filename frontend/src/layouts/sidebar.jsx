import React, { useState } from 'react';
import { 
  LayoutDashboard,
  Package,
  TestTube,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const menu = [
        { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
        { label: "Requests", icon: Activity, to: "/requests" },
        { label: "Schedules", icon: Calendar, to: "/schedules" },
        { label: "Payments", icon: DollarSign, to: "/payments" },
        { label: "Tools", icon: Package, to: "/tools" },
        { label: "Reagent", icon: TestTube, to: "/reagents" },
        { label: "Users", icon: Users, to: "/users" },
        // { label: "Reporting", icon: FileText, to: "/reports" },
        // { label: "Settings", icon: Settings, to: "/settings" },
    ];
    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img
            src="/images/chemlabsysLogo.png"
            alt="Logo"
            className="w-[3.75rem] h-[3.75rem] object-contain"
          />
          <span className="text-lg font-bold">ChemLabSys</span>
        </div>

        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

       <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${isActive ? 'bg-teal-600 text-white' : 'hover:bg-gray-800'}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div> */}
    </div>
    );
}

export default Sidebar;