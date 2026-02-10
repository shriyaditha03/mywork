import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Users, ShieldCheck, Waves } from 'lucide-react';
import logo from '@/assets/aqua-nexus-logo.png';

const PortalSelection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen ocean-gradient flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12 text-white">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="Logo" className="w-24 h-24 rounded-2xl shadow-lg" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Welcome to <span className="text-orange-300">Shrimp</span><span className="text-rose-300">it</span></h1>
                    <p className="text-xl opacity-90">Select your portal to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Owner Portal Card */}
                    <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:scale-105 transition-transform cursor-pointer text-center group" onClick={() => navigate('/owner/login')}>
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                            <ShieldCheck className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Owner Portal</h2>
                        <p className="text-gray-500 mb-6">For Hatchery Owners</p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Login as Owner</Button>
                    </div>

                    {/* User/Staff Portal Card */}
                    <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:scale-105 transition-transform cursor-pointer text-center group" onClick={() => navigate('/user/login')}>
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
                            <Users className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Staff Portal</h2>
                        <p className="text-gray-500 mb-6">For Technicians & Workers</p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Login as Staff</Button>
                    </div>

                    {/* Admin/Manager Portal Card */}
                    <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:scale-105 transition-transform cursor-pointer text-center group" onClick={() => navigate('/login')}>
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                            <User className="w-10 h-10 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Manager Portal</h2>
                        <p className="text-gray-500 mb-6">Legacy System Access</p>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">Login as Manager</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortalSelection;
