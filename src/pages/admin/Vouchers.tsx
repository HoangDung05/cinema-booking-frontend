import { useCallback, useEffect, useMemo, useState } from 'react';
import { voucherService, type VoucherDto } from '../../services/voucherService';

type DiscountTypeUi = 'PERCENT' | 'FIXED';

type VoucherForm = {
  code: string;
  description: string;
  discountType: DiscountTypeUi;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  usedCount: number;
  usageLimit: string;
  status: string;
};

const emptyForm: VoucherForm = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: 0,
  minOrderValue: 0,
  maxDiscountAmount: 0,
  startDate: '',
  endDate: '',
  usedCount: 0,
  usageLimit: '',
  status: 'ACTIVE',
};

function formatDateVN(iso: string) {
  if (!iso) return '';
  const d = iso.slice(0, 10);
  const date = new Date(`${d}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('vi-VN');
}

/** Cột Loại: chỉ hiển thị đơn vị */
function typeUnit(discountType: string) {
  return discountType === 'PERCENT' ? '%' : 'VND';
}

/** Cột Giá trị: chỉ số, không kèm % hay VND */
function valueCellOnlyNumber(v: VoucherDto) {
  const n = Number(v.discountValue);
  if (!Number.isFinite(n)) return '—';
  if (Number.isInteger(n)) return String(n);
  return String(n);
}

function statusLabel(status: string | null | undefined) {
  const s = (status || 'ACTIVE').toUpperCase();
  if (s === 'ACTIVE') return 'Hoạt động';
  if (s === 'INACTIVE') return 'Ngưng';
  if (s === 'EXPIRED') return 'Hết hạn';
  return s;
}

function statusBadgeClass(status: string | null | undefined) {
  const s = (status || 'ACTIVE').toUpperCase();
  if (s === 'ACTIVE') return 'bg-emerald-100 text-emerald-700';
  if (s === 'INACTIVE') return 'bg-gray-100 text-gray-700';
  if (s === 'EXPIRED') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}

function toDateInput(iso: string) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function validateForm(form: VoucherForm): string | null {
  if (!form.code.trim()) return 'Nhập mã voucher.';
  if (!form.startDate || !form.endDate) return 'Chọn ngày bắt đầu và ngày kết thúc.';
  const val = Number(form.discountValue);
  if (!Number.isFinite(val) || val <= 0) return 'Giá trị phải là số dương.';
  if (form.discountType === 'PERCENT' && val > 100) return 'Loại %: giá trị không được vượt quá 100.';
  return null;
}

function toPayload(form: VoucherForm): Omit<VoucherDto, 'id'> {
  const limit =
    form.usageLimit.trim() === '' ? null : Math.max(0, Math.floor(Number(form.usageLimit)));
  return {
    code: form.code.trim(),
    description: form.description.trim() || undefined,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderValue: form.minOrderValue > 0 ? form.minOrderValue : undefined,
    maxDiscountAmount: form.maxDiscountAmount > 0 ? form.maxDiscountAmount : undefined,
    startDate: `${form.startDate}T00:00:00`,
    endDate: `${form.endDate}T23:59:59`,
    usageLimit: limit,
    usedCount: form.usedCount,
    status: form.status,
  };
}

function fromDto(v: VoucherDto): VoucherForm {
  return {
    code: v.code,
    description: v.description || '',
    discountType: (v.discountType === 'FIXED' ? 'FIXED' : 'PERCENT') as DiscountTypeUi,
    discountValue: Number(v.discountValue),
    minOrderValue: v.minOrderValue != null ? Number(v.minOrderValue) : 0,
    maxDiscountAmount: v.maxDiscountAmount != null ? Number(v.maxDiscountAmount) : 0,
    startDate: toDateInput(v.startDate),
    endDate: toDateInput(v.endDate),
    usedCount: v.usedCount != null ? Number(v.usedCount) : 0,
    usageLimit: v.usageLimit != null ? String(v.usageLimit) : '',
    status: (v.status || 'ACTIVE').toUpperCase(),
  };
}

function alertError(e: unknown) {
  const err = e as { response?: { data?: unknown } };
  const data = err.response?.data;
  window.alert(typeof data === 'string' ? data : 'Thao tác thất bại.');
}

export default function Voucher() {
                                 const [rows, setRows] = useState<VoucherDto[]>([]);
                                 const [loading, setLoading] = useState(true);
                                 const [loadError, setLoadError] = useState('');
                                 const [searchTerm, setSearchTerm] = useState('');
                                 const [isOpen, setIsOpen] = useState(false);
                                 const [editingId, setEditingId] = useState<number | null>(null);
                                 const [form, setForm] = useState<VoucherForm>(emptyForm);
                                 const [saving, setSaving] = useState(false);

                                 const isEdit = editingId !== null;

                                 const loadVouchers = useCallback(async () => {
                                   setLoadError('');
                                   setLoading(true);
                                   try {
                                     const list = await voucherService.getAll();
                                     setRows(list);
                                   } catch (e) {
                                     console.error(e);
                                     setLoadError('Không tải được danh sách voucher. Kiểm tra backend và đăng nhập admin.');
                                   } finally {
                                     setLoading(false);
                                   }
                                 }, []);

                                 useEffect(() => {
                                   loadVouchers();
                                 }, [loadVouchers]);

                                 const filteredRows = useMemo(() => {
                                   const q = searchTerm.trim().toLowerCase();
                                   if (!q) return rows;
                                   return rows.filter((row) => {
                                     const blob = [
                                       row.code,
                                       row.description,
                                       row.discountType,
                                       row.status,
                                       typeUnit(row.discountType),
                                       valueCellOnlyNumber(row),
                                     ]
                                       .filter(Boolean)
                                       .join(' ')
                                       .toLowerCase();
                                     return blob.includes(q);
                                   });
                                 }, [rows, searchTerm]);

                                 const openCreate = () => {
                                   setEditingId(null);
                                   setForm(emptyForm);
                                   setIsOpen(true);
                                 };

                                 const openEdit = (row: VoucherDto) => {
                                   setEditingId(row.id);
                                   setForm(fromDto(row));
                                   setIsOpen(true);
                                 };

                                 const closeModal = () => {
                                   setIsOpen(false);
                                   setEditingId(null);
                                   setForm(emptyForm);
                                 };

                                 const saveVoucher = async () => {
                                   const err = validateForm(form);
                                   if (err) {
                                     window.alert(err);
                                     return;
                                   }
                                   setSaving(true);
                                   try {
                                     const payload = toPayload(form);
                                     if (editingId === null) {
                                       await voucherService.create(payload);
                                     } else {
                                       await voucherService.update(editingId, payload);
                                     }
                                     await loadVouchers();
                                     closeModal();
                                   } catch (e) {
                                     console.error(e);
                                     alertError(e);
                                   } finally {
                                     setSaving(false);
                                   }
                                 };

                                 const deleteVoucher = async (id: number) => {
                                   if (!window.confirm('Xóa voucher này?')) return;
                                   try {
                                     await voucherService.delete(id);
                                     await loadVouchers();
                                   } catch (e) {
                                     console.error(e);
                                     alertError(e);
                                   }
                                 };

                                 return (
                                   <div className="space-y-6">
                                     <div className="flex justify-between items-center">
                                       <h2 className="text-xl font-bold font-headline">Quản lý mã giảm giá</h2>
                                       <button
                                         type="button"
                                         onClick={openCreate}
                                         className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                       >
                                         <span className="material-symbols-outlined text-sm">add</span>
                                         Thêm mã giảm giá
                                       </button>
                                     </div>
                                     <div className="relative max-w-md">
                                       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                       <input
                                         value={searchTerm}
                                         onChange={(e) => setSearchTerm(e.target.value)}
                                         placeholder="Tìm mã, giá trị, loại, mô tả..."
                                         className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                                       />
                                     </div>

                                     {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

                                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                       <div className="overflow-x-auto">
                                         {loading ? (
                                           <div className="p-8 text-center text-gray-500">Đang tải...</div>
                                         ) : (
                                           <table className="w-full text-left border-collapse min-w-[960px]">
                                             <thead>
                                               <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                                 <th className="p-4 font-medium">STT</th>
                                                                 <th className="p-4 font-medium">Mã</th>
                                                                 <th className="p-4 font-medium">Mô tả</th>
                                                                 <th className="p-4 font-medium">Ngày bắt đầu</th>
                                                                 <th className="p-4 font-medium">Ngày hết hạn</th>
                                                                 <th className="p-4 font-medium">Giá trị</th>
                                                                 <th className="p-4 font-medium">Loại</th>
                                                                 <th className="p-4 font-medium">Giá trị đơn tối thiểu</th>
                                                                 <th className="p-4 font-medium">Giảm tối đa</th>
                                                                 <th className="p-4 font-medium">Lượt dùng</th>
                                                                 <th className="p-4 font-medium">Trạng thái</th>
                                                                 <th className="p-4 font-medium text-right">Thao tác</th>
                                                               </tr>
                                                             </thead>
                                                             <tbody className="text-sm divide-y divide-gray-100">
                                                               {filteredRows.map((row, idx) => (
                                                                 <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                                                   <td className="p-4 text-gray-700">{idx + 1}</td>
                                                                   <td className="p-4 font-mono font-bold text-gray-900">{row.code}</td>
                                                                   <td className="p-4 text-gray-600 max-w-[200px] truncate" title={row.description || ''}>
                                                                     {row.description || '—'}
                                                                   </td>
                                                                   <td className="p-4 text-gray-600 whitespace-nowrap">{formatDateVN(row.startDate)}</td>
                                                                   <td className="p-4 text-gray-600 whitespace-nowrap">{formatDateVN(row.endDate)}</td>
                                                                   <td className="p-4 text-gray-900 font-medium tabular-nums">{valueCellOnlyNumber(row)}</td>
                                                                   <td className="p-4 font-semibold text-sky-600 whitespace-nowrap">{typeUnit(row.discountType)}</td>
                                                                   <td className="p-4 text-gray-900 whitespace-nowrap">
                                                                     {row.minOrderValue != null && Number(row.minOrderValue) > 0
                                                                       ? Number(row.minOrderValue).toLocaleString('vi-VN') + ' ₫'
                                                                       : '—'}
                                                                   </td>
                                                                   <td className="p-4 text-gray-900 whitespace-nowrap">
                                                                     {row.maxDiscountAmount != null && Number(row.maxDiscountAmount) > 0
                                                                       ? Number(row.maxDiscountAmount).toLocaleString('vi-VN') + ' ₫'
                                                                       : '—'}
                                                                   </td>
                                                                   <td className="p-4 text-gray-900 whitespace-nowrap">
                                                                     {row.usedCount ?? 0}{' '}
                                                                     <span className="text-gray-400">
                                                                       / {row.usageLimit != null ? row.usageLimit : '∞'}
                                                                     </span>
                                                                   </td>
                                                                   <td className="p-4">
                                                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadgeClass(row.status)}`}>
                                                                       {statusLabel(row.status)}
                                                                     </span>
                                                                   </td>
                                                                   <td className="p-4">
                                                                     <div className="flex justify-end gap-2">
                                                                       <button
                                                                         type="button"
                                                                         onClick={() => openEdit(row)}
                                                                         className="px-3 py-1.5 text-xs rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                       >
                                                                         Sửa
                                                                       </button>
                                                                       <button
                                                                         type="button"
                                                                         onClick={() => void deleteVoucher(row.id)}
                                                                         className="px-3 py-1.5 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                                                                       >
                                                                         Xóa
                                                                       </button>
                                                                     </div>
                                                                   </td>
                                                                 </tr>
                                                               ))}
                                                               {!filteredRows.length && (
                                                                 <tr>
                                                                 <td colSpan={12} className="p-6 text-center text-gray-500">
                                                                     Chưa có voucher.
                                                                   </td>
                                                                 </tr>
                                                               )}
                                                             </tbody>
                                                           </table>
                                                         )}
                                                       </div>
                                                     </div>

                                                     {isOpen && (
                                                       <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center px-4">
                                                         <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-5 space-y-4">
                                                                     <h3 className="text-lg font-bold">{isEdit ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</h3>
                                                                     <div className="space-y-3">
                                                                       <input
                                                                         value={form.code}
                                                                         onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                                                         placeholder="Mã voucher (duy nhất)"
                                                                         disabled={isEdit}
                                                                         className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500"
                                                                       />
                                                                       <textarea
                                                                         value={form.description}
                                                                         onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                                                         placeholder="Mô tả"
                                                                         className="w-full border rounded-lg px-3 py-2 min-h-[72px]"
                                                                       />
                                                                       <div className="grid grid-cols-2 gap-2">
                                                                         <div className="space-y-1">
                                                                           <p className="text-xs text-gray-500">Giá trị (chỉ số)</p>
                                                                           <input
                                                                             type="number"
                                                                             min={0}
                                                                             step="any"
                                                                             value={form.discountValue === 0 ? '' : form.discountValue}
                                                                             onChange={(e) =>
                                                                               setForm((f) => ({ ...f, discountValue: Number(e.target.value || 0) }))
                                                                             }
                                                                             placeholder={form.discountType === 'PERCENT' ? 'VD: 10' : 'VD: 50000'}
                                                                             className="w-full border rounded-lg px-3 py-2"
                                                                           />
                                                                         </div>
                                                                         <div className="space-y-1">
                                                                           <p className="text-xs text-gray-500">Loại (đơn vị)</p>
                                                                           <select
                                                                             value={form.discountType}
                                                                             onChange={(e) =>
                                                                               setForm((f) => ({ ...f, discountType: e.target.value as DiscountTypeUi }))
                                                                             }
                                                                             className="w-full border rounded-lg px-3 py-2"
                                                                           >
                                                                             <option value="PERCENT">% (phần trăm)</option>
                                                                             <option value="FIXED">VND (số tiền)</option>
                                                                           </select>
                                                                         </div>
                                                                       </div>
                                                                       <p className="text-xs text-gray-500 -mt-1">
                                                                         Nhập giá trị là số thuần (10, 50000…). Chọn Loại để biết là % hay VND.
                                                                       </p>
                                                                       <div className="grid grid-cols-2 gap-2">
                                                                         <div className="space-y-1">
                                                                           <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                                                                           <input
                                                                             type="date"
                                                                             value={form.startDate}
                                                                             onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                                                                             className="w-full border rounded-lg px-3 py-2"
                                                                           />
                                                                         </div>
                                                                         <div className="space-y-1">
                                                                           <p className="text-xs text-gray-500">Ngày kết thúc</p>
                                                                           <input
                                                                             type="date"
                                                                             value={form.endDate}
                                                                             onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                                                                             className="w-full border rounded-lg px-3 py-2"
                                                                           />
                                                                         </div>
                                                                       </div>
                                                                       <input
                                                                         type="number"
                                                                         min={0}
                                                                         step={1000}
                                                                         value={form.maxDiscountAmount === 0 ? '' : form.maxDiscountAmount}
                                                                         onChange={(e) =>
                                                                           setForm((f) => ({ ...f, maxDiscountAmount: Number(e.target.value || 0) }))
                                                                         }
                                                                         placeholder="Giảm tối đa (VND, tùy chọn — cho loại %)"
                                                                         className="w-full border rounded-lg px-3 py-2"
                                                                       />
                                                                       <input
                                                                         type="number"
                                                                         min={0}
                                                                         step={1000}
                                                                         value={form.minOrderValue === 0 ? '' : form.minOrderValue}
                                                                         onChange={(e) =>
                                                                                           setForm((f) => ({ ...f, minOrderValue: Number(e.target.value || 0) }))
                                                                                         }
                                                                                         placeholder="Giá trị đơn tối thiểu (VND, tùy chọn)"
                                                                                         className="w-full border rounded-lg px-3 py-2"
                                                                                       />
                                                                                       <div className="grid grid-cols-2 gap-2">
                                                                                         <input
                                                                                           type="number"
                                                                                           min={0}
                                                                                           value={form.usedCount === 0 ? '' : form.usedCount}
                                                                                           onChange={(e) =>
                                                                                             setForm((f) => ({ ...f, usedCount: Math.max(0, Number(e.target.value || 0)) }))
                                                                                           }
                                                                                           placeholder="Đã dùng"
                                                                                           className="w-full border rounded-lg px-3 py-2"
                                                                                         />
                                                                                         <input
                                                                                           value={form.usageLimit}
                                                                                           onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                                                                                           placeholder="Giới hạn lượt (để trống = không giới hạn)"
                                                                                           className="w-full border rounded-lg px-3 py-2"
                                                                                         />
                                                                                       </div>
                                                                                       <select
                                                                                         value={form.status}
                                                                                         onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                                                                         className="w-full border rounded-lg px-3 py-2"
                                                                                       >
                                                                                         <option value="ACTIVE">Hoạt động</option>
                                                                                         <option value="INACTIVE">Ngưng</option>
                                                                                         <option value="EXPIRED">Hết hạn</option>
                                                                                       </select>
                                                                                     </div>
                                                                                     <div className="flex justify-end gap-2">
                                                                                       <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2 rounded-lg border">
                                                                                         Hủy
                                                                                       </button>
                                                                                       <button
                                                                                         type="button"
                                                                                         onClick={() => void saveVoucher()}
                                                                                         disabled={saving}
                                                                                         className="px-4 py-2 rounded-lg bg-sky-600 text-white disabled:opacity-50"
                                                                                       >
                                                                                         {saving ? 'Đang lưu...' : 'Lưu'}
                                                                                       </button>
                                                                                     </div>
                                                                                   </div>
                                                                                 </div>
                                                                               )}
                                                                             </div>
                                                                           );
                                                                         }
