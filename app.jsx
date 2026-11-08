const { useMemo, useState } = React;

const artworkStyles = {
    camera: "from-sky-100 to-blue-50",
    laptop: "from-indigo-100 to-violet-50",
    projector: "from-amber-100 to-orange-50",
    tripod: "from-rose-100 to-pink-50",
    audio: "from-emerald-100 to-teal-50",
    speaker: "from-fuchsia-100 to-purple-50",
};

function Icon({ name, className = "h-5 w-5" }) {
    const paths = {
        home: <><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9Z" /></>,
        grid: <><path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v6H4zM14 15h6v6h-6z" /></>,
        history: <><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5m4-1v5l3 2" /></>,
        bag: <><path d="M8 7V5.8A2.8 2.8 0 0 1 10.8 3h2.4A2.8 2.8 0 0 1 16 5.8V7m-11 0h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm4 0v3m6-3v3" /></>,
        search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
        plus: <><path d="M12 5v14m-7-7h14" /></>,
        close: <><path d="m6 6 12 12M18 6 6 18" /></>,
        arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
        check: <><path d="m9 12.75 2.25 2.25L15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></>,
        calendar: <><path d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z" /></>,
        spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
    };

    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    );
}

function App() {
    const equipment = window.initialEquipment || [];
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Semua");
    const [cart, setCart] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [toast, setToast] = useState("");
    const [loan, setLoan] = useState(null);
    const [loanStart, setLoanStart] = useState("");
    const [loanEnd, setLoanEnd] = useState("");
    const [loanNote, setLoanNote] = useState("");

    const categories = useMemo(() => ["Semua", ...new Set(equipment.map(item => item.kategori))], [equipment]);
    const visibleEquipment = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("id");
        return equipment.filter(item => {
            const matchesCategory = category === "Semua" || item.kategori === category;
            const matchesSearch = `${item.nama} ${item.kategori} ${item.deskripsi}`.toLocaleLowerCase("id").includes(normalizedQuery);
            return matchesCategory && matchesSearch;
        });
    }, [equipment, query, category]);
    const cartEntries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
    const cartCount = cartEntries.reduce((total, [, quantity]) => total + quantity, 0);
    const totalAvailable = equipment.reduce((total, item) => total + Math.max(0, item.stok - item.dipinjam), 0);
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    function showToast(message) {
        setToast(message);
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => setToast(""), 2600);
    }

    function updateQuantity(id, amount) {
        const item = equipment.find(entry => entry.id === Number(id));
        if (!item) return;
        const nextQuantity = (cart[id] || 0) + amount;
        if (nextQuantity > Math.max(0, item.stok - item.dipinjam)) {
            showToast("Jumlah sudah mencapai stok yang tersedia.");
            return;
        }
        setCart(current => {
            const next = { ...current };
            if (nextQuantity <= 0) delete next[id];
            else next[id] = nextQuantity;
            return next;
        });
    }

    function submitRequest(event) {
        event.preventDefault();
        if (!cartCount) return;
        if (loanEnd < loanStart) {
            showToast("Tanggal kembali harus sama atau setelah tanggal pinjam.");
            return;
        }
        setLoan({ count: cartCount, start: loanStart, end: loanEnd });
        setCart({});
        setDialogOpen(false);
        setLoanNote("");
        showToast("Pengajuan demo berhasil dibuat.");
    }

    return (
        <div className="min-h-screen lg:flex">
            <aside className="hidden w-[250px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-7 lg:flex lg:flex-col">
                <a href="#beranda" className="mb-12 flex items-center gap-3 px-2" aria-label="Pinjam.in beranda">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Icon name="bag" /></span>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">pinjam<span className="text-blue-600">.in</span></span>
                </a>
                <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Menu utama</p>
                <nav className="space-y-1.5" aria-label="Navigasi utama">
                    <a href="#beranda" className="flex items-center gap-3 rounded-xl bg-blue-50 px-3.5 py-3 text-sm font-semibold text-blue-700"><Icon name="home" className="h-[18px] w-[18px]" />Beranda</a>
                    <a href="#katalog" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><Icon name="grid" className="h-[18px] w-[18px]" />Katalog alat</a>
                    <a href="#riwayat" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><Icon name="history" className="h-[18px] w-[18px]" />Riwayat peminjaman</a>
                </nav>
                <div className="mt-auto rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="spark" /></div>
                    <p className="text-sm font-bold text-slate-800">Butuh bantuan?</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Hubungi petugas jika ada kendala peminjaman.</p>
                    <a href="mailto:petugas@example.com" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">Hubungi petugas <span aria-hidden="true">→</span></a>
                </div>
            </aside>

            <main id="beranda" className="min-w-0 flex-1">
                <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 xl:px-10">
                        <a href="#beranda" className="flex items-center gap-2.5 lg:hidden" aria-label="Pinjam.in beranda">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white"><Icon name="bag" /></span>
                            <span className="text-lg font-extrabold tracking-tight text-slate-900">pinjam<span className="text-blue-600">.in</span></span>
                        </a>
                        <div className="hidden text-sm text-slate-500 lg:block">Portal peminjaman <span className="mx-2 text-slate-300">/</span> <span className="font-semibold text-slate-800">Beranda</span></div>
                        <div className="flex items-center gap-3 sm:gap-5">
                            <button onClick={() => setDialogOpen(true)} type="button" className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600" aria-label="Lihat daftar pengajuan">
                                <Icon name="bag" />
                                {cartCount > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-5 text-white">{cartCount}</span>}
                            </button>
                            <span className="hidden h-8 w-px bg-slate-200 sm:block"></span>
                            <div className="flex items-center gap-2.5">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">AD</div>
                                <div className="hidden sm:block"><p className="text-sm font-bold leading-5 text-slate-800">Alya Dwi</p><p className="text-xs text-slate-400">Peminjam</p></div>
                                <span className="hidden text-slate-400 sm:block" aria-hidden="true">⌄</span>
                            </div>
                        </div>
                    </div>
                    <nav className="flex gap-5 overflow-x-auto border-t border-slate-100 px-5 py-2.5 text-xs font-medium text-slate-500 scrollbar-hide lg:hidden" aria-label="Navigasi mobile">
                        <a href="#beranda" className="whitespace-nowrap text-blue-700">Beranda</a><a href="#katalog" className="whitespace-nowrap">Katalog alat</a><a href="#riwayat" className="whitespace-nowrap">Riwayat peminjaman</a>
                    </nav>
                </header>

                <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10">
                    <section className="relative isolate overflow-hidden rounded-[26px] bg-gradient-to-br from-[#175be8] via-[#286cf1] to-[#4d82f4] px-6 py-7 text-white shadow-xl shadow-blue-900/10 sm:px-9 sm:py-9" aria-labelledby="welcomeTitle">
                        <div className="absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full border-[38px] border-white/10"></div>
                        <div className="absolute bottom-[-108px] right-[23%] -z-10 h-52 w-52 rounded-full bg-cyan-300/15 blur-2xl"></div>
                        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[44%] soft-grid opacity-40 md:block"></div>
                        <div className="relative max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>Portal peminjaman alat</div>
                            <h1 id="welcomeTitle" className="text-[26px] font-extrabold tracking-tight sm:text-3xl">Halo, Alya! <span aria-hidden="true">👋</span></h1>
                            <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100 sm:text-[15px]">Mau pinjam alat untuk kegiatanmu? Temukan alat yang kamu butuhkan dan ajukan peminjaman dengan mudah.</p>
                            <a href="#katalog" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50">Jelajahi katalog <Icon name="arrow" className="h-4 w-4" /></a>
                        </div>
                        <div className="float-box absolute bottom-5 right-8 hidden text-[94px] drop-shadow-lg lg:block" aria-hidden="true">📦</div>
                        <div className="absolute right-8 top-7 hidden rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm xl:block">
                            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-blue-100">Peminjaman mudah</p><p className="mt-1 text-sm font-bold">Pilih · Ajukan · Gunakan</p>
                        </div>
                    </section>

                    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Ringkasan alat">
                        <Stat icon="grid" title="Jenis alat" value={equipment.length} suffix="jenis" color="blue" />
                        <Stat icon="check" title="Unit tersedia" value={totalAvailable} suffix="unit" color="emerald" />
                        <Stat icon="calendar" title="Peminjaman aktif" value={loan ? 1 : 0} suffix="transaksi" color="violet" />
                    </section>

                    <section id="katalog" className="mt-9 scroll-mt-28" aria-labelledby="catalogTitle">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Pilih kebutuhanmu</p><h2 id="catalogTitle" className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">Katalog alat</h2><p className="mt-1 text-sm text-slate-500">Lihat alat yang tersedia dan ajukan peminjaman.</p></div>
                            <label className="relative block w-full sm:max-w-[290px]">
                                <span className="sr-only">Cari alat</span><Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                                <input value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="Cari nama alat..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
                            </label>
                        </div>
                        <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Filter kategori">
                            {categories.map(option => <button key={option} type="button" onClick={() => setCategory(option)} aria-pressed={category === option} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${category === option ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"}`}>{option}</button>)}
                        </div>
                        {visibleEquipment.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {visibleEquipment.map(item => {
                                const available = Math.max(0, item.stok - item.dipinjam);
                                return <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm shadow-slate-900/[.025] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/[.06]">
                                    <div className={`relative grid h-40 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${artworkStyles[item.warna] || "from-slate-100 to-slate-50"}`}>
                                        <span className="absolute -right-5 -top-8 h-32 w-32 rounded-full border-[18px] border-white/35"></span>
                                        <span className="relative text-7xl drop-shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:scale-105">{item.ikon}</span>
                                        {item.label && available > 0 && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm">{item.label}</span>}
                                    </div>
                                    <div className="px-1 pb-1 pt-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[.12em] text-blue-600">{item.kategori}</p>
                                        <h3 className="mt-1 truncate text-[15px] font-bold text-slate-900">{item.nama}</h3>
                                        <p className="mt-1.5 min-h-10 text-xs leading-5 text-slate-500">{item.deskripsi}</p>
                                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${available > 0 ? "bg-emerald-500" : "bg-rose-500"}`}></span>{available > 0 ? `${available} unit tersedia` : "Sedang habis"}</span>
                                            <button type="button" disabled={available < 1} onClick={() => { updateQuantity(item.id, 1); if ((cart[item.id] || 0) < available) showToast(`${item.nama} ditambahkan ke daftar.`); }} aria-label={`Tambah ${item.nama} ke daftar pinjaman`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 enabled:bg-blue-50 enabled:text-blue-700 enabled:hover:bg-blue-600 enabled:hover:text-white"><Icon name="plus" className="h-4 w-4" />Tambah</button>
                                        </div>
                                    </div>
                                </article>;
                            })}
                        </div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><span className="text-4xl" aria-hidden="true">🔎</span><h3 className="mt-3 font-bold text-slate-800">Alat tidak ditemukan</h3><p className="mt-1 text-sm text-slate-500">Coba kata kunci atau kategori yang lain.</p></div>}
                    </section>

                    <section id="riwayat" className="mt-8 rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm shadow-slate-900/[.02] sm:flex sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600"><Icon name="history" /></span><div><h3 className="text-sm font-bold text-slate-800">Riwayat peminjaman</h3><p className="mt-1 text-xs leading-5 text-slate-500">{loan ? `${loan.count} unit · ${loan.start} sampai ${loan.end}` : "Pengajuan dan status peminjamanmu akan tampil di sini."}</p></div></div>
                        <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold sm:mt-0 ${loan ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{loan ? "Menunggu persetujuan (demo)" : "Belum ada peminjaman"}</span>
                    </section>
                    <footer className="pb-3 pt-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} Pinjam.in <span className="mx-1.5">·</span> Sistem Peminjaman Alat</footer>
                    <p className="pb-3 text-center text-[11px] text-slate-400">Tampilan demo · data dan pengajuan belum terhubung ke database.</p>
                </div>
            </main>

            {dialogOpen && <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) setDialogOpen(false); }}>
                <section role="dialog" aria-modal="true" aria-labelledby="requestTitle" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
                    <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-blue-600">Pengajuan alat</p><h2 id="requestTitle" className="mt-1 text-xl font-extrabold text-slate-900">Daftar peminjaman</h2></div><button onClick={() => setDialogOpen(false)} type="button" className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Tutup dialog"><Icon name="close" /></button></div>
                    <form onSubmit={submitRequest}>
                        {cartEntries.length ? <div className="mt-5 max-h-56 space-y-2 overflow-y-auto">{cartEntries.map(([id, quantity]) => {
                            const item = equipment.find(entry => entry.id === Number(id));
                            if (!item) return null;
                            return <div key={id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.nama}</p><p className="mt-0.5 text-xs text-slate-500">{quantity} unit · {item.kategori}</p></div><div className="flex shrink-0 items-center gap-1"><button onClick={() => updateQuantity(id, -1)} type="button" aria-label={`Kurangi jumlah ${item.nama}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-base text-slate-600 hover:bg-slate-50">−</button><span className="w-6 text-center text-xs font-bold text-slate-700">{quantity}</span><button onClick={() => updateQuantity(id, 1)} type="button" aria-label={`Tambah jumlah ${item.nama}`} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-base text-slate-600 hover:bg-slate-50">+</button></div></div>;
                        })}</div> : <p className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">Belum ada alat di daftar. Pilih alat dari katalog terlebih dahulu.</p>}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <label className="text-xs font-semibold text-slate-600">Tanggal pinjam<input value={loanStart} onChange={event => setLoanStart(event.target.value)} min={localToday} type="date" required className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                            <label className="text-xs font-semibold text-slate-600">Rencana kembali<input value={loanEnd} onChange={event => setLoanEnd(event.target.value)} min={loanStart || localToday} type="date" required className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label>
                        </div>
                        <label className="mt-4 block text-xs font-semibold text-slate-600">Catatan <span className="font-normal text-slate-400">(opsional)</span><textarea value={loanNote} onChange={event => setLoanNote(event.target.value)} rows="2" maxLength="300" placeholder="Contoh: untuk kegiatan dokumentasi..." className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"></textarea></label>
                        <button type="submit" disabled={!cartCount} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">Ajukan peminjaman <Icon name="arrow" className="h-4 w-4" /></button>
                        <p className="mt-3 text-center text-[11px] text-slate-400">Pengajuan ini hanya simulasi dan belum disimpan ke database.</p>
                    </form>
                </section>
            </div>}
            {toast && <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">{toast}</div>}
        </div>
    );
}

function Stat({ icon, title, value, suffix, color }) {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        violet: "bg-violet-50 text-violet-600",
    };
    return <article className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[.02]">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${styles[color]}`}><Icon name={icon} className="h-6 w-6" /></span>
        <div><p className="text-xs font-medium text-slate-500">{title}</p><p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">{value}<span className="ml-1 text-sm font-semibold text-slate-400">{suffix}</span></p></div>
    </article>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
