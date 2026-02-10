import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    User, LogOut, FileText,
    Utensils, Beaker, Eye, Search, Layers, Waves
} from 'lucide-react';
import logo from '@/assets/aqua-nexus-logo.png';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const activities = [
        { name: 'Feed', icon: Utensils, route: '/user/activity/feed', color: 'bg-orange-100 text-orange-600' },
        { name: 'Treatment', icon: Beaker, route: '/user/activity/treatment', color: 'bg-blue-100 text-blue-600' },
        { name: 'Water Quality', icon: Waves, route: '/user/activity/water', color: 'bg-cyan-100 text-cyan-600' },
        { name: 'Animal Quality', icon: Search, route: '/user/activity/animal', color: 'bg-rose-100 text-rose-600' },
        { name: 'Stocking', icon: Layers, route: '/user/activity/stocking', color: 'bg-emerald-100 text-emerald-600' },
        { name: 'Observation', icon: Eye, route: '/user/activity/observation', color: 'bg-purple-100 text-purple-600' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/user/login');
    };

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="ocean-gradient p-4 sm:p-6 pb-12 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg brightness-200 grayscale-0 inverted" />
                        <span className="text-white font-bold text-xl">
                            {user.hatchery_name || 'My Farm'}
                        </span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-12 h-12 rounded-full p-0 bg-white/20 hover:bg-white/30 text-white">
                                <User className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                                <User className="mr-2 h-4 w-4" /> Personal Info
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-6 text-white/90">
                    <p className="text-sm uppercase tracking-wider opacity-80">{user.role}</p>
                    <h2 className="text-2xl font-bold">Hello, {user.name}</h2>
                </div>
            </div>

            {/* Main Grid */}
            <div className="px-4 -mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    {/* 6 Activity Icons */}
                    {activities.map((act) => (
                        <Button
                            key={act.name}
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center gap-3 bg-card border-0 shadow-md hover:shadow-xl hover:bg-card/90 transition-all rounded-2xl"
                            onClick={() => navigate(act.route)}
                        >
                            <div className={`p-3 rounded-full ${act.color}`}>
                                <act.icon className="w-8 h-8" />
                            </div>
                            <span className="font-semibold text-foreground text-sm sm:text-base text-center break-words w-full px-1">
                                {act.name}
                            </span>
                        </Button>
                    ))}

                    {/* 7th Icon: Daily Consolidated Report */}
                    <Button
                        variant="outline"
                        className="h-32 flex flex-col items-center justify-center gap-3 bg-card border-0 shadow-md hover:shadow-xl hover:bg-card/90 transition-all rounded-2xl"
                        onClick={() => navigate('/user/daily-report')}
                    >
                        <div className="p-3 rounded-full bg-slate-100 text-slate-700">
                            <FileText className="w-8 h-8" />
                        </div>
                        <span className="font-semibold text-foreground text-sm sm:text-base text-center break-words w-full px-1">
                            Daily Report
                        </span>
                    </Button>

                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
