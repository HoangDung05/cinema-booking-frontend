import { FormEvent } from 'react';
import { VoucherDTO } from '../../../services/voucherService';

type VoucherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vouchers: VoucherDTO[];
  loading: boolean;
  promoCode: string;
  setPromoCode: (code: string) => void;
  onApply: (code?: string) => void;
  currentSubtotal: number;
};

export default function VoucherModal({
  isOpen,
  onClose,
  vouchers,
  loading,
  promoCode,
  setPromoCode,
  onApply,
  currentSubtotal,
}: VoucherModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onClose();
    onApply(promoCode);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
          <h2 className="text-xl font-headline font-bold text-on-surface">CHỌN MÃ GIẢM GIÁ</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low">
          <form className="flex gap-3" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nhập mã voucher (vd: GIOVANG)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl outline-none uppercase font-headline font-semibold text-on-surface"
            />
            <button type="submit" className="px-5 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90">
              Áp dụng
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-container-low custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          ) : vouchers.length > 0 ? (
            vouchers.map((v) => {
              const isEligible = !v.minOrderValue || currentSubtotal >= v.minOrderValue;

              return (
                <div
                  key={v.id}
                  className={`relative flex bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm transition-all ${
                    isEligible ? 'hover:shadow' : 'opacity-60 cursor-not-allowed grayscale-[30%]'
                  }`}
                >
                  <div
                    className={`w-24 flex flex-col items-center justify-center border-r border-dashed border-outline-variant/40 p-2 ${
                      isEligible ? 'bg-primary/10' : 'bg-surface-container-high'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-3xl mb-1 ${
                        isEligible ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      loyalty
                    </span>
                  </div>
                  <div className="p-4 flex-1">
                    <p
                      className={`font-headline font-bold text-lg mb-1 uppercase tracking-wide ${
                        isEligible ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {v.code}
                    </p>
                    <p className="text-sm text-on-surface-variant mb-2">{v.description}</p>
                    {v.minOrderValue ? (
                      <p
                        className={`text-xs font-medium ${
                          isEligible ? 'text-on-surface-variant' : 'text-red-600/80'
                        }`}
                      >
                        Đơn tối thiểu {v.minOrderValue.toLocaleString()} ₫
                      </p>
                    ) : null}
                  </div>
                  <div className="p-4 flex flex-col justify-center items-center border-l border-outline-variant/10 bg-surface-container-lowest">
                    <button
                      disabled={!isEligible}
                      onClick={() => {
                        if (!isEligible) return;
                        setPromoCode(v.code);
                        onClose();
                        onApply(v.code);
                      }}
                      className={`px-4 py-2 font-bold rounded-lg text-sm transition-colors whitespace-nowrap ${
                        isEligible
                          ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                          : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                      }`}
                    >
                      Dùng ngay
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-outline">sentiment_dissatisfied</span>
              <p className="text-on-surface-variant font-medium">Không có mã giảm giá nào trong hệ thống</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
