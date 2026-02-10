import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';

const AddUser = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [farms, setFarms] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        username: '',
        role: 'worker',
        selectedFarms: [] as string[],
    });

    useEffect(() => {
        fetchFarms();
    }, [user]);

    const fetchFarms = async () => {
        if (!user?.hatchery_id) return;
        const { data } = await supabase
            .from('farms')
            .select('id, name')
            .eq('hatchery_id', user.hatchery_id);
        if (data) setFarms(data);
    };

    const handleFarmToggle = (farmId: string) => {
        setFormData(prev => {
            const selected = prev.selectedFarms.includes(farmId)
                ? prev.selectedFarms.filter(id => id !== farmId)
                : [...prev.selectedFarms, farmId];
            return { ...prev, selectedFarms: selected };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.hatchery_id) return;

        try {
            setLoading(true);

            // 1. Create Profile (Placeholder)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    username: formData.username.trim(),
                    role: formData.role,
                    hatchery_id: user.hatchery_id,
                    full_name: formData.username, // Default
                    // auth_user_id is NULL initially
                }])
                .select()
                .single();

            if (profileError) throw profileError;

            // 2. Assign Farm Access
            if (formData.selectedFarms.length > 0) {
                const accessData = formData.selectedFarms.map(farmId => ({
                    user_id: profileData.id,
                    farm_id: farmId
                }));

                const { error: accessError } = await supabase
                    .from('farm_access')
                    .insert(accessData);

                if (accessError) throw accessError;
            }

            toast.success(`User "${formData.username}" added successfully!`);
            navigate('/owner/dashboard');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 pb-20">
            <div className="max-w-md mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate('/owner/dashboard')} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                </Button>

                <div>
                    <h1 className="text-2xl font-bold">Add New User</h1>
                    <p className="text-muted-foreground">Create a user account and assign permissions</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-2xl shadow-sm border">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="e.g. farm_worker_1"
                            required
                        />
                        <p className="text-xs text-muted-foreground">User will claim this username on signup</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="worker">Worker</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Assign Farm Access</Label>
                        {farms.length === 0 ? (
                            <p className="text-sm text-yellow-600">No farms created yet.</p>
                        ) : (
                            <div className="grid gap-2">
                                {farms.map(farm => (
                                    <div key={farm.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-accent transition-colors">
                                        <Checkbox
                                            id={farm.id}
                                            checked={formData.selectedFarms.includes(farm.id)}
                                            onCheckedChange={() => handleFarmToggle(farm.id)}
                                        />
                                        <label
                                            htmlFor={farm.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {farm.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !formData.username}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add User'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddUser;
