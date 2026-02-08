import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RatingScale from '@/components/RatingScale';
import { useState } from 'react';

interface ObservationFormProps {
  comments: string;
  onCommentsChange: (val: string) => void;
}

const ObservationForm = ({ comments, onCommentsChange }: ObservationFormProps) => {
  const [animalQualityScore, setAnimalQualityScore] = useState(0);
  const [animalScoreOther, setAnimalScoreOther] = useState('');

  const [sample1Count, setSample1Count] = useState('');
  const [sample2Count, setSample2Count] = useState('');
  const [sample1Weight, setSample1Weight] = useState('');
  const [sample2Weight, setSample2Weight] = useState('');
  const [sample1AvgWt, setSample1AvgWt] = useState('');
  const [sample2AvgWt, setSample2AvgWt] = useState('');

  const [numberOfMolts, setNumberOfMolts] = useState('');
  const [moltsCollected, setMoltsCollected] = useState('');
  const [deadAnimals, setDeadAnimals] = useState('');
  const [naupliiStocked, setNaupliiStocked] = useState('');
  const [presentPopulation, setPresentPopulation] = useState('');
  const [tankStockingNumber, setTankStockingNumber] = useState('');
  const [naupliiStockedMillion, setNaupliiStockedMillion] = useState('');

  const [waterQualityScore, setWaterQualityScore] = useState(0);
  const [waterScoreOther, setWaterScoreOther] = useState('');

  return (
    <div className="glass-card rounded-2xl p-4 space-y-5 animate-fade-in-up">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Observation Details</h2>

      <RatingScale label="Animal Quality Score" required value={animalQualityScore} onChange={setAnimalQualityScore} />
      <div className="space-y-1.5">
        <Label className="text-xs">Other</Label>
        <Input value={animalScoreOther} onChange={e => setAnimalScoreOther(e.target.value)} placeholder="Any other observations" className="h-11" />
      </div>

      {/* Sampling Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sampling</h3>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-0">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-2 font-medium text-muted-foreground"></th>
                <th className="text-center py-2 px-1 font-medium text-muted-foreground">Sample 1</th>
                <th className="text-center py-2 px-1 font-medium text-muted-foreground">Sample 2</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-2 font-medium">Animal Count</td>
                <td className="py-2 px-1"><Input type="number" value={sample1Count} onChange={e => setSample1Count(e.target.value)} placeholder="0" className="h-9 text-xs" /></td>
                <td className="py-2 px-1"><Input type="number" value={sample2Count} onChange={e => setSample2Count(e.target.value)} placeholder="0" className="h-9 text-xs" /></td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-2 font-medium">Weight</td>
                <td className="py-2 px-1"><Input type="number" value={sample1Weight} onChange={e => setSample1Weight(e.target.value)} placeholder="0" className="h-9 text-xs" /></td>
                <td className="py-2 px-1"><Input type="number" value={sample2Weight} onChange={e => setSample2Weight(e.target.value)} placeholder="0" className="h-9 text-xs" /></td>
              </tr>
              <tr>
                <td className="py-2 pr-2 font-medium">Avg Wt</td>
                <td className="py-2 px-1"><Input type="number" value={sample1AvgWt} onChange={e => setSample1AvgWt(e.target.value)} placeholder="0" className="h-9 text-xs" /></td>
                <td className="py-2 px-1"><Input type="number" value={sample2AvgWt} onChange={e => setSample2AvgWt(e.target.value)} placeholder="0" className="h-9 text-xs" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Number of Molts</Label>
        <Input type="number" value={numberOfMolts} onChange={e => setNumberOfMolts(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Number of Molts Collected</Label>
        <p className="text-[10px] text-muted-foreground -mt-1">To help us calculate Molting Cycle</p>
        <Input type="number" value={moltsCollected} onChange={e => setMoltsCollected(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Number of Dead Animals (Mortality)</Label>
        <Input type="number" value={deadAnimals} onChange={e => setDeadAnimals(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Number of Nauplii Stocked in Million</Label>
        <Input type="number" value={naupliiStocked} onChange={e => setNaupliiStocked(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Present Population in the Tank *</Label>
        <Input type="number" value={presentPopulation} onChange={e => setPresentPopulation(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Tank Stocking Number (Population)</Label>
        <Input type="number" value={tankStockingNumber} onChange={e => setTankStockingNumber(e.target.value)} placeholder="0" className="h-11" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Number of Nauplii Stocked in Million</Label>
        <Input type="number" value={naupliiStockedMillion} onChange={e => setNaupliiStockedMillion(e.target.value)} placeholder="0" className="h-11" />
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

export default ObservationForm;
