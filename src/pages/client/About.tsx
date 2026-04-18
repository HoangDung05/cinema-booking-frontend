export default function About() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Banner */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm mb-4 opacity-80">Group3 Cinema</p>
            <h1 className="text-3xl md:text-5xl font-headline font-bold mb-4 leading-tight">
              Đặt vé xem phim
              <br />
              nhanh chóng và tiện lợi
            </h1>
            <p className="text-sm md:text-base text-white/80 mb-8">
              Group3 Cinema mang đến trải nghiệm đặt vé hiện đại, tối ưu từ khâu chọn phim, suất chiếu, ghế ngồi đến thanh toán,
              giúp bạn tận hưởng trọn vẹn từng khoảnh khắc tại rạp.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface text-primary font-semibold shadow-lg hover:bg-surface/90 transition-colors"
            >
              Đặt vé ngay
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200"
                  alt="Cinema"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 bg-surface/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <div>
                  <p className="text-xs text-on-surface-variant">Đặt vé chỉ trong</p>
                  <p className="text-sm font-semibold text-on-surface">3 bước đơn giản</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Giới thiệu hệ thống */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-4">
              Hệ thống đặt vé thông minh cho mọi rạp chiếu
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-4">
              Nền tảng Group3 Cinema được thiết kế dành cho người dùng Việt Nam, tập trung vào tốc độ, sự rõ ràng và trải nghiệm mượt mà.
              Bạn có thể dễ dàng tìm kiếm phim, xem lịch chiếu tại nhiều cụm rạp, chọn ghế yêu thích và thanh toán an toàn chỉ trong vài phút.
            </p>
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
              Giao diện hiện đại, hỗ trợ đa nền tảng từ máy tính đến điện thoại, giúp bạn đặt vé mọi lúc, mọi nơi.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
              <p className="text-3xl font-bold text-primary mb-1">24/7</p>
              <p className="text-xs text-on-surface-variant">Đặt vé mọi lúc</p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
              <p className="text-3xl font-bold text-primary mb-1">3+</p>
              <p className="text-xs text-on-surface-variant">Cụm rạp tích hợp</p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
              <p className="text-3xl font-bold text-primary mb-1">100K+</p>
              <p className="text-xs text-on-surface-variant">Vé đã bán (mô phỏng)</p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20">
              <p className="text-3xl font-bold text-primary mb-1">4.8</p>
              <p className="text-xs text-on-surface-variant">Đánh giá trải nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tính năng nổi bật */}
      <section className="bg-surface-container-lowest border-y border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-8 text-center">
            Tính năng nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">movie_filter</span>
              </div>
              <h3 className="font-headline font-semibold text-on-surface mb-2">Tìm kiếm & lọc phim dễ dàng</h3>
              <p className="text-sm text-on-surface-variant">
                Xem nhanh các phim đang chiếu, sắp chiếu, lọc theo thể loại, rạp và khung giờ mong muốn.
              </p>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">event_seat</span>
              </div>
              <h3 className="font-headline font-semibold text-on-surface mb-2">Chọn ghế trực quan</h3>
              <p className="text-sm text-on-surface-variant">
                Sơ đồ ghế rõ ràng, trạng thái ghế cập nhật theo thời gian thực, giúp bạn dễ dàng chọn được vị trí ưng ý.
              </p>
            </div>
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <h3 className="font-headline font-semibold text-on-surface mb-2">Thanh toán nhanh & an toàn</h3>
              <p className="text-sm text-on-surface-variant">
                Hỗ trợ nhiều phương thức thanh toán (mô phỏng), quy trình tối giản, rõ ràng từng bước.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-primary rounded-3xl px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-on-primary">
          <div>
            <h2 className="text-2xl md:text-3xl font-headline font-bold mb-3">Sẵn sàng cho buổi chiếu tiếp theo?</h2>
            <p className="text-sm md:text-base text-on-primary/80">
              Đăng ký tài khoản, lưu thông tin và đặt vé chỉ trong vài phút. Trải nghiệm đặt vé xem phim hiện đại cùng Group3 Cinema.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface text-primary font-semibold shadow-lg hover:bg-surface/90 transition-colors"
          >
            Đặt vé ngay
            <span className="material-symbols-outlined">local_activity</span>
          </a>
        </div>
      </section>
    </div>
  );
}

