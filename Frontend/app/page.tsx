"use client";

import { useState } from "react";

import Header from "@/components/pillionpal/Header";
import RideForm from "@/components/pillionpal/RideForm";
import { ErrorBanner } from "@/components/pillionpal/ErrorBanner";
import { LoadingSpinner } from "@/components/pillionpal/LoadingSpinner";
import SingleFareCard from "@/components/pillionpal/SingleFareCard";
import MultiFareGrid from "@/components/pillionpal/MultiFareGrid";

// FIX: dynamic backend URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [bikeCapacity, setBikeCapacity] = useState<
    "100" | "125" | "150" | "200" | "all"
  >("125");

  const [fareData, setFareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEstimate = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      setError("Please enter both start and end locations");
      return;
    }

    setLoading(true);
    setError("");
    setFareData(null);

    try {
      const response = await fetch(`${API_URL}/fare/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startLocation,
          end: endLocation,
          bike_capacity: bikeCapacity,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.detail || "Failed to estimate fare");
      }

      setFareData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),rgba(0,0,0,0)_70%)]">
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-16">
        <Header />

        <div className="h-4" />

        <RideForm
          startLocation={startLocation}
          setStartLocation={setStartLocation}
          endLocation={endLocation}
          setEndLocation={setEndLocation}
          bikeCapacity={bikeCapacity}
          setBikeCapacity={setBikeCapacity}
          handleEstimate={handleEstimate}
          loading={loading}
        />

        {error && <ErrorBanner message={error} />}
        {loading && <LoadingSpinner />}

        {fareData?.pricing_mode === "single" && (
          <SingleFareCard data={fareData} />
        )}

        {fareData?.pricing_mode === "multi" && (
          <MultiFareGrid
            fares={fareData.fares}
            distance={fareData.distance_km}
            duration={fareData.duration_minutes}

            // FIX: added safe defaults
            auto_fare={fareData.auto_fare ?? { fare: 0, duration_minutes: 0 }}
            bus_fare={fareData.bus_fare ?? { fare: 0, duration_minutes: 0 }}
          />
        )}
      </div>
    </div>
  );
}
