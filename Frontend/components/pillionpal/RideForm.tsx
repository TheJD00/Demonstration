"use client";

import { MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type BikeCapacity = "100" | "125" | "150" | "200" | "all";

interface Props {
  startLocation: string;
  endLocation: string;
  bikeCapacity: BikeCapacity;
  setStartLocation: (v: string) => void;
  setEndLocation: (v: string) => void;
  setBikeCapacity: (v: BikeCapacity) => void;
  handleEstimate: () => void;
  loading: boolean;
}

export default function RideForm({
  startLocation,
  endLocation,
  bikeCapacity,
  setStartLocation,
  setEndLocation,
  setBikeCapacity,
  handleEstimate,
  loading,
}: Props) {
  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-4 w-4 text-primary" />
          Journey input
        </CardTitle>
        <CardDescription className="text-xs">
          Define a real-world route and engine capacity to test the FairSplit
          calculations.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Locations */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start-location">Starting point</Label>
            <Input
              id="start-location"
              placeholder="e.g. GITAM University"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-location">Destination</Label>
            <Input
              id="end-location"
              placeholder="e.g. MVP Colony"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        {/* Bike capacity */}
        <div className="space-y-2">
          <Label>Bike engine capacity</Label>
          <RadioGroup
            value={bikeCapacity}
            onValueChange={(value) => setBikeCapacity(value as BikeCapacity)}
            className="grid grid-cols-2 gap-2 sm:grid-cols-5"
          >
            {["100", "125", "150", "200", "all"].map((cc) => (
              <div key={cc}>
                <RadioGroupItem
                  value={cc}
                  id={cc}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={cc}
                  className="
                    flex h-9 items-center justify-center rounded-lg border text-xs font-medium
                    cursor-pointer select-none
                    border-border bg-background
                    peer-data-[state=checked]:border-primary
                    peer-data-[state=checked]:bg-primary/5
                    peer-data-[state=checked]:text-primary
                  "
                >
                  {cc === "all" ? "Compare all" : `${cc}cc`}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* CTA */}
        <Button
          className="h-10 w-full text-sm font-medium"
          onClick={handleEstimate}
          disabled={loading}
        >
          {loading ? "Calculating…" : "Run FairSplit estimate"}
        </Button>
      </CardContent>
    </Card>
  );
}
