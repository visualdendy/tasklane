import Link from 'next/link';
import { Layout, CheckCircle2, Zap, Shield, Users, ArrowRight, Github } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Layout size={24} />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">TaskLane</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Features</Link>
                    <Link href="#solutions" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Solutions</Link>
                    <Link href="#pricing" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors">Log in</Link>
                    <Link href="/auth/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        Get Started Free
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
                    <Zap size={14} />
                    Now with Next.js 16 Support
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 max-w-4xl mx-auto tracking-tight">
                    Organize your workflow, <span className="text-blue-600">the smart way.</span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    TaskLane helps teams move work forward. Collaborate, manage projects, and reach new productivity peaks from high-rise to the home office.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 text-lg">
                        Start Building Your Board
                        <ArrowRight size={20} />
                    </Link>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-lg">
                        <Github size={20} />
                        Star on GitHub
                    </button>
                </div>

                {/* Mockup Preview */}
                <div className="mt-20 relative px-4">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full max-w-4xl mx-auto -z-10"></div>
                    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform group hover:scale-[1.02] transition-all duration-700">
                        <div className="bg-slate-100 dark:bg-slate-800 h-10 w-full rounded-t-2xl flex items-center px-4 gap-2 mb-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="ml-4 flex-1 max-w-sm h-5 bg-white dark:bg-slate-700 rounded-md"></div>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&q=80&w=2000"
                            alt="TaskLane Dashboard"
                            className="w-full h-auto rounded-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="bg-white dark:bg-slate-900 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Everything you need to ship</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Powerful features designed to keep your team aligned and productive without the bloat.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all group">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                <Layout size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Kanban Boards</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Visualize your work and move tasks through customizable lists with a smooth drag and drop interface.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all group">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Role-based Access</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Secure your intellectual property with granular permissions for admins, members, and guest viewers.</p>
                        </div>

                        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all group">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-time Collab</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Work together on cards, checklists, and comments with instant updates for everyone on the team.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950 pt-20 pb-10 border-t border-slate-200 dark:border-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8">
                        <div className="flex items-center gap-2">
                            <Layout className="text-blue-600" size={24} />
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">TaskLane</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Privacy</Link>
                            <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Terms</Link>
                            <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Support</Link>
                            <Link href="#" className="text-sm text-slate-500 hover:text-blue-600 font-medium">Contact</Link>
                        </div>
                    </div>
                    <div className="text-center text-slate-500 text-xs font-medium">
                        © 2025 TaskLane. Built with 💎 and Next.js 16.
                    </div>
                </div>
            </footer>
        </div>
    );
}
