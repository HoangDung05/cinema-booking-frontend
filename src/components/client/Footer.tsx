import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 pt-10 mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-headline font-bold text-primary mb-6">Group3 Cinema</h2>
            <p className="text-on-surface-variant max-w-sm">Trải nghiệm điện ảnh hơn bao giờ hết. Chỗ ngồi cao cấp, âm thanh sống động và những bộ phim bom tấn mới nhất.</p>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Phim đang chiếu</Link>
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Phim sắp chiếu</Link>
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Hệ thống rạp chiếu</Link>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Câu hỏi thường gặp</Link>
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Liên hệ</Link>
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
