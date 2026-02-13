import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Calendar, User, Info, Filter, BarChart2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { formatIST, toIST, getTodayISTStr } from '@/lib/date-utils';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const OwnerActivityLogs = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(getTodayISTStr());

    useEffect(() => {
        if (user?.hatchery_id && type) {
            fetchLogs();
        }
    }, [user, type, selectedDate]);

    const fetchLogs = async () => {
        if (!type || !user?.hatchery_id) return;

        try {
            setLoading(true);
            const typeMap: Record<string, string> = {
                'feed': 'Feed',
                'treatment': 'Treatment',
                'water': 'Water Quality',
                'animal': 'Animal Quality',
                'stocking': 'Stocking',
                'observation': 'Observation'
            };
            const dbType = typeMap[type?.toLowerCase() || ''] || type;

            // Calculate 7-day range
            const endDate = endOfDay(new Date(selectedDate));
            const startDate = startOfDay(subDays(endDate, 6));

            const { data, error } = await supabase
                .from('activity_logs')
                .select(`
                    *,
                    profiles (
                        username,
                        full_name
                    ),
                    tanks (
                        name
                    ),
                    sections (
                        name
                    ),
                    farms (
                        name
                    )
                `)
                .eq('activity_type', dbType)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;
            setLogs(data || []);
        } catch (err: any) {
            console.error('Error fetching logs:', err);
            toast.error('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!logs.length) return { data: [], tanks: [] };

        const dataByDate: Record<string, any> = {};
        const locationKeys = new Set<string>();

        // 1. First pass: Get all unique location keys (Farm - Section - Tank)
        logs.forEach(log => {
            const farmName = log.farms?.name || 'Unknown Farm';
            const sectionName = log.sections?.name || 'Unknown Section';
            const tankName = log.tanks?.name || 'Unknown Tank';
            const locationKey = `${farmName} - ${sectionName} - ${tankName}`;
            locationKeys.add(locationKey);
        });
        const activeLocationsList = Array.from(locationKeys);

        // 2. Pre-fill last 7 days with all locations initialized to 0
        const end = toIST(selectedDate);
        for (let i = 6; i >= 0; i--) {
            const d = format(subDays(end, i), 'dd MMM');
            const entry: any = { date: d };
            activeLocationsList.forEach(loc => entry[loc] = 0);
            dataByDate[d] = entry;
        }

        // 3. Aggregate data
        logs.forEach(log => {
            const dateStr = formatIST(log.created_at, 'dd MMM');
            const farmName = log.farms?.name || 'Unknown Farm';
            const sectionName = log.sections?.name || 'Unknown Section';
            const tankName = log.tanks?.name || 'Unknown Tank';
            const locationKey = `${farmName} - ${sectionName} - ${tankName}`;

            if (!dataByDate[dateStr]) {
                dataByDate[dateStr] = { date: dateStr };
                activeLocationsList.forEach(loc => dataByDate[dateStr][loc] = 0);
            }

            let value = 0;
            const logData = log.data || {};
            const typeLower = type?.toLowerCase();

            if (typeLower === 'feed') {
                value = parseFloat(logData.feedQty) || 0;
            } else if (typeLower === 'treatment') {
                value = parseFloat(logData.treatmentDosage) || 0;
            } else if (typeLower === 'stocking') {
                value = parseFloat(logData.naupliiStocked) || 0;
            } else if (typeLower === 'observation') {
                value = parseFloat(logData.deadAnimals) || 0;
            } else if (typeLower === 'water') {
                value = parseFloat(logData.waterData?.pH) || 0;
            }

            dataByDate[dateStr][locationKey] += value;
        });

        return {
            data: Object.values(dataByDate),
            tanks: activeLocationsList
        };
    };

    const { data: chartData, tanks: activeTanks } = getChartData();

    // Diverse color palette for scalability
    const CHART_COLORS = [
        'var(--primary)', // Teal-ish
        '#6366f1', // Indigo
        '#f59e0b', // Amber
        '#10b981', // Emerald
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#f97316', // Orange
    ];

    // Create config for each tank
    const chartConfig: ChartConfig = {};
    activeTanks.forEach((tank, i) => {
        chartConfig[tank] = {
            label: tank,
            color: CHART_COLORS[i % CHART_COLORS.length],
        };
    });

    const formatData = (data: any) => {
        if (!data) return null;
        const entries = Object.entries(data).filter(([key]) => !['date', 'time', 'ampm', 'comments'].includes(key));
        if (entries.length === 0) return null;

        return (
            <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-muted/30 rounded-lg text-xs">
                {entries.map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <span className="text-muted-foreground uppercase text-[10px] font-bold">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="ocean-gradient p-4 pb-6 rounded-b-2xl shadow-lg">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/owner/dashboard')}
                        className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-bold text-primary-foreground capitalize">
                        {type} Reports
                    </h1>
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-4xl mx-auto">
                {/* Date Filter */}
                <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        Filter by Date
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-background h-10 w-full sm:w-48 appearance-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p>Loading records...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
                        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <h3 className="text-lg font-semibold">No Records Found</h3>
                        <p className="text-muted-foreground">No {type} activities have been recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <div key={log.id} className="glass-card p-4 rounded-2xl border shadow-sm relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{log.profiles?.full_name || log.profiles?.username}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                <span className="text-primary font-bold">{log.farms?.name || 'N/A'}</span> — {log.sections?.name || 'N/A'} — {log.tanks?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigate(`/owner/activity/${(log.activity_type || '').toLowerCase()}?edit=${log.id}`)}
                                            className="text-primary h-8 w-8 hover:bg-primary/10"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                                                <Calendar className="w-3 h-3" />
                                                {formatIST(log.created_at, 'dd-MM-yyyy')}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatIST(log.created_at, 'hh:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {formatData(log.data)}

                                {log.data?.comments && (
                                    <div className="mt-3 p-2 bg-yellow-50/50 border border-yellow-100 rounded-lg text-xs italic text-amber-900">
                                        "{log.data.comments}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Visualizations Section - Now Below Details */}
                {!loading && logs.length > 0 && ['feed', 'water', 'observation', 'treatment', 'stocking'].includes(type?.toLowerCase() || '') && (
                    <Card className="rounded-2xl border shadow-sm overflow-hidden mt-6">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BarChart2 className="w-4 h-4 text-primary" />
                                {type?.toLowerCase() === 'feed' ? 'Feed Distribution' :
                                    type?.toLowerCase() === 'treatment' ? 'Treatment Dosage' :
                                        type?.toLowerCase() === 'stocking' ? 'Stocking Levels' :
                                            type?.toLowerCase() === 'water' ? 'Water Parameters Avg' :
                                                'Mortality Trends'}
                                <span className="text-[10px] font-normal text-muted-foreground ml-1">(7-Day Trend)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 sm:p-4">
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        fontSize={10}
                                        fontWeight="bold"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={10}
                                        tickFormatter={(val) => val === 0 ? '0' : val.toString()}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }}
                                    />
                                    {activeTanks.map((location, i) => (
                                        <Line
                                            key={location}
                                            type="monotone"
                                            dataKey={location}
                                            stroke={chartConfig[location]?.color}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                            animationDuration={1000}
                                        />
                                    ))}
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default OwnerActivityLogs;
