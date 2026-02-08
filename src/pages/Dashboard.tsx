import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Mail, Phone, MapPin, Building2, ClipboardList } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';
import ActivityList from '@/components/ActivityList';
import { toast } from 'sonner';
import logo from '@/assets/aqua-nexus-logo.png';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activities, deleteActivity } = useActivities();

  if (!user) return null;

  const profileItems = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: Building2, label: 'Farm', value: user.farm },
    { icon: MapPin, label: 'Location', value: user.location },
  ];

  const handleDelete = (id: string) => {
    deleteActivity(id);
    toast.success('Activity deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="ocean-gradient p-4 sm:p-6 pb-12 rounded-b-3xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-primary-foreground font-semibold">Aqua Nexus</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); navigate('/login'); }}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="text-primary-foreground">
            <h1 className="text-lg font-bold">{user.name}</h1>
            <p className="text-sm opacity-80">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 -mt-6 pb-8 space-y-4">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Profile Details</h2>
          <div className="space-y-4">
            {profileItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Button
          onClick={() => navigate('/record-activity')}
          className="w-full h-14 text-base font-semibold rounded-2xl gap-2"
        >
          <ClipboardList className="w-5 h-5" />
          Record Activity
        </Button>

        {/* Activity History */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recorded Activities</h2>
            </div>
            {activities.length > 0 && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {activities.length}
              </span>
            )}
          </div>
          <ActivityList activities={activities} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
