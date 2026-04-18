export const cinemas = [
  { id: 'LC-001', name: 'Lumière Central', location: '7th Avenue, Manhattan', halls: 12, capacity: 2400, status: 'Operational', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA65FyiZU7Cq4weEKq2YVd5OA6eoLqf9h5tH0V2oHBF6DIXqapHj_WuzmECWk0qJzlnAp3kEgGp_FQGApMpnBtgX43v6rfMZU0mb9DimUoseGo9J-e8Kg9IbnN28RtwqcQfnXU_UrYHkOfOqUI4d3szeQjeQZxyeo2SOvfHuKm_hjetLbgB0lcS_rOPxphtqa-odOijX-w2-tLMVxY-hWjt_467mWcdAyjIrggTDGo7FrZXC-VRJaw2FUXig2dpaHvhuoRcOxFpYfc' },
  { id: 'LW-002', name: 'Lumière Waterfront', location: 'Harbor Quay, Brooklyn', halls: 8, capacity: 1600, status: 'Operational', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhxG-egIN6SOQnnwkxzMxv__fQrWACZhq3n9BscjPD7BKY7dRCn6sBHwAyeSJewcssbKFMlODTZCmIIj8aiVKQKsioXRE4e8umTJBVS573lTmt9Lp-3w2CdOYcx2Y5yyAed3uGNK71jnQM6Z7dsgq__QxkVVGgxUB1C8S-uLRTIa0DDhZqDlbcDfYhSBBaKXj0dwcx-xpm3P2KxbtZaIf495q8y4sou6kHwrG1joqLP0Vpx1knq5KpV2A5fHeHz1OmMCactR0pPkQ' },
  { id: 'LH-003', name: 'Lumière Heights', location: 'Summit Plaza, Queens', halls: 10, capacity: 1950, status: 'Maintenance', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA7XLdM7CgjwKSlk3tlh5VfKO-MALEZjUiFZcnr0N3Fcze5WaI5iEzCdvy858sdgubMTJQq_eWrU_e-jCUr9PvKs4EF_cM3k4979BUK_qN0LWg4EghbPNjnZYzcCeiw6oAdYOvX0sJ3l1jn84WrddHcTSMV9ZaHNPqbK5nceGIU_nvZBhg4FB5UFBEm2qrJJYjxZ_qSBNJWTT1i7CYHbeGtFuGsHa4RDFPaVB4S2dw_j7IjaLyXIf-v_Mrn3eRd_78sCG4SruLlsY' },
  { id: 'LG-004', name: 'Lumière Gardens', location: 'Park Slope, Brooklyn', halls: 6, capacity: 900, status: 'Operational', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpHD43E38xhi1YfmjZXLi24cIogqZXsNNlD9SZXYQEYKjBHORRcmrkrh6nErUki4MZn3izhuT-Q0BVGF9XOoVnJQvUhX_x_jUBw6I2CSH6D1OnPeFqBWcnABMGJfOLzjVlI_Bl-N-qcDgGawZ5djt8WyfATYAy9HCAxT64JQ6cyN-pG_QURIZ_ka8T3hBD0ZCzp34lPfe11GLkUePHb8ShRGr52Gg6OvEIaXWVQpGmMOkgHDySfnbpPVNai0aB6Rva2gPthZySTCw' },
];

export const vouchers = [
  {
    code: 'HE10',
    type: '%',
    description: 'Giảm 10% cho mọi đơn vé online',
    startDate: '2026-04-01',
    expiry: '2026-04-30',
    value: 10,
    maxDiscount: 30000,
    usage: 120,
    limit: 1000,
    status: 'Active',
  },
  {
    code: 'WELCOME20',
    type: '%',
    description: 'Ưu đãi khách hàng mới giảm 20%',
    startDate: '2026-04-01',
    expiry: '2026-06-30',
    value: 20,
    maxDiscount: 50000,
    usage: 54,
    limit: 500,
    status: 'Active',
  },
  {
    code: 'WEEKEND30K',
    type: 'VNĐ',
    description: 'Cuối tuần giảm thẳng 30.000đ',
    startDate: '2026-04-05',
    expiry: '2026-05-31',
    value: 30000,
    maxDiscount: 30000,
    usage: 20,
    limit: 200,
    status: 'Active',
  },
  {
    code: 'MIDNIGHT40K',
    type: 'VNĐ',
    description: 'Suất sau 22:00 giảm 40.000đ',
    startDate: '2026-03-15',
    expiry: '2026-04-20',
    value: 40000,
    maxDiscount: 40000,
    usage: 199,
    limit: 200,
    status: 'Inactive',
  },
  {
    code: 'TET50',
    type: '%',
    description: 'Ưu đãi Tết giảm 50% (đã hết hạn)',
    startDate: '2026-01-15',
    expiry: '2026-02-15',
    value: 50,
    maxDiscount: 70000,
    usage: 42,
    limit: 100,
    status: 'Expired',
  },
];

export const users = [
  { id: '#LUM-9402', name: 'Sarah Jenkins', email: 's.jenkins@example.com', phone: '+1 (555) 012-3456', role: 'CUSTOMER', joined: '2023-10-12', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsJIPTtm_BS-ydhwSRfT0jyb_RZzyID5ZvSrPrXZjRyd9PnvG-BR_25cz84jGKSHaMKgWhsR3z4cLj1Ia9tg_KB0VajT6fZr6W4vE-hHIPH-x90VdhgyTTPgAOYKus6jKOLClR1MVH0z3NmLCz2PJDNuFziP2RaKVqO0LVk-EUZgnBjx9jAcCeXhEbNX4MQQcqpibZ7ebZACieyfsaJULtuzEeKxkGAd6nKNfH4GpK4W7DDnAYvCDk4EG0KJWYbAtf11jEN45mcG8' },
  { id: '#LUM-8291', name: 'David Chen', email: 'd.chen.creative@web.com', phone: '+1 (555) 782-1192', role: 'CUSTOMER', joined: '2024-01-05', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAv63r7lCvHqX_v4el4cCXC2MamjoB6TYKEj3XKqrV5QV-_9jscE-BVwFrJMRXGAIeu4HOmyx83HhxNMNwshnElMv6UA5O8SWWLsw64Rd8jcPBlf2gtYpG4K4awgW_T4E6O2NIuAlcRGAC80AGJnfIxocL3oIXjPBs9HW21z0jn7ZyKSjlLaOqHPAp-iNEWg5yp-f9BLfyv4V6BnNqt8swndoypRqPAg-3cpbHXV5dqtK2j_SExHoRHV09ZalvkGhHiTNflGQ7qSHw' },
  { id: '#LUM-2210', name: 'Marcus Edwards', email: 'marcus.e@provider.net', phone: '+1 (555) 234-9981', role: 'ADMIN', joined: '2023-03-22', avatar: '' },
  { id: '#LUM-1054', name: 'Elena Rodriguez', email: 'elena.rod@mail.com', phone: '+1 (555) 661-0022', role: 'CUSTOMER', joined: '2023-12-30', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQPJU_uFiuJdnJUK6iVy27MXnEG4iVS7ouE55t8PWcraLJ5VaYziUuFTtKzDaI-YiYkQQu92YX3aBJCThYhXSIU0JgvCTp4oX2OKDToLHcaW7nF9-27Ut7r5u5GwYXz8HBKcbf-OLz-FR4ErnIo2025VWhtZ2lBJTeZwZL6OoWt_XMhdjG_LExsuDybPhp0YRzS_MuGD-GiodhsSJrhcEBfdRKEFETdt1LRP1IDaHPbR1pseQbGXKmx8vbsAf06jlJogS2sBhBfRs' },
  { id: '#LUM-7731', name: 'James Wilson', email: 'j.wilson@fastmail.com', phone: '+1 (555) 443-8821', role: 'CUSTOMER', joined: '2024-02-14', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDePBpIGd-3-gDqA39FBzhtfjT5YsxI18jbnlL1I2pvWW5CLSQ3Smd3dgWj125KZBKBQeIwmUnIyDClH53OS5J1zmJFJRqgmABqfRhZjl08JgMadyYCUvCvvycGFF-FGGbeWjjimIs_9PdiEjghqJAVLSMX9ddkMyWCmPhqFXlDDKqqP-ceSrl91DA-rbt1viRXfEgCnmVsifyue_zi_6F6zojh2MrF2OddoR04wWmJ14SjFSViAJju8N8huaA55R1LWfHukzLY0ns' },
];

export const movies = [
  {
    id: 1,
    title: 'Interstellar',
    release: '2014-11-07',
    status: 'Showing',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEmPHyN3o_LoR1NC1oKvC1hiMGmGcH9kjpk0HGdSEOhfnQoC-xWfdJRSefsLKfbqEho-JOSqYszgYA6ycfM5TQTsg9ASrLnj1Or9hcjRKqeKj-4Qe8s6gpc8g5ld2e-JIcvmu36dWdWSExbguIA1zmv_AG-JKBluUIDZrGE48f6c19A3GJ58QKkxomAxDXoTXIG708S_EKrBr1wLnzGM3zEU1UibkkiqlCh_IaRZdZkp7wLQpM3Z12tfOrwfX_etL4BEryftra4HY',
    duration: 169,
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    description: 'Một hành trình xuyên không gian để cứu lấy tương lai nhân loại.',
  },
  {
    id: 2,
    title: 'The Batman',
    release: '2022-03-04',
    status: 'Upcoming',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCs4Oe-76M758jIsNckJZ88ZhE3GHNbTBS0us2NHLorPtBSsXvoXeByCh_diFKjl0BW-14dhSlL1Eg1Zsy-URMlTptEm1bgNsAh2mdKTV-H27LlxeFw7a8jaPxsFvsllUI6YJksDYncpT3wtLFJGr6giLuYIrYm68Wk8JIvJ2vFOwaBnzo5VgA_YbBVoG2d4TLWTOkPqcXZBX74Hr2cJQDn1AQvdPy8oe3GFCk8ZRY0WL9gGeHu13CpxlqqXpwh0R8Hgls31xA3cWU',
    duration: 176,
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    description: 'Người Dơi đối đầu tội ác trong thành phố chìm bóng tối.',
  },
  {
    id: 3,
    title: 'Dune: Part Two',
    release: '2024-03-01',
    status: 'Showing',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChUUNKThyvXSro4iAKUW4--hx5sO6HKqe9JcMxHjUqcv6cxjmp2DBIeGNpc62evqglvu6xUGI9wH7d96575X46E34GcvlWrHGCcJ-2v07uw2iY-wfRD1L2XVpcTemxoaj8YdDLJUYlV52_f3brKFJNc9wBJGVJFx_uLDuDWh6SRn1CLVwbdDm4eujmdbO1n0iZ7QjDJ8pk3ft8zEa0hIjsECtTufBtQ_2nsEF1YLnhWIWLP5R51Q4YQDE5jLRRi1ksKNswXKypp4k',
    duration: 166,
    trailerUrl: 'https://www.youtube.com/watch?v=n9xhJrPXop4',
    description: 'Khám phá những bí mật mới trên hành tinh khắc nghiệt với tham vọng lớn lao.',
  },
  {
    id: 4,
    title: 'The Godfather',
    release: '1972-03-24',
    status: 'Archived',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJvnwSIbqGLdytE6IS9ixEgr-z5kIo8a4TNkknZ84mfcPxyMa099O0bYbgbe9y0peyu2czYOx6h4OsrufzkKluPck_eDRVU8mNFgzNtvwCFmkV2uko_fKAvlZWaH34Quzsjh-Qmp1rcNnL52PyyYDTGTmrOvxajpusTY0w1MPF6p6efo-J2Fe-ZavK0YyDE-VoYAAqdGLuQKI3Jo4rm7jfXmce1YAvo_cwALb0IHI0CuhApsxdyfWR_5U22pEtuQDer9jaP9OECTM',
    duration: 175,
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
    description: 'Câu chuyện quyền lực và lòng trung thành trong thế giới mafia.',
  },
];

export const bookings = [
  { movie: 'Midnight Echoes', user: 'Sarah Jenkins', datetime: 'Oct 24, 2024 · 19:30', amount: '$24.50', status: 'Confirmed' },
  { movie: 'The Last Neon', user: 'David Chen', datetime: 'Oct 24, 2024 · 21:00', amount: '$18.00', status: 'Pending' },
  { movie: 'Desert Mirage', user: 'Maria Garcia', datetime: 'Oct 23, 2024 · 18:15', amount: '$32.00', status: 'Confirmed' },
  { movie: 'Ocean\'s Whispers', user: 'James Wilson', datetime: 'Oct 23, 2024 · 22:45', amount: '$15.50', status: 'Cancelled' },
];

export type RoomRow = {
  id: number;
  name: string;
  cinema_name: string;
};

export const roomRowsSeed: RoomRow[] = [
  { id: 1, name: 'Phòng 1', cinema_name: 'Lumière Central' },
  { id: 2, name: 'Phòng 2', cinema_name: 'Lumière Central' },
  { id: 3, name: 'Phòng VIP', cinema_name: 'Lumière Waterfront' },
];

export const ticketRows = [
  {
    booking_id: 1,
    user_id: 2,
    user_name: 'Nguyen Van A',
    movie_id: 1,
    movie_title: 'Interstellar',
    showtime_id: 1,
    start_time: '2026-04-10 19:30:00',
    seats: 'A5, A6',
    total_price: 180000,
    discount_code: 'SUMMER20',
    discount_amount: 20000,
    status: 'PAID', // PENDING | PAID | CANCELLED
    created_at: '2026-04-05 21:30:00',
  },
  {
    booking_id: 2,
    user_id: 3,
    user_name: 'Tran Thi B',
    movie_id: 2,
    movie_title: 'The Batman',
    showtime_id: 2,
    start_time: '2026-04-11 20:00:00',
    seats: 'C3',
    total_price: 90000,
    discount_code: '',
    discount_amount: 0,
    status: 'PENDING',
    created_at: '2026-04-05 22:10:00',
  },
];