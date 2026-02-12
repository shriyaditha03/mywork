import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Calculator, Layers, Trash2, Plus, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TankConfig {
    name: string;
    type: 'FRP' | 'CONCRETE';
    shape: 'CIRCLE' | 'RECTANGLE';
    length: number;
    width: number;
    height: number;
    radius: number;
    volume: number;
    area: number;
}

interface SectionConfig {
    name: string;
    tanks: TankConfig[];
}

const CreateFarm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [farmName, setFarmName] = useState('');
    const [sectionCount, setSectionCount] = useState(1);
    const [tanksPerSection, setTanksPerSection] = useState(1);
    const [sections, setSections] = useState<SectionConfig[]>([]);

    const calculateTank = (tank: TankConfig): { volume: number, area: number } => {
        let volume = 0;
        let area = 0;
        const h = Number(tank.height) || 0;

        if (tank.shape === 'RECTANGLE') {
            const l = Number(tank.length) || 0;
            const w = Number(tank.width) || 0;
            area = l * w;
            volume = area * h * 1000;
        } else {
            const r = Number(tank.radius) || 0;
            area = Math.PI * Math.pow(r, 2);
            volume = area * h * 1000;
        }

        return {
            volume: Math.round(volume * 100) / 100,
            area: Math.round(area * 100) / 100
        };
    };

    const handleContinueToSetup = () => {
        if (!farmName.trim()) {
            toast.error("Please enter a farm name");
            return;
        }

        const newSections: SectionConfig[] = Array.from({ length: sectionCount }).map((_, sIdx) => ({
            name: `Section ${sIdx + 1}`,
            tanks: Array.from({ length: tanksPerSection }).map((_, tIdx) => ({
                name: `Tank ${tIdx + 1}`,
                type: 'FRP',
                shape: 'CIRCLE',
                length: 0,
                width: 0,
                height: 0,
                radius: 0,
                volume: 0,
                area: 0
            }))
        }));

        setSections(newSections);
        setStep(2);
    };

    const updateTank = (sIdx: number, tIdx: number, updates: Partial<TankConfig>) => {
        setSections(prev => {
            const newSections = [...prev];
            const tank = { ...newSections[sIdx].tanks[tIdx], ...updates };

            // Re-calculate volume/area
            const { volume, area } = calculateTank(tank);
            newSections[sIdx].tanks[tIdx] = { ...tank, volume, area };

            return newSections;
        });
    };

    const handleSubmit = async () => {
        if (!user?.hatchery_id) return;

        try {
            setLoading(true);

            // 1. Create Farm
            const { data: farm, error: farmError } = await supabase
                .from('farms')
                .insert([{ hatchery_id: user.hatchery_id, name: farmName }])
                .select().single();

            if (farmError) throw farmError;

            // 2. Create Sections
            const { data: dbSections, error: sectionError } = await supabase
                .from('sections')
                .insert(sections.map(s => ({ farm_id: farm.id, name: s.name })))
                .select();

            if (sectionError) throw sectionError;

            // 3. Create Tanks
            const tanksToCreate: any[] = [];
            dbSections.forEach((dbSec, idx) => {
                const configTanks = sections[idx].tanks;
                configTanks.forEach(ct => {
                    tanksToCreate.push({
                        farm_id: farm.id,
                        section_id: dbSec.id,
                        name: ct.name,
                        type: ct.type,
                        shape: ct.shape,
                        length: ct.shape === 'RECTANGLE' ? ct.length : null,
                        width: ct.shape === 'RECTANGLE' ? ct.width : null,
                        height: ct.height,
                        radius: ct.shape === 'CIRCLE' ? ct.radius : null,
                        volume_litres: ct.volume,
                        area_sqm: ct.area
                    });
                });
            });

            const { error: tankError } = await supabase.from('tanks').insert(tanksToCreate);
            if (tankError) throw tankError;

            toast.success("Farm created successfully!");
            navigate('/owner/dashboard');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to create farm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 pb-12">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => step === 1 ? navigate('/owner/dashboard') : setStep(1)} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-5 h-5 mr-1" /> {step === 1 ? 'Back to Dashboard' : 'Back to General Info'}
                </Button>

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Farm</h1>
                        <p className="text-muted-foreground">
                            {step === 1 ? 'Step 1: General Structure' : 'Step 2: Configure Individual Tanks'}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                </div>

                {step === 1 ? (
                    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="farmName">Farm Name</Label>
                                <Input
                                    id="farmName"
                                    value={farmName}
                                    onChange={(e) => setFarmName(e.target.value)}
                                    placeholder="e.g. Block A"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>No. of Sections</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={sectionCount}
                                        onChange={(e) => setSectionCount(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanks per Section</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={tanksPerSection}
                                        onChange={(e) => setTanksPerSection(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleContinueToSetup} className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20">
                                Continue to Tank Setup <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {sections.map((section, sIdx) => (
                            <div key={sIdx} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-lg font-bold">{section.name}</h2>
                                </div>

                                <div className="grid gap-4">
                                    {section.tanks.map((tank, tIdx) => (
                                        <Card key={tIdx} className="rounded-2xl border-none shadow-md overflow-hidden bg-card/50">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <Input
                                                        className="font-bold border-none bg-transparent p-0 text-md focus-visible:ring-0 w-1/2"
                                                        value={tank.name}
                                                        onChange={(e) => updateTank(sIdx, tIdx, { name: e.target.value })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold text-muted-foreground uppercase">
                                                            T-{sIdx + 1}.{tIdx + 1}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Type</Label>
                                                        <Select value={tank.type} onValueChange={(val: any) => updateTank(sIdx, tIdx, { type: val })}>
                                                            <SelectTrigger className="h-9 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="FRP">FRP</SelectItem>
                                                                <SelectItem value="CONCRETE">Concrete</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Shape</Label>
                                                        <Select value={tank.shape} onValueChange={(val: any) => updateTank(sIdx, tIdx, { shape: val })}>
                                                            <SelectTrigger className="h-9 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CIRCLE">Circular</SelectItem>
                                                                <SelectItem value="RECTANGLE">Rectangular</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className={`grid ${tank.shape === 'CIRCLE' ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Height (m)</Label>
                                                        <Input
                                                            type="number"
                                                            className="h-9 text-xs"
                                                            value={tank.height || ''}
                                                            onChange={(e) => updateTank(sIdx, tIdx, { height: Number(e.target.value) })}
                                                        />
                                                    </div>
                                                    {tank.shape === 'CIRCLE' ? (
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Radius (m)</Label>
                                                            <Input
                                                                type="number"
                                                                className="h-9 text-xs"
                                                                value={tank.radius || ''}
                                                                onChange={(e) => updateTank(sIdx, tIdx, { radius: Number(e.target.value) })}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Length (m)</Label>
                                                                <Input
                                                                    type="number"
                                                                    className="h-9 text-xs"
                                                                    value={tank.length || ''}
                                                                    onChange={(e) => updateTank(sIdx, tIdx, { length: Number(e.target.value) })}
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Width (m)</Label>
                                                                <Input
                                                                    type="number"
                                                                    className="h-9 text-xs"
                                                                    value={tank.width || ''}
                                                                    onChange={(e) => updateTank(sIdx, tIdx, { width: Number(e.target.value) })}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className={`pt-1 grid ${tank.shape === 'CIRCLE' ? 'grid-cols-2' : 'grid-cols-3'} gap-3 border-t border-dashed mt-1`}>
                                                    <div className="">
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Volume</p>
                                                        <p className="font-bold text-primary text-sm">{tank.volume.toLocaleString()} L</p>
                                                    </div>
                                                    <div className="">
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Area</p>
                                                        <p className="font-bold text-primary text-sm">{tank.area.toLocaleString()} m²</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Large spacer to ensure the last card can scroll above the fixed button */}
                        <div className="h-4" />

                        <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/80 backdrop-blur-md border-t">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full max-w-lg mx-auto block h-12 rounded-xl text-md font-bold shadow-xl shadow-primary/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Check className="w-5 h-5" /> Finish & Create Farm
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateFarm;
