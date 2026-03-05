import { Cpu } from "lucide-react"; // Opsional: Ikon untuk logo agar lebih techy

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
            <div className="flex items-center justify-between w-full max-w-7xl px-8 py-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">

                {/* Logo Section */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                        <Cpu size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Wesclic<span className="text-indigo-400"> Neotech</span>
                    </h1>
                </div>

                {/* Navigation Links */}
                <ul className="hidden md:flex items-center gap-8">
                    {["Home", "Prediction", "About"].map((item) => (
                        <li key={item}>
                            <a
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                            </a>
                        </li>
                    ))}
                </ul>

                {/* CTA Button in Navbar */}
                <div className="flex items-center gap-4">
                    <button className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        Sign In
                    </button>
                    <button className="px-5 py-2.5 bg-white text-slate-950 text-sm font-bold rounded-xl hover:bg-indigo-400 hover:text-white transition-all active:scale-95">
                        Get Started
                    </button>
                </div>

            </div>
        </nav>
    );
}