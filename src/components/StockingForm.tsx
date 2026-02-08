import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RatingScale from '@/components/RatingScale';
import { useState } from 'react';

interface StockingFormProps {
  comments: string;
  onCommentsChange: (val: string) => void;
}

const StockingForm = ({ comments, onCommentsChange }: StockingFormProps) => {
  const [broodstockSource, setBroodstockSource] = useState('');
  const [hatcheryName, setHatcheryName] = useState('');
  const [tankStockingNumber, setTankStockingNumber] = useState('');
  const [naupliiStocked, setNaupliiStocked] = useState('');
  const [animalConditionScore, setAnimalConditionScore] = useState(0);
  const [animalScoreOther, setAnimalScoreOther] = useState('');
  const [waterQualityScore, setWaterQualityScore] = useState(0);
  const [waterScoreOther, setWaterScoreOther] = useState('');

  return (
    <div className="glass-card rounded-2xl p-4 space-y-5 animate-fade-in-up">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stocking Details</h2>

      <div className="space-y-1.5">
        <Label className="text-xs">Source of Broodstock *</Label>
        <Input value={broodstockSource} onChange={e => setBroodstockSource(e.target.value)} placeholder="Enter broodstock source" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Name of the Hatchery or Section</Label>
        <Input value={hatcheryName} onChange={e => setHatcheryName(e.target.value)} placeholder="Enter hatchery / section name" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Tank Stocking Number (Population)</Label>
        <Input type="number" value={tankStockingNumber} onChange={e => setTankStockingNumber(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Number of Nauplii Stocked in Million</Label>
        <Input type="number" value={naupliiStocked} onChange={e => setNaupliiStocked(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <RatingScale label="Animal Condition Score" required value={animalConditionScore} onChange={setAnimalConditionScore} />
      <div className="space-y-1.5">
        <Label className="text-xs">Other</Label>
        <Input value={animalScoreOther} onChange={e => setAnimalScoreOther(e.target.value)} placeholder="Any other observations" className="h-11" />
      </div>

      <RatingScale label="Water Quality Score" required value={waterQualityScore} onChange={setWaterQualityScore} />
      <div className="space-y-1.5">
        <Label className="text-xs">Other</Label>
        <Input value={waterScoreOther} onChange={e => setWaterScoreOther(e.target.value)} placeholder="Any other observations" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Comments</Label>
        <Textarea value={comments} onChange={e => onCommentsChange(e.target.value)} placeholder="Add notes..." rows={3} />
      </div>
    </div>
  );
};

export default StockingForm;
