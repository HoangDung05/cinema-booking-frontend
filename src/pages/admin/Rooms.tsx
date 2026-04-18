import { useCallback, useEffect, useMemo, useState } from 'react';
import { cinemaService, type CinemaDto } from '../../services/cinemaService';
import { roomService, type RoomDto } from '../../services/roomService';

type RoomRow = {
  id: number;
  name: string;
  cinema_name: string;
  cinemaId: number;
};

type RoomForm = {
  name: string;
  cinemaId: number;
};

const emptyForm: RoomForm = {
  name: '',
  cinemaId: 0,
};

function fromApi(r: RoomDto): RoomRow {
  return {
    id: r.id,
    name: r.name,
    cinema_name: r.cinema?.name ?? '—',
    cinemaId: r.cinema?.id ?? 0,
  };
}

export default function Rooms() {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [cinemas, setCinemas] = useState<CinemaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const [roomList, cinemaList] = await Promise.all([roomService.getAllRooms(), cinemaService.getAll()]);
      setRows(roomList.map(fromApi));
      setCinemas(cinemaList);
    } catch (e) {
      console.error(e);
      setLoadError('Không tải được dữ liệu. Kiểm tra backend và đăng nhập admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cinema_name.toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      cinemaId: cinemas[0]?.id ?? 0,
    });
    setIsOpen(true);
  };

  const openEdit = (row: RoomRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      cinemaId: row.cinemaId || cinemas[0]?.id || 0,
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveRoom = async () => {
    if (!form.name.trim() || !form.cinemaId) {
      window.alert('Nhập tên phòng và chọn rạp.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), cinemaId: form.cinemaId };
      if (editingId === null) {
        await roomService.createRoom(payload);
      } else {
        await roomService.updateRoom(editingId, payload);
      }
      await loadData();
      closeModal();
    } catch (e) {
      console.error(e);
      window.alert('Lưu phòng thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phòng này?')) return;
    try {
      await roomService.deleteRoom(id);
      await loadData();
    } catch (e) {
      console.error(e);
      window.alert('Xóa phòng thất bại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline">Quản lý phòng</h2>
        <button
          type="button"
          onClick={openCreate}
          disabled={!cinemas.length}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm phòng
        </button>
      </div>
      {!cinemas.length && !loading ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          Chưa có rạp trong hệ thống. Thêm rạp (bảng cinemas / API admin) trước khi tạo phòng.
        </p>
      ) : null}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm phòng theo tên phòng, tên rạp"
          className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">STT</th>
                  <th className="p-4 font-medium">Tên phòng</th>
                  <th className="p-4 font-medium">Rạp</th>
                  <th className="p-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-700">{idx + 1}</td>
                    <td className="p-4 font-semibold text-gray-900">{row.name}</td>
                    <td className="p-4 text-gray-900">{row.cinema_name}</td>
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
                          onClick={() => void deleteRoom(row.id)}
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
                    <td className="p-6 text-center text-gray-500" colSpan={4}>
                      Chưa có dữ liệu phòng.
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
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold">{editingId === null ? 'Thêm phòng' : 'Sửa phòng'}</h3>

            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nhập tên phòng"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
              />
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Rạp</p>
                <select
                  value={form.cinemaId || ''}
                  onChange={(e) => setForm((f) => ({ ...f, cinemaId: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Chọn rạp</option>
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void saveRoom()}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
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
