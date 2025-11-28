from fastapi import FastAPI
from geopy.geocoders import Nominatim
# from geopy.distance import geodesic
# import time
import requests

app = FastAPI()
PERTOL_PRICE = 108.49
PLATFORM_FEE = 0.075
geolocator = Nominatim(user_agent="jagadishapj@gmail.com", timeout=10)

@app.get("/")
async def read_root(start: str, end: str,bike_capacity: str):
    start_location = geolocator.geocode(start,country_codes="IN")
    end_location = geolocator.geocode(end,country_codes="IN",)
    coords = f"{start_location.longitude},{start_location.latitude};{end_location.longitude},{end_location.latitude}"
    url = f"http://router.project-osrm.org/table/v1/driving/{coords}?annotations=distance,duration"
    response = requests.get(url)
    if not response.ok:
        return {"error": "Error fetching data from OSRM API"}
    data = response.json()
    distance_km = data['distances'][1][0] / 1000
    distance_mins = data['durations'][1][0] / 60 
    if bike_capacity == "100":
        mileage = 65
    elif bike_capacity == "125":
        mileage = 55
    elif bike_capacity == "150":
        mileage = 45
    elif bike_capacity == "200":
        mileage = 35
    elif bike_capacity == "all":
        mil_list = [65, 55, 45, 35]
        fuel_costs = []
        rider_shares = []
        pillion_shares = []
        total_costs = []
        for mil in mil_list:
            fuel_costs.append((distance_km / mil) * PERTOL_PRICE)
            rider_shares.append(fuel_costs[-1] * 0.40)
            pillion_shares.append(fuel_costs[-1] * 0.60)
            total_costs.append(fuel_costs[-1] + (fuel_costs[-1] * PLATFORM_FEE))
        return{
            "distance_km": round(distance_km,2),
            "distance_mins": round(distance_mins,1),
            "start_coords": (start_location.latitude, start_location.longitude),
            "end_coords": (end_location.latitude, end_location.longitude),
            "fuel_costs": {
                "100cc": round(fuel_costs[0], 2),
                "125cc": round(fuel_costs[1], 2),
                "150cc": round(fuel_costs[2], 2),
                "200cc": round(fuel_costs[3], 2)
            },
            "rider_shares": {
                "100cc": round(rider_shares[0], 2),
                "125cc": round(rider_shares[1], 2),
                "150cc": round(rider_shares[2], 2),
                "200cc": round(rider_shares[3], 2)
            },
            "pillion_shares": {
                "100cc": round(pillion_shares[0], 2),
                "125cc": round(pillion_shares[1], 2),
                "150cc": round(pillion_shares[2], 2),
                "200cc": round(pillion_shares[3], 2)
            }
        }
    else:
        return {"error": "Invalid bike capacity"}
    fuel_cost = (distance_km / mileage) * PERTOL_PRICE
    rider_share = fuel_cost * 0.40
    pillion_share = fuel_cost * 0.60
    total_cost = fuel_cost + (fuel_cost * PLATFORM_FEE)
    

    return{

        "distance_km": round(distance_km,2),
        "distance_mins": round(distance_mins,1),
        "start_coords": (start_location.latitude, start_location.longitude),
        "end_coords": (end_location.latitude, end_location.longitude),
        "fuel_cost": round(fuel_cost, 2),
        "rider_share": round(rider_share, 2),
        "pillion_share": round(pillion_share, 2),
        "total_cost": round(total_cost, 2)
    }