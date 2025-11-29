import { MapPin, Clock } from "lucide-react";

export function JourneyStats({
  distance,
  duration,
}: {
  distance: number;
  duration: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="space-y-1">
        <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Distance
        </p>
        <p className="text-base font-semibold">
          {distance.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">km</span>
        </p>
      </div>

      <div className="space-y-1">
        <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Estimated duration
        </p>
        <p className="text-base font-semibold">
          {Math.round(duration)}{" "}
          <span className="text-xs font-normal text-muted-foreground">min</span>
        </p>
      </div>
    </div>
  );
}
