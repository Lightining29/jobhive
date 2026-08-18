import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingAssistant from '../voice/FloatingAssistant';

const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-300">
    <Navbar />
    <main className="flex-1 bg-[#F8FAFC] dark:bg-[#030712]">
      <Outlet />
    </main>
    <Footer />
    {/* Global AI Voice Assistant — floats over all pages */}
    <FloatingAssistant />
  </div>
);

export default MainLayout;
