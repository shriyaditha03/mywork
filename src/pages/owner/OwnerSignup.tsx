import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Waves, Loader2 } from 'lucide-react';

const OwnerSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const [formData, setFormData] = useState({
        hatcheryName: '',
        location: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!formData.username || !formData.password || !formData.hatcheryName) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);

            // 1. Sign Up Auth User
            // Use provided email or construct a dummy one if allowed/configured
            const emailToUse = formData.email || `${formData.username.toLowerCase().replace(/\s+/g, '')}@shrimpit.local`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: emailToUse,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        full_name: formData.username, // Default name to username
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Signup failed");

            const userId = authData.user.id;

            // 2. Create Hatchery
            const { data: hatcheryData, error: hatcheryError } = await supabase
                .from('hatcheries')
                .insert([{
                    name: formData.hatcheryName,
                    location: formData.location,
                    created_by: userId,
                }])
                .select()
                .single();

            if (hatcheryError) throw hatcheryError;

            // 3. Create Owner Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    // id: undefined, // REMOVED: Do not send ID, let DB generate it
                    auth_user_id: userId,
                    username: formData.username,
                    full_name: formData.username,
                    role: 'owner',
                    hatchery_id: hatcheryData.id,
                    email: emailToUse,
                    phone: formData.phone,
                }]);

            if (profileError) {
                console.error("Profile creation error:", profileError);
                // Extract specific message if possible
                const errorMsg = profileError.message || profileError.details || "Unknown DB Error";
                throw new Error(`Failed to create profile: ${errorMsg}`);
            }

            toast.success("Hatchery Owner Account Created!");
            navigate('/owner/login');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen ocean-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Waves className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold"><span className="text-orange-500">Shrimp</span><span className="text-rose-500">it</span></span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Owner Registration</h1>
                    <p className="text-muted-foreground text-sm">Create your Hatchery Account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hatcheryName">Hatchery Name *</Label>
                            <Input id="hatcheryName" value={formData.hatcheryName} onChange={handleChange} placeholder="e.g. Sunrise Aqua" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input id="location" value={formData.location} onChange={handleChange} placeholder="e.g. Nellore" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input id="username" value={formData.username} onChange={handleChange} placeholder="e.g. raju_owner" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="For recovery" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="+91..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPass ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-muted-foreground">
                                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg mt-4" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Hatchery'}
                    </Button>

                    <div className="text-center mt-4">
                        <Link to="/owner/login" className="text-sm text-primary hover:underline">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OwnerSignup;
