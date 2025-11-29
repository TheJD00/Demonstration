from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal, Dict
from geopy.geocoders import Nominatim
from geopy.location import Location
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(
    title="PillionPal Fare Estimator",
    description="Estimate fair ride cost split between rider and pillion.",
    version="1.0.0",
)

# --------------------------------------
# CORS
# --------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # keep open during dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------
# CONSTANTS
# --------------------------------------
PETROL_PRICE = 108.49
PLATFORM_FEE_RATE = 0.075

MILEAGE_MAP: Dict[str, int] = {
    "100": 65,
    "125": 55,
    "150": 45,
    "200": 35,
}

ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImViZTViOTkyNGYyMDRiOWRiNTg5OTVkMWQzNDgyYmE2IiwiaCI6Im11cm11cjY0In0="

# --------------------------------------
# GEOCODER
# --------------------------------------
geolocator = Nominatim(
    user_agent="pillionpal",
    timeout=10  # type: ignore
)

# --------------------------------------
# MODELS
# --------------------------------------
class LocationInput(BaseModel):
    start: str
    end: str
    bike_capacity: Literal["100", "125", "150", "200", "all"]


class Coordinate(BaseModel):
    lat: float
    lon: float


class FareBreakdown(BaseModel):
    engine_cc: str
    mileage_kmpl: float
    distance_km: float
    duration_minutes: float
    fuel_cost: float
    platform_fee: float
    total_cost: float
    rider_share: float
    pillion_share: float


class AutoFareEstimate(BaseModel):
    fare: float
    duration_minutes: float


class BusFareEstimate(BaseModel):
    fare: float
    duration_minutes: float


class SingleFareResponse(BaseModel):
    start_coords: Coordinate
    end_coords: Coordinate
    distance_km: float
    duration_minutes: float
    pricing_mode: Literal["single"]
    fare: FareBreakdown
    auto_fare: AutoFareEstimate
    bus_fare: BusFareEstimate


class MultiFareResponse(BaseModel):
    start_coords: Coordinate
    end_coords: Coordinate
    distance_km: float
    duration_minutes: float
    pricing_mode: Literal["multi"]
    fares: Dict[str, FareBreakdown]
    auto_fare: AutoFareEstimate
    bus_fare: BusFareEstimate


# --------------------------------------
# HELPERS
# --------------------------------------
def geocode_location(place: str) -> Coordinate:
    loc_raw = geolocator.geocode(place, country_codes="IN")  # type: ignore
    loc: Location | None = loc_raw if isinstance(loc_raw, Location) else None

    if loc is None:
        raise HTTPException(
            status_code=400,
            detail=f"Could not geocode location: '{place}'."
        )

    return Coordinate(lat=round(loc.latitude, 6), lon=round(loc.longitude, 6))


def fetch_distance_and_duration(start: Coordinate, end: Coordinate):
    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    payload = {
        "coordinates": [
            [start.lon, start.lat],
            [end.lon, end.lat]
        ]
    }

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        res.raise_for_status()
    except:
        raise HTTPException(
            status_code=502,
            detail="Could not reach ORS routing service."
        )

    data = res.json()

    try:
        summary = data["routes"][0]["summary"]
        distance_km = round(summary["distance"] / 1000, 2)
        duration_min = round(summary["duration"] / 60, 1)
    except:
        raise HTTPException(
            status_code=502,
            detail="ORS returned unexpected routing structure."
        )

    return distance_km, duration_min


def calculate_fare(distance_km: float, mileage: float, engine_cc: str, duration_minutes: float):
    fuel_cost = (distance_km / mileage) * PETROL_PRICE
    platform_fee = fuel_cost * PLATFORM_FEE_RATE
    total_cost = fuel_cost + platform_fee

    return FareBreakdown(
        engine_cc=engine_cc,
        mileage_kmpl=mileage,
        distance_km=distance_km,
        duration_minutes=duration_minutes,
        fuel_cost=round(fuel_cost),
        platform_fee=round(platform_fee),
        total_cost=round(total_cost),
        rider_share=round(total_cost * 0.40),
        pillion_share=round(total_cost * 0.60),
    )


# ------------------------------
# AUTO ESTIMATE (simple model)
# ------------------------------
def estimate_auto_fare(distance_km: float, duration_minutes: float) -> AutoFareEstimate:
    base = 30
    per_km = 12
    fare = base + (distance_km * per_km)
    return AutoFareEstimate(
        fare=round(fare),
        duration_minutes=round(duration_minutes * 1.2, 1)
    )


# ------------------------------
# BUS ESTIMATE (simple model)
# ------------------------------
def estimate_bus_fare(distance_km: float, duration_minutes: float) -> BusFareEstimate:
    if distance_km <= 5:
        fare = 10
    else:
        fare = 10 + (distance_km - 5) * 2

    return BusFareEstimate(
        fare=max(10, round(fare)),
        duration_minutes=round(duration_minutes * 1.8, 1)
    )


# --------------------------------------
# ENDPOINT
# --------------------------------------
@app.post("/fare/estimate", response_model=SingleFareResponse | MultiFareResponse)
async def estimate_fare(payload: LocationInput):
    start_coords = geocode_location(payload.start)
    end_coords = geocode_location(payload.end)

    distance_km, duration_minutes = fetch_distance_and_duration(start_coords, end_coords)

    auto = estimate_auto_fare(distance_km, duration_minutes)
    bus = estimate_bus_fare(distance_km, duration_minutes)

    # MULTI ENGINE
    if payload.bike_capacity == "all":
        fares = {
            cc: calculate_fare(distance_km, mileage, cc, duration_minutes)
            for cc, mileage in MILEAGE_MAP.items()
        }

        return MultiFareResponse(
            start_coords=start_coords,
            end_coords=end_coords,
            distance_km=distance_km,
            duration_minutes=duration_minutes,
            pricing_mode="multi",
            fares=fares,
            auto_fare=auto,
            bus_fare=bus,
        )

    # SINGLE ENGINE
    mileage = MILEAGE_MAP[payload.bike_capacity]
    fare = calculate_fare(distance_km, mileage, payload.bike_capacity, duration_minutes)

    return SingleFareResponse(
        start_coords=start_coords,
        end_coords=end_coords,
        distance_km=distance_km,
        duration_minutes=duration_minutes,
        pricing_mode="single",
        fare=fare,
        auto_fare=auto,
        bus_fare=bus,
    )
