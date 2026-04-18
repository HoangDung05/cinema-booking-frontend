import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminRoute from './components/AdminRoute';

// 2. Import Client Pages (Đảm bảo đường dẫn này đúng với thư mục của bạn)
import Home from './pages/client/Home';
import MovieDetails from './pages/client/MovieDetails';
import SelectShowtime from './pages/client/SelectShowtime';
import SelectSeats from './pages/client/SelectSeats';
import Checkout from './pages/client/Checkout';
import BookingSuccess from './pages/client/BookingSuccess';
import Profile from './pages/client/Profile';
import ChangePassword from './pages/client/ChangePassword';
import MyTickets from './pages/client/MyTickets';
import About from './pages/client/About';

// 3. Import Admin Pages
import Movies from './pages/admin/Movies';
import Vouchers from './pages/admin/Vouchers';
import Users from './pages/admin/Users';
import Rooms from './pages/admin/Rooms';
import Tickets from './pages/admin/Tickets';
import Showtimes from './pages/admin/Showtimes';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ================= CỤM CLIENT (Giao diện người dùng) ================= */}
        {/* Tất cả các route bên trong sẽ dùng chung ClientLayout */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} /> {/* Khớp với đường dẫn "/" */}
          <Route path="movie/:id" element={<MovieDetails />} />
          <Route path="book/showtime" element={<SelectShowtime />} />
          <Route path="book/seats" element={<SelectSeats />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="booking-success" element={<BookingSuccess />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="tickets" element={<MyTickets />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* ================= CỤM ADMIN (Giao diện quản trị) ================= */}
        {/* Tất cả các route bên trong sẽ có tiền tố là /admin */}
        <Route path="/admin" element={<AdminRoute />}>
          {/* Khi vào /admin, mặc định sẽ hiển thị trang movies */}
          <Route index element={<Movies />} />

          {/* Các trang con: KHÔNG viết dấu "/" ở đầu path */}
          <Route path="movies" element={<Movies />} />
          <Route path="vouchers" element={<Vouchers />} /> {/* Đường dẫn: /admin/vouchers */}
          <Route path="users" element={<Users />} />     {/* Đường dẫn: /admin/users */}
          <Route path="rooms" element={<Rooms />} />
          <Route path="showtimes" element={<Showtimes />} />
          <Route path="tickets" element={<Tickets/>} />
        </Route>

        {/* ================= XỬ LÝ LỖI 404 (Trang không tồn tại) ================= */}
        <Route path="*" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>404 - Không tìm thấy trang</h1>
            <a href="/">Quay về trang chủ</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}