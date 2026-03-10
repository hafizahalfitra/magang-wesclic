import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PredictionForm from "../components/PredictionForm";

// Komponen Footer baru yang disesuaikan
function Footer() {
  return (
    <footer className="bg-[#0A3D2F] text-white pt-16 pb-8 px-6 md:px-12 mt-20">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Kolom 1: Logo & Deskripsi */}
        <div className="space-y-4">
          <img src="/logo.png" alt="Wesclic Logo" className="h-10 w-auto brightness-0 invert" />
          <p className="text-sm leading-relaxed text-white/90">
            <strong className="block text-white mb-2">We Make IT Better.</strong> 
            Kami hadir untuk menyederhanakan kompleksitas, mengubah ide menjadi inovasi, dan memastikan setiap teknologi yang kami bangun memberikan dampak nyata buat bisnis kamu.
          </p>
          <div className="flex gap-3 pt-2">
            {['WA', 'LI', 'IG'].map((social) => (
              <div key={social} className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-xs hover:bg-white/10 cursor-pointer">
                {social}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 2: Tautan Cepat */}
        <div>
          <h4 className="font-bold text-lg mb-6">Tautan Cepat</h4>
          <ul className="space-y-3 text-sm text-white/80">
            {['Tentang Kami', 'Layanan', 'Portofolio', 'Teknologi', 'Industri', 'Kontak'].map((item) => (
              <li key={item} className="hover:text-white cursor-pointer transition">{item}</li>
            ))}
          </ul>
        </div>

        {/* Kolom 3: Hubungi Kami */}
        <div>
          <h4 className="font-bold text-lg mb-6">Hubungi Kami</h4>
          <ul className="space-y-4 text-sm text-white/80">
            <li className="flex items-center gap-3">✉ info@wesclic.com</li>
            <li className="flex items-center gap-3">📞 0811 26464 97</li>
            <li className="flex items-center gap-3">📍 Yogyakarta, Indonesia</li>
          </ul>
        </div>
      </div>

      {/* Baris Bawah */}
      <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/60 gap-4">
        <p>© 2026 Wesclic Technology. Hak Cipta Dilindungi. | Dibuat dengan ❤️ di Indonesia</p>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Kebijakan Privasi</span>
          <span className="hover:text-white cursor-pointer">Syarat Layanan</span>
          <span className="hover:text-white cursor-pointer">Peta Situs</span>
        </div>
      </div>
    </footer>
  );
}


export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Hero />

      <section id="prediksi" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#13624C] md:text-4xl">Mulai Prediksi Gaji</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Masukkan data karyawan untuk mendapatkan estimasi gaji berdasarkan parameter yang telah ditentukan.
          </p>
        </div>
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#13624C]/15 bg-white p-6 shadow-lg md:p-8">
          <PredictionForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}