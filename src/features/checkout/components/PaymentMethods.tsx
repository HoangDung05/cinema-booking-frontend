import React from 'react';

export type PaymentMethod = 'momo' | 'card';

type PaymentMethodsProps = {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
};

export default function PaymentMethods({ paymentMethod, setPaymentMethod }: PaymentMethodsProps) {
  return (
    <div className="pt-2">
      <h3 className="text-xl font-headline font-bold text-on-surface mb-5">Chọn phương thức thanh toán</h3>

      <div className="flex flex-col gap-4">
        <label
          className={
            paymentMethod === 'momo'
              ? 'relative flex items-center gap-4 p-5 border-2 border-primary bg-primary/5 rounded-2xl cursor-pointer transition-colors'
              : 'relative flex items-center gap-4 p-5 border-2 border-outline-variant/30 hover:border-outline-variant rounded-2xl cursor-pointer transition-colors bg-surface-container-lowest'
          }
        >
          <input
            type="radio"
            name="paymentMethod"
            className="absolute opacity-0"
            checked={paymentMethod === 'momo'}
            onChange={() => setPaymentMethod('momo')}
          />

          {paymentMethod === 'momo' ? (
            <div className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          ) : (
            <div className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 border-outline-variant/50 bg-surface-container-lowest" />
          )}

          <div className="ml-6 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            {/* MOMO icon */}
            <div className="w-10 h-10 rounded-full bg-[#D7000F] flex items-center justify-center shadow-sm">
              <span className="text-white font-headline font-extrabold text-[11px] leading-none tracking-wide">
                momo
              </span>
            </div>
          </div>

          <div>
            <p className="font-headline font-bold text-on-surface">Ví MOMO</p>
            <p className="text-sm text-on-surface-variant">Thanh toán nhanh và an toàn</p>
          </div>
        </label>

        <label
          className={
            paymentMethod === 'card'
              ? 'relative flex items-center gap-4 p-5 border-2 border-primary bg-primary/5 rounded-2xl cursor-pointer transition-colors'
              : 'relative flex items-center gap-4 p-5 border-2 border-outline-variant/30 hover:border-outline-variant rounded-2xl cursor-pointer transition-colors bg-surface-container-lowest'
          }
        >
          <input
            type="radio"
            name="paymentMethod"
            className="absolute opacity-0"
            checked={paymentMethod === 'card'}
            onChange={() => setPaymentMethod('card')}
          />

          {paymentMethod === 'card' ? (
            <div className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          ) : (
            <div className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 border-outline-variant/50 bg-surface-container-lowest" />
          )}

          <div className="ml-6 w-12 h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">credit_card</span>
          </div>

          <div>
            <p className="font-headline font-bold text-on-surface">Thẻ tín dụng / ghi nợ</p>
            <p className="text-sm text-on-surface-variant">Visa, Mastercard, AMEX</p>
          </div>
        </label>
      </div>
    </div>
  );
}
