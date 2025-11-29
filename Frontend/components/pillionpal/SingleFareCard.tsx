import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Fuel,
  DollarSign,
} from "lucide-react";
import { JourneyStats } from "./JourneyStats";
import { ModeComparison } from "./ModeComparison";

interface AutoFare {
  fare: number;
  duration_minutes: number;
}

interface BusFare {
  fare: number;
  duration_minutes: number;
}

interface FareBreakdown {
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

interface SingleFareResponse {
  distance_km: number;
  duration_minutes: number;
  fare: FareBreakdown;
  auto_fare: AutoFare;
  bus_fare: BusFare;
}

interface Props {
  data: SingleFareResponse;
}

export default function SingleFareCard({ data }: Props) {
  const fare = data.fare;
  const auto = data.auto_fare;
  const bus = data.bus_fare;

  const perKm =
    data.distance_km > 0 ? fare.total_cost / data.distance_km : undefined;

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
          <JourneyStats
            distance={data.distance_km}
            duration={data.duration_minutes}
          />
        </CardContent>
      </Card>

      {/* Fare summary */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Bike fare (FairSplit estimate)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">
              Total cost for this trip
            </span>
            <span className="text-2xl font-semibold">
              ₹{fare.total_cost.toFixed(2)}
            </span>
          </div>

          {perKm !== undefined && (
            <p className="text-xs text-muted-foreground">
              Effective rate: ₹{perKm.toFixed(2)} per km ·{" "}
              {fare.mileage_kmpl} km/l · {fare.engine_cc}cc
            </p>
          )}
        </CardContent>
      </Card>

      {/* NEW visual comparison component */}
      <ModeComparison
        bike={{
          cost: fare.total_cost,
          duration: data.duration_minutes,
        }}
        auto={{
          cost: auto.fare,
          duration: auto.duration_minutes,
        }}
        bus={{
          cost: bus.fare,
          duration: bus.duration_minutes,
        }}
      />

      {/* Fare breakdown */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Fare breakdown (bike)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Fuel className="h-3.5 w-3.5" /> Fuel cost
            </span>
            <span className="font-medium">₹{fare.fuel_cost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" /> Platform fee (7.5%)
            </span>
            <span className="font-medium">
              ₹{fare.platform_fee.toFixed(2)}
            </span>
          </div>

          <Separator />

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-xl font-semibold">
              ₹{fare.total_cost.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* FairSplit shares */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Rider share (40%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              ₹{fare.rider_share.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Pillion share (60%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              ₹{fare.pillion_share.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
