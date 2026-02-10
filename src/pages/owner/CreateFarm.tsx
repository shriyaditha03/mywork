import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Calculator, Layers } from 'lucide-react';

const CreateFarm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        farmName: '',
        sectionCount: 1,
        tanksPerSection: 1,
        tankType: 'FRP',
        tankShape: 'CIRCLE',
        length: 0,
        width: 0,
        height: 0,
        radius: 0,
    });

    const [calcs, setCalcs] = useState({
        volume: 0,
        area: 0
    });

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            calculate(newData);
            return newData;
        });
    };

    const calculate = (data: typeof formData) => {
        let volume = 0; // Litres
        let area = 0;   // Sq Meters

        const h = Number(data.height) || 0;

        if (data.tankShape === 'RECTANGLE') {
            const l = Number(data.length) || 0;
            const w = Number(data.width) || 0;
            const volM3 = l * w * h;
            volume = volM3 * 1000;
            area = l * w;
        } else {
            const r = Number(data.radius) || 0;
            const volM3 = Math.PI * Math.pow(r, 2) * h;
            volume = volM3 * 1000;
            area = Math.PI * Math.pow(r, 2);
        }

        setCalcs({
            volume: Math.round(volume * 100) / 100,
            area: Math.round(area * 100) / 100
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.hatchery_id) {
            toast.error("No hatchery linked to this account");
            return;
        }

        try {
            setLoading(true);

            // 1. Create Farm
            const { data: farm, error: farmError } = await supabase
                .from('farms')
                .insert([{
                    hatchery_id: user.hatchery_id,
                    name: formData.farmName,
                }])
                .select()
                .single();

            if (farmError) throw farmError;

            // 2. Create Sections
            const sectionsToCreate = Array.from({ length: Number(formData.sectionCount) }).map((_, i) => ({
                farm_id: farm.id,
                name: `Section ${i + 1}`,
            }));

            const { data: sections, error: sectionError } = await supabase
                .from('sections')
                .insert(sectionsToCreate)
                .select();

            if (sectionError) throw sectionError;

            // 3. Create Tanks for each section
            let tanksToCreate: any[] = [];
            sections.forEach(section => {
                for (let i = 0; i < Number(formData.tanksPerSection); i++) {
                    tanksToCreate.push({
                        farm_id: farm.id,
                        section_id: section.id,
                        name: `Tank ${i + 1}`,
                        type: formData.tankType,
                        shape: formData.tankShape,
                        length: formData.tankShape === 'RECTANGLE' ? formData.length : null,
                        width: formData.tankShape === 'RECTANGLE' ? formData.width : null,
                        height: formData.height,
                        radius: formData.tankShape === 'CIRCLE' ? formData.radius : null,
                        volume_litres: calcs.volume,
                        area_sqm: calcs.area
                    });
                }
            });

            const { error: tankError } = await supabase
                .from('tanks')
                .insert(tanksToCreate);

            if (tankError) throw tankError;

            toast.success(`Farm "${formData.farmName}" created with ${sections.length} sections and ${tanksToCreate.length} tanks!`);
            navigate('/owner/dashboard');

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create farm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 pb-20">
            <div className="max-w-2xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate('/owner/dashboard')} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                </Button>

                <div>
                    <h1 className="text-2xl font-bold">Create New Farm</h1>
                    <p className="text-muted-foreground">Setup farm structure and tanks</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-card p-6 rounded-2xl shadow-sm border space-y-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" /> General Info
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="farmName">Farm Name</Label>
                            <Input
                                id="farmName"
                                value={formData.farmName}
                                onChange={(e) => handleChange('farmName', e.target.value)}
                                placeholder="e.g. Block A"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sectionCount">No. of Sections</Label>
                                <Input
                                    id="sectionCount"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formData.sectionCount}
                                    onChange={(e) => handleChange('sectionCount', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tanksPerSection">Tanks per Section</Label>
                                <Input
                                    id="tanksPerSection"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formData.tanksPerSection}
                                    onChange={(e) => handleChange('tanksPerSection', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-2xl shadow-sm border space-y-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" /> Tank Configuration
                        </h2>
                        <p className="text-sm text-muted-foreground">Applied to all created tanks</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tank Type</Label>
                                <Select value={formData.tankType} onValueChange={(val) => handleChange('tankType', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FRP">FRP</SelectItem>
                                        <SelectItem value="CONCRETE">Concrete</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Shape</Label>
                                <Select value={formData.tankShape} onValueChange={(val) => handleChange('tankShape', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CIRCLE">Circular</SelectItem>
                                        <SelectItem value="RECTANGLE">Rectangular</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Height (m)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.height}
                                    onChange={(e) => handleChange('height', e.target.value)}
                                />
                            </div>

                            {formData.tankShape === 'CIRCLE' ? (
                                <div className="space-y-2">
                                    <Label>Radius (m)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.radius}
                                        onChange={(e) => handleChange('radius', e.target.value)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Length (m)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.length}
                                            onChange={(e) => handleChange('length', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Width (m)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.width}
                                            onChange={(e) => handleChange('width', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Live Calculations */}
                        <div className="bg-muted/50 p-4 rounded-xl grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Volume</p>
                                <p className="text-xl font-bold text-primary">{calcs.volume.toLocaleString()} L</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Bottom Area</p>
                                <p className="text-xl font-bold text-primary">{calcs.area.toLocaleString()} m²</p>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Farm & Tanks'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateFarm;
