import { Button } from "@/components/ui/button";

interface PresetAmountsProps {
  selectedAmount: string;
  onAmountSelect: (amount: string) => void;
}

const PresetAmounts = ({ selectedAmount, onAmountSelect }: PresetAmountsProps) => {
  const predefinedAmounts = [10, 25, 50, 100];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {predefinedAmounts.map((preset) => (
        <Button
          key={preset}
          type="button"
          variant={selectedAmount === preset.toString() ? "default" : "outline"}
          onClick={() => onAmountSelect(preset.toString())}
          className="w-full"
        >
          ${preset}
        </Button>
      ))}
    </div>
  );
};

export default PresetAmounts;