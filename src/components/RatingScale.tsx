import { Label } from '@/components/ui/label';

interface RatingScaleProps {
  label: string;
  required?: boolean;
  value: number;
  onChange: (val: number) => void;
}

const RatingScale = ({ label, required, value, onChange }: RatingScaleProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-xs">
        {label}{required && ' *'}
      </Label>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-destructive font-medium w-12 shrink-0">Very Bad</span>
        <div className="flex gap-1 flex-1 justify-center">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                value === n
                  ? 'bg-primary text-primary-foreground shadow-md scale-110'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-success font-medium w-8 shrink-0 text-right">Best</span>
      </div>
    </div>
  );
};

export default RatingScale;
