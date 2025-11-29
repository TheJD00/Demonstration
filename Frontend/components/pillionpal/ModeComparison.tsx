import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bike, CarTaxiFront, Bus } from "lucide-react";

interface ModeInfo {
  cost: number;
  duration: number;
}

interface Props {
  bike: ModeInfo;
  auto: ModeInfo;
  bus: ModeInfo;
}

export function ModeComparison({ bike, auto, bus }: Props) {
  const maxCost = Math.max(bike.cost, auto.cost, bus.cost);
  const maxDuration = Math.max(bike.duration, auto.duration, bus.duration);

  const scaleCost = (v: number) => Math.min((v / maxCost) * 100, 100);
  const scaleDuration = (v: number) => Math.min((v / maxDuration) * 100, 100);

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Mode benchmarks (visual comparison)
        </CardTitle>
        <CardDescription className="text-xs">
          Cost (top bar) and duration (bottom bar) relative to the most expensive/slowest mode.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Bike */}
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Bike (FairSplit)</span>
            </div>

            <div>
              <p className="text-2xl font-semibold">₹{bike.cost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {bike.duration.toFixed(1)} min
              </p>
            </div>

            <div className="w-full bg-primary/20 h-2 rounded">
              <div
                className="h-2 bg-primary rounded"
                style={{ width: `${scaleCost(bike.cost)}%` }}
              />
            </div>

            <div className="w-full bg-primary/20 h-2 rounded">
              <div
                className="h-2 bg-primary rounded"
                style={{ width: `${scaleDuration(bike.duration)}%` }}
              />
            </div>
          </div>

          {/* Auto */}
          <div className="rounded-xl border p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CarTaxiFront className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Auto</span>
            </div>

            <div>
              <p className="text-2xl font-semibold">₹{auto.cost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {auto.duration.toFixed(1)} min
              </p>
            </div>

            <div className="w-full bg-zinc-200 h-2 rounded">
              <div
                className="h-2 bg-orange-500 rounded"
                style={{ width: `${scaleCost(auto.cost)}%` }}
              />
            </div>

            <div className="w-full bg-zinc-200 h-2 rounded">
              <div
                className="h-2 bg-orange-400 rounded"
                style={{ width: `${scaleDuration(auto.duration)}%` }}
              />
            </div>
          </div>

          {/* Bus */}
          <div className="rounded-xl border p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Bus className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Bus</span>
            </div>

            <div>
              <p className="text-2xl font-semibold">₹{bus.cost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {bus.duration.toFixed(1)} min
              </p>
            </div>

            <div className="w-full bg-zinc-200 h-2 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${scaleCost(bus.cost)}%` }}
              />
            </div>

            <div className="w-full bg-zinc-200 h-2 rounded">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${scaleDuration(bus.duration)}%` }}
              />
            </div>
          </div>

        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Highest = 100%. Lower bars show visual cost & time savings.
        </p>
      </CardContent>
    </Card>
  );
}
