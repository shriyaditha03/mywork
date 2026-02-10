import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Waves, Loader2, UserCheck } from 'lucide-react';

const UserSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
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

        try {
            setLoading(true);

            // 1. Check if profile exists and is unclaimed (Client-side check to be user friendly, RLS enforces security)
            // Note: RLS might prevent reading if not owned, but we have a policy for this? 
            // Actually my RLS "Claim profile" policy is for UPDATE.
            // My SELECT policy "Users can view own profile" relies on auth id.
            // So unauthenticated user cannot "check" if profile exists easily without a public endpoint.
            // We will skip the check and just try to SignUp + Update.

            // 2. Sign Up Auth User
            // Construct email from username
            const emailToUse = `${formData.username.toLowerCase().replace(/\s+/g, '')}@shrimpit.local`;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: emailToUse,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        full_name: formData.username,
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Signup failed");

            // 3. Claim the Profile using RPC (Handles RLS + Case-insensitivity)
            console.log("Activating profile for:", { username: formData.username.trim(), user_id: authData.user.id });
            const { data: wasClaimed, error: claimError } = await supabase
                .rpc('activate_user_profile', {
                    username_input: formData.username.trim(),
                    user_id_input: authData.user.id,
                    email_input: emailToUse
                });

            if (claimError || !wasClaimed) {
                console.error("Activation error:", claimError);
                toast.error("Account Activation Failed: Could not find your assigned username or it's already active.");
                return;
            }

            toast.success("Account Activated!");
            navigate('/user/login');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Activation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen ocean-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Activate Account</h1>
                    <p className="text-muted-foreground text-sm text-center">
                        Enter the username assigned by your Owner to create your password.
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Assigned Username</Label>
                        <Input id="username" value={formData.username} onChange={handleChange} placeholder="e.g. worker1" required className="bg-muted/30" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Create Password</Label>
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
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg mt-2" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Activate & Login'}
                    </Button>

                    <div className="text-center mt-4">
                        <Link to="/user/login" className="text-sm text-primary hover:underline">
                            Already activated? Login here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserSignup;
