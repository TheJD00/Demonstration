from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal, Dict
from geopy.geocoders import Nominatim
import requests

app = FastAPI(
    title="PillionPal Fare Estimator",
    description="Estimate fair ride cost split between rider and pillion.",
    version="1.0.0",
)

# ---- Constants ----
PETROL_PRICE = 108.49
PLATFORM_FEE_RATE = 0.075

MILEAGE_MAP: Dict[str, int] = {
    "100": 65,
    "125": 55,
    "150": 45,
    "200": 35,
}

OSRM_BASE_URL = "http://router.project-osrm.org/table/v1/driving"

# Geocoder (ignore warning)
geolocator = Nominatim(
    user_agent="pillionpal-fare-estimator",
    timeout=10  # type: ignore[arg-type]
)

# ---- Schemas ----
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


class SingleFareResponse(BaseModel):
    start_coords: Coordinate
    end_coords: Coordinate
    distance_km: float
    duration_minutes: float
    pricing_mode: Literal["single"]
    fare: FareBreakdown


class MultiFareResponse(BaseModel):
    start_coords: Coordinate
    end_coords: Coordinate
    distance_km: float
    duration_minutes: float
    pricing_mode: Literal["multi"]
    fares: Dict[str, FareBreakdown]


# ---- Helpers ----
def geocode_location(place: str) -> Coordinate:
    location = geolocator.geocode(place, country_codes="IN")  # type: ignore[call-arg]
    if not location:
        raise HTTPException(
            status_code=400,
            detail=f"Could not geocode location: '{place}'. Check spelling or try a more specific address."
        )

    # type ignores = silence Pylance nonsense
    return Coordinate(
        lat=location.latitude,      # type: ignore[attr-defined]
        lon=location.longitude      # type: ignore[attr-defined]
    )


def fetch_distance_and_duration(start: Coordinate, end: Coordinate) -> tuple[float, float]:
    coords = f"{start.lon},{start.lat};{end.lon},{end.lat}"
    url = f"{OSRM_BASE_URL}/{coords}?annotations=distance,duration"

    try:
        response = requests.get(url, timeout=5)
    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Could not reach OSRM routing service. Try again later."
        )

    if not response.ok:
        raise HTTPException(
            status_code=502,
            detail="Error fetching distance from routing service."
        )

    data = response.json()

    try:
        distance_m = data["distances"][0][1]
        duration_s = data["durations"][0][1]
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=502,
            detail="OSRM returned an unexpected response format."
        )

    return distance_m / 1000.0, duration_s / 60.0


def calculate_fare(distance_km: float, mileage: float, engine_cc: str, duration_minutes: float) -> FareBreakdown:
    fuel_cost = (distance_km / mileage) * PETROL_PRICE
    platform_fee = fuel_cost * PLATFORM_FEE_RATE
    total_cost = fuel_cost + platform_fee

    rider_share = total_cost * 0.40
    pillion_share = total_cost * 0.60

    return FareBreakdown(
        engine_cc=engine_cc,
        mileage_kmpl=mileage,
        distance_km=round(distance_km, 2),
        duration_minutes=round(duration_minutes, 1),
        fuel_cost=round(fuel_cost, 2),
        platform_fee=round(platform_fee, 2),
        total_cost=round(total_cost, 2),
        rider_share=round(rider_share, 2),
        pillion_share=round(pillion_share, 2),
    )


# ---- Endpoint ----
@app.post("/fare/estimate", response_model=SingleFareResponse | MultiFareResponse)
async def estimate_fare(payload: LocationInput):
    start_coords = geocode_location(payload.start)
    end_coords = geocode_location(payload.end)

    distance_km, duration_minutes = fetch_distance_and_duration(start_coords, end_coords)

    # Multi-bike mode
    if payload.bike_capacity == "all":
        fares = {
            cc: calculate_fare(distance_km, mileage, cc, duration_minutes)
            for cc, mileage in MILEAGE_MAP.items()
        }

        return MultiFareResponse(
            start_coords=start_coords,
            end_coords=end_coords,
            distance_km=round(distance_km, 2),
            duration_minutes=round(duration_minutes, 1),
            pricing_mode="multi",
            fares=fares,
        )

    # Single bike mode
    mileage = MILEAGE_MAP[payload.bike_capacity]
    fare = calculate_fare(distance_km, mileage, payload.bike_capacity, duration_minutes)

    return SingleFareResponse(
        start_coords=start_coords,
        end_coords=end_coords,
        distance_km=round(distance_km, 2),
        duration_minutes=round(duration_minutes, 1),
        pricing_mode="single",
        fare=fare,
    )
