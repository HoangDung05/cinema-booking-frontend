import { Outlet } from 'react-router-dom';
import Header from '../components/client/Header';
import Footer from '../components/client/Footer';
import Chatbot from '../components/Chatbot';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
