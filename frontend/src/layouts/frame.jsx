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

import Navbar from './navbar.jsx';
import Sidebar from './sidebar.jsx';

const Frame = ({menuName, descriptionMenu, bodyContent}) => {
  const [sidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <Navbar menu={menuName} description={descriptionMenu} />

        {/* Dashboard Content */}
        {bodyContent}
      </div>
    </div>
  );
};

export default Frame;