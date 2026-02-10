import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Waves, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { loginWithUsername } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await loginWithUsername(username, password, 'staff');

        if (result.error) {
            toast.error(result.error.message || 'Login failed');
            setLoading(false);
        } else {
            toast.success('Welcome back!');
            navigate('/user/dashboard');
        }
    };

    return (
        <div className="min-h-screen ocean-gradient flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Waves className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">User Login</h1>
                    <p className="text-muted-foreground text-sm">Farm Staff Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="h-12"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="h-12 pr-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In'}
                    </Button>
                </form>

                <div className="text-center mt-6 space-y-2 border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                        First time?{' '}
                        <Link to="/user/signup" className="text-primary hover:underline font-medium">
                            Activate your account
                        </Link>
                    </p>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                        <Link to="/owner/login" className="hover:text-primary">Owner Portal</Link>
                        <span className="text-gray-300">|</span>
                        <Link to="/login" className="hover:text-primary">Manager Portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
