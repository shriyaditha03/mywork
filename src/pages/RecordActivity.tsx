import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import RatingScale from '@/components/RatingScale';
import StockingForm from '@/components/StockingForm';
import ObservationForm from '@/components/ObservationForm';
import { toast } from 'sonner';

const TANKS = ['T1', 'T2', 'T3', 'T4'];
const ACTIVITIES = ['Feed', 'Treatment', 'Water Quality', 'Animal Quality', 'Stocking', 'Observation'] as const;
type ActivityType = typeof ACTIVITIES[number];

const FEED_TYPES = ['Starter Feed', 'Grower Feed', 'Finisher Feed', 'Supplement'];
const FEED_UNITS = ['kg', 'g', 'lb'];
const TREATMENT_TYPES = ['Probiotics', 'Antibiotics', 'Mineral Supplement', 'Disinfectant', 'Vitamin'];
const TREATMENT_UNITS = ['ml', 'L', 'g', 'kg', 'ppm'];

const RecordActivity = () => {
  const navigate = useNavigate();
  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(
    `${String(now.getHours() % 12 || 12).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  );
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(now.getHours() >= 12 ? 'PM' : 'AM');
  const [tank, setTank] = useState('');
  const [activity, setActivity] = useState<ActivityType | ''>('');

  // Feed fields
  const [feedType, setFeedType] = useState('');
  const [feedQty, setFeedQty] = useState('');
  const [feedUnit, setFeedUnit] = useState('kg');

  // Treatment fields
  const [treatmentType, setTreatmentType] = useState('');
  const [treatmentDosage, setTreatmentDosage] = useState('');
  const [treatmentUnit, setTreatmentUnit] = useState('ml');

  // Animal quality fields
  const ANIMAL_RATING_FIELDS = [
    { key: 'swimmingActivity', label: 'Swimming Activity' },
    { key: 'homogenousStage', label: 'Homogenous Stage', required: true },
    { key: 'hepatopancreas', label: 'Hepatopancreas' },
    { key: 'intestinalContent', label: 'Intestinal Content' },
    { key: 'fecalStrings', label: 'Fecal Strings' },
    { key: 'necrosis', label: 'Necrosis' },
    { key: 'deformities', label: 'Deformities' },
    { key: 'fouling', label: 'Fouling', required: true },
    { key: 'epibionts', label: 'Epibionts' },
    { key: 'muscleGutRatio', label: 'Muscle Gut Ratio' },
    { key: 'size', label: 'Size', required: true },
    { key: 'nextStageConversion', label: 'Time taken for Next Stage Conversion' },
  ];
  const [animalSize, setAnimalSize] = useState('');
  const [animalRatings, setAnimalRatings] = useState<Record<string, number>>({});
  const [diseaseSymptoms, setDiseaseSymptoms] = useState('');
  const [otherAnimal, setOtherAnimal] = useState('');

  // Water quality fields
  const [waterData, setWaterData] = useState<Record<string, string>>({});

  const [comments, setComments] = useState('');

  const waterFields = [
    'Salinity', 'pH', 'Dissolved Oxygen', 'Alkalinity', 'Chlorine Content',
    'Iron Content', 'Turbidity', 'Temperature', 'Hardness', 'Ammonia',
    'Nitrate [NO3]', 'Nitrite [NO2]', 'Vibrio Count', 'Yellow Green Bacteria',
    'Luminescence', 'Other',
  ];

  const handleSave = () => {
    if (!tank || !activity) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Activity recorded successfully!');
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="ocean-gradient p-4 pb-6 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-primary-foreground">Record Activity</h1>
        </div>
      </div>

      <div className="p-3 sm:p-4 pb-8 space-y-4 max-w-lg mx-auto">
        {/* Date / Time */}
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time</Label>
              <div className="flex gap-2">
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-11 flex-1" />
                <Select value={ampm} onValueChange={v => setAmpm(v as 'AM' | 'PM')}>
                  <SelectTrigger className="w-20 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Tank & Activity */}
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tank & Activity</h2>
          <div className="space-y-1.5">
            <Label className="text-xs">Select Tank *</Label>
            <Select value={tank} onValueChange={setTank}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose tank" />
              </SelectTrigger>
              <SelectContent>
                {TANKS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Activity Type *</Label>
            <Select value={activity} onValueChange={v => setActivity(v as ActivityType)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose activity" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Form */}
        {activity === 'Feed' && (
          <div className="glass-card rounded-2xl p-4 space-y-4 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Feed Details</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Feed Type</Label>
              <Select value={feedType} onValueChange={setFeedType}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select feed type" /></SelectTrigger>
                <SelectContent>
                  {FEED_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Feed Quantity</Label>
              <div className="flex gap-2">
                <Input type="number" value={feedQty} onChange={e => setFeedQty(e.target.value)} placeholder="0" className="h-11 flex-1" />
                <Select value={feedUnit} onValueChange={setFeedUnit}>
                  <SelectTrigger className="w-20 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FEED_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Comments</Label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add notes..." rows={3} />
            </div>
          </div>
        )}

        {activity === 'Treatment' && (
          <div className="glass-card rounded-2xl p-4 space-y-4 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Treatment Details</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Treatment Type</Label>
              <Select value={treatmentType} onValueChange={setTreatmentType}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select treatment type" /></SelectTrigger>
                <SelectContent>
                  {TREATMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dosage</Label>
              <div className="flex gap-2">
                <Input type="number" value={treatmentDosage} onChange={e => setTreatmentDosage(e.target.value)} placeholder="0" className="h-11 flex-1" />
                <Select value={treatmentUnit} onValueChange={setTreatmentUnit}>
                  <SelectTrigger className="w-20 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TREATMENT_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Comments</Label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add notes..." rows={3} />
            </div>
          </div>
        )}

        {activity === 'Water Quality' && (
          <div className="glass-card rounded-2xl p-4 space-y-4 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Water Quality Parameters</h2>
            <div className="grid grid-cols-2 gap-3">
              {waterFields.map(field => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{field}</Label>
                  <Input
                    value={waterData[field] || ''}
                    onChange={e => setWaterData(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder="—"
                    className="h-10"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Comments</Label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add notes..." rows={3} />
            </div>
          </div>
        )}

        {activity === 'Animal Quality' && (
          <div className="glass-card rounded-2xl p-4 space-y-5 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animal Quality</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Animal Size and Avg. Wt. *</Label>
              <Input value={animalSize} onChange={e => setAnimalSize(e.target.value)} placeholder="Enter size / avg weight" className="h-11" />
            </div>
            <div className="space-y-4">
              {ANIMAL_RATING_FIELDS.map(f => (
                <RatingScale
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  value={animalRatings[f.key] || 0}
                  onChange={val => setAnimalRatings(prev => ({ ...prev, [f.key]: val }))}
                />
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Disease Symptoms</Label>
              <Textarea value={diseaseSymptoms} onChange={e => setDiseaseSymptoms(e.target.value)} placeholder="Describe any disease symptoms..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Other</Label>
              <Input value={otherAnimal} onChange={e => setOtherAnimal(e.target.value)} placeholder="Any other observations" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Comments</Label>
              <Textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Add notes..." rows={3} />
            </div>
          </div>
        )}

        {activity === 'Stocking' && (
          <StockingForm comments={comments} onCommentsChange={setComments} />
        )}

        {activity === 'Observation' && (
          <ObservationForm comments={comments} onCommentsChange={setComments} />
        )}

        {/* Save */}
        {activity && (
          <Button onClick={handleSave} className="w-full h-14 text-base font-semibold rounded-2xl gap-2 animate-fade-in-up">
            <Save className="w-5 h-5" /> Save Activity
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecordActivity;
