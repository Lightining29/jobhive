import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingAssistant from '../voice/FloatingAssistant';

const MainLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    {/* Global AI Voice Assistant — floats over all pages */}
    <FloatingAssistant />
  </div>
);

export default MainLayout;
