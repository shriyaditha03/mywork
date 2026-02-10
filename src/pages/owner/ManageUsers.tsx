import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, User, UserPlus, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfile {
    id: string;
    username: string;
    role: string;
    full_name: string;
    auth_user_id: string | null;
}

const ManageUsers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.hatchery_id) {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('hatchery_id', user!.hatchery_id)
                .neq('role', 'owner') // Don't show owner to prevent self-delete
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string, username: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            toast.success(`User "${username}" removed successfully`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Failed to remove user');
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 pb-20">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/owner/dashboard')} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                    </Button>
                    <Button onClick={() => navigate('/owner/add-user')}>
                        <UserPlus className="w-4 h-4 mr-2" /> Add New User
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold">Manage Users</h1>
                    <p className="text-muted-foreground">Oversee your hatchery staff</p>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-2xl border border-dashed">
                        <User className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="text-lg font-semibold">No Users Found</h3>
                        <p className="text-muted-foreground mb-4">You haven't added any staff members yet.</p>
                        <Button onClick={() => navigate('/owner/add-user')}>Add First User</Button>
                    </div>
                ) : (
                    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                        <div className="divide-y">
                            {users.map(u => (
                                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.auth_user_id ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{u.username}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="capitalize px-2 py-0.5 bg-secondary rounded-full border">{u.role}</span>
                                                {u.auth_user_id ? (
                                                    <span className="text-green-600 flex items-center gap-1">● Active</span>
                                                ) : (
                                                    <span className="text-yellow-600 flex items-center gap-1">○ Pending Activation</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove User?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove <strong>{u.username}</strong>?
                                                    This action cannot be undone. They will lose access immediately.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(u.id, u.username)} className="bg-destructive hover:bg-destructive/90">
                                                    Remove User
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
