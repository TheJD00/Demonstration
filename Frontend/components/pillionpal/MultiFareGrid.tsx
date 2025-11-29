import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JourneyStats } from "./JourneyStats";
import { CarTaxiFront, Bus, Gauge, Fuel, Bike } from "lucide-react";

interface Fare {
  engine_cc: string;
  mileage_kmpl: number;
  distance_km: number;
  duration_minutes: number;
  fuel_cost: number;
  platform_fee: number;
  total_cost: number;
  rider_share: number;
  pillion_share: number;
}

interface AutoFare {
  fare: number;
  duration_minutes: number;
}

interface BusFare {
  fare: number;
  duration_minutes: number;
}

interface Props {
  fares: Record<string, Fare>;
  distance: number;
  duration: number;
  auto_fare: AutoFare;
  bus_fare: BusFare;
}

export default function MultiFareGrid({
  fares,
  distance,
  duration,
  auto_fare,
  bus_fare,
}: Props) {
  
  const engineFares = Object.entries(fares).filter(([key]) => !isNaN(Number(key)));

  // The 125cc card is the DEFAULT benchmark engine (middle point)
  const selectedBike = engineFares.find(([cc]) => cc === "125")
    ? fares["125"]
    : engineFares[0][1];

  const maxCost = Math.max(
    selectedBike.total_cost,
    auto_fare.fare,
    bus_fare.fare
  );

  const scale = (value: number) => (value / maxCost) * 100;

  return (
    <div className="space-y-8">

      {/* Journey summary */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Journey summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyStats distance={distance} duration={duration} />
        </CardContent>
      </Card>

      {/* Mode Benchmark - Visual */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Mode comparison</CardTitle>
          <CardDescription className="text-xs">
            Visual comparison of transport modes for the same route.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Bike */}
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Bike className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Bike ({selectedBike.engine_cc}cc)
                </span>
              </div>

              <p className="text-2xl font-semibold">
                ₹{selectedBike.total_cost.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedBike.duration_minutes.toFixed(1)} min
              </p>

              <div className="w-full bg-primary/20 h-2 rounded mt-2">
                <div
                  className="h-2 bg-primary rounded"
                  style={{ width: `${scale(selectedBike.total_cost)}%` }}
                />
              </div>
            </div>

            {/* Auto */}
            <div className="rounded-xl border p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <CarTaxiFront className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Auto</span>
              </div>

              <p className="text-2xl font-semibold">₹{auto_fare.fare.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {auto_fare.duration_minutes.toFixed(1)} min
              </p>

              <div className="w-full bg-orange-200/50 h-2 rounded mt-2">
                <div
                  className="h-2 bg-orange-500 rounded"
                  style={{ width: `${scale(auto_fare.fare)}%` }}
                />
              </div>
            </div>

            {/* Bus */}
            <div className="rounded-xl border p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Bus</span>
              </div>

              <p className="text-2xl font-semibold">₹{bus_fare.fare.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {bus_fare.duration_minutes.toFixed(1)} min
              </p>

              <div className="w-full bg-blue-200/50 h-2 rounded mt-2">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${scale(bus_fare.fare)}%` }}
                />
              </div>
            </div>

          </div>

          <p className="text-[11px] mt-3 text-muted-foreground">
            Bars scale to the highest fare for accurate visual comparison.
          </p>
        </CardContent>
      </Card>

      {/* Bike Comparison Cards */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Bike fares by engine capacity</h2>
        <p className="text-xs text-muted-foreground">
          FairSplit distributes cost fairly regardless of engine class.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {engineFares.map(([cc, fare]) => (
          <Card key={cc} className="rounded-2xl border bg-card shadow-sm">
            <CardHeader className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="flex items-center gap-1 text-[11px]">
                  <Gauge className="h-3.5 w-3.5" />
                  {cc}cc
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {fare.mileage_kmpl} km/l
                </span>
              </div>

              <CardTitle className="text-lg font-semibold">
                ₹{fare.total_cost.toFixed(2)}
              </CardTitle>

              <CardDescription className="text-[11px]">
                For {fare.distance_km.toFixed(2)} km · ~{fare.duration_minutes.toFixed(1)} min
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <Separator />

              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Fuel className="h-3 w-3" />
                  Fuel
                </span>
                <span className="font-medium">₹{fare.fuel_cost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-medium">₹{fare.platform_fee.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Rider share</span>
                <span className="font-medium">₹{fare.rider_share.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Pillion share</span>
                <span className="font-medium">₹{fare.pillion_share.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
