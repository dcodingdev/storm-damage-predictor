

from pydantic import BaseModel, Field

TIER_NAMES = ["None", "Low", "Medium", "High"]

FEATURE_COLS = [
    "STATE", "MONTH_NAME", "EVENT_TYPE",
    "INJURIES_DIRECT", "INJURIES_INDIRECT",
    "DEATHS_DIRECT", "DEATHS_INDIRECT",
    "MAGNITUDE", "duration_min",
    "season", "state_avg_damage", "event_avg_damage",
]

SEASON_MAP = {
    "December": 0, "January": 0, "February": 0,
    "March": 1, "April": 1, "May": 1,
    "June": 2, "July": 2, "August": 2,
    "September": 3, "October": 3, "November": 3,
}

STATE_LOOKUP = {
    'ALABAMA': 0, 'ALASKA': 1, 'AMERICAN SAMOA': 2, 'ARIZONA': 3,
    'ARKANSAS': 4, 'ATLANTIC NORTH': 5, 'ATLANTIC SOUTH': 6, 'CALIFORNIA': 7,
    'COLORADO': 8, 'CONNECTICUT': 9, 'DELAWARE': 10, 'DISTRICT OF COLUMBIA': 11,
    'E PACIFIC': 12, 'FLORIDA': 13, 'GEORGIA': 14, 'GUAM': 15,
    'GUAM WATERS': 16, 'GULF OF ALASKA': 17, 'GULF OF MEXICO': 18, 'HAWAII': 19,
    'HAWAII WATERS': 20, 'IDAHO': 21, 'ILLINOIS': 22, 'INDIANA': 23,
    'IOWA': 24, 'KANSAS': 25, 'KENTUCKY': 26, 'LAKE ERIE': 27,
    'LAKE HURON': 28, 'LAKE MICHIGAN': 29, 'LAKE ONTARIO': 30, 'LAKE ST CLAIR': 31,
    'LAKE SUPERIOR': 32, 'LOUISIANA': 33, 'MAINE': 34, 'MARYLAND': 35,
    'MASSACHUSETTS': 36, 'MICHIGAN': 37, 'MINNESOTA': 38, 'MISSISSIPPI': 39,
    'MISSOURI': 40, 'MONTANA': 41, 'NEBRASKA': 42, 'NEVADA': 43,
    'NEW HAMPSHIRE': 44, 'NEW JERSEY': 45, 'NEW MEXICO': 46, 'NEW YORK': 47,
    'NORTH CAROLINA': 48, 'NORTH DAKOTA': 49, 'OHIO': 50, 'OKLAHOMA': 51,
    'OREGON': 52, 'PENNSYLVANIA': 53, 'PUERTO RICO': 54, 'RHODE ISLAND': 55,
    'SOUTH CAROLINA': 56, 'SOUTH DAKOTA': 57, 'ST LAWRENCE R': 58, 'TENNESSEE': 59,
    'TEXAS': 60, 'UTAH': 61, 'VERMONT': 62, 'VIRGIN ISLANDS': 63,
    'VIRGINIA': 64, 'WASHINGTON': 65, 'WEST VIRGINIA': 66, 'WISCONSIN': 67,
    'WYOMING': 68,
}

EVENT_TYPE_LOOKUP = {
    'Astronomical Low Tide': 0, 'Avalanche': 1, 'Blizzard': 2, 'Coastal Flood': 3,
    'Cold/Wind Chill': 4, 'Debris Flow': 5, 'Dense Fog': 6, 'Dense Smoke': 7,
    'Drought': 8, 'Dust Devil': 9, 'Dust Storm': 10, 'Excessive Heat': 11,
    'Extreme Cold/Wind Chill': 12, 'Flash Flood': 13, 'Flood': 14, 'Freezing Fog': 15,
    'Frost/Freeze': 16, 'Funnel Cloud': 17, 'Hail': 18, 'Heat': 19,
    'Heavy Rain': 20, 'Heavy Snow': 21, 'High Surf': 22, 'High Wind': 23,
    'Hurricane (Typhoon)': 24, 'Ice Storm': 25, 'Lake-Effect Snow': 26, 'Lakeshore Flood': 27,
    'Lightning': 28, 'Marine Dense Fog': 29, 'Marine Hail': 30, 'Marine High Wind': 31,
    'Marine Hurricane/Typhoon': 32, 'Marine Lightning': 33, 'Marine Strong Wind': 34,
    'Marine Thunderstorm Wind': 35, 'Marine Tropical Depression': 36, 'Marine Tropical Storm': 37,
    'Northern Lights': 38, 'Rip Current': 39, 'Seiche': 40, 'Sleet': 41,
    'Sneakerwave': 42, 'Storm Surge/Tide': 43, 'Strong Wind': 44, 'Thunderstorm Wind': 45,
    'Tornado': 46, 'Tropical Depression': 47, 'Tropical Storm': 48, 'Tsunami': 49,
    'Volcanic Ash': 50, 'Volcanic Ashfall': 51, 'Waterspout': 52, 'Wildfire': 53,
    'Winter Storm': 54, 'Winter Weather': 55,
}

MONTH_NAME_LOOKUP = {
    'April': 0, 'August': 1, 'December': 2, 'February': 3,
    'January': 4, 'July': 5, 'June': 6, 'March': 7,
    'May': 8, 'November': 9, 'October': 10, 'September': 11,
}

STATE_AVG_DAMAGE = {
    'ALABAMA': 305247.009863532, 'ALASKA': 50642.92734145317, 'AMERICAN SAMOA': 477201.6260162602,
    'ARIZONA': 266796.79189531447, 'ARKANSAS': 142784.77148772852, 'ATLANTIC NORTH': 34.28310502283105,
    'ATLANTIC SOUTH': 615.0307333615939, 'CALIFORNIA': 896488.1638103717, 'COLORADO': 235567.69381405166,
    'CONNECTICUT': 39756.01317200184, 'DELAWARE': 39875.679481448366, 'DISTRICT OF COLUMBIA': 200929.67741935485,
    'E PACIFIC': 866.9957081545065, 'FLORIDA': 2482074.2112828935, 'GEORGIA': 248817.57413229762,
    'GUAM': 11349464.570063693, 'GUAM WATERS': 0.0, 'GULF OF ALASKA': 720.9302325581396,
    'GULF OF MEXICO': 3992.2436629367435, 'HAWAII': 384374.3121779401, 'HAWAII WATERS': 0.0,
    'IDAHO': 111987.73576183432, 'ILLINOIS': 125201.32942462142, 'INDIANA': 88594.35694815386,
    'IOWA': 204015.43157515515, 'KANSAS': 51198.44964420796, 'KENTUCKY': 64665.11739139064,
    'LAKE ERIE': 409.2885375494071, 'LAKE HURON': 6.561679790026247, 'LAKE MICHIGAN': 1103.0075187969924,
    'LAKE ONTARIO': 367.13286713286715, 'LAKE ST CLAIR': 153.60983102918587, 'LAKE SUPERIOR': 293.4936350777935,
    'LOUISIANA': 3922080.7080076146, 'MAINE': 49814.42211390799, 'MARYLAND': 64868.89920880633,
    'MASSACHUSETTS': 59026.924533228885, 'MICHIGAN': 206512.43038721092, 'MINNESOTA': 106568.2575941186,
    'MISSISSIPPI': 956855.3859567542, 'MISSOURI': 177015.0782458883, 'MONTANA': 11233.616413647978,
    'NEBRASKA': 131941.8335187245, 'NEVADA': 130960.65209559265, 'NEW HAMPSHIRE': 48124.912961803384,
    'NEW JERSEY': 1110251.3300375717, 'NEW MEXICO': 143782.6636035152, 'NEW YORK': 107374.21924025654,
    'NORTH CAROLINA': 340765.4209916877, 'NORTH DAKOTA': 208550.33451192456, 'OHIO': 157518.08240023622,
    'OKLAHOMA': 154943.33989004078, 'OREGON': 448100.4501260353, 'PENNSYLVANIA': 87516.18279907158,
    'PUERTO RICO': 3358153.177396943, 'RHODE ISLAND': 55187.46856663872, 'SOUTH CAROLINA': 85038.09776870557,
    'SOUTH DAKOTA': 53004.425822345176, 'ST LAWRENCE R': 586.2068965517242, 'TENNESSEE': 214579.01836482857,
    'TEXAS': 913659.0557759805, 'UTAH': 94943.67826319067, 'VERMONT': 175531.55378093265,
    'VIRGIN ISLANDS': 94367.29857819906, 'VIRGINIA': 61318.15928514488, 'WASHINGTON': 516839.4052234238,
    'WEST VIRGINIA': 49515.367011295486, 'WISCONSIN': 108600.10421873438, 'WYOMING': 12032.736864053379,
}

EVENT_AVG_DAMAGE = {
    'Astronomical Low Tide': 15388.185654008439, 'Avalanche': 6229.346557759626,
    'Blizzard': 80145.41438416681, 'Coastal Flood': 4761076.731061428,
    'Cold/Wind Chill': 115529.4503053859, 'Debris Flow': 549693.6313071116,
    'Dense Fog': 3054.0222630250173, 'Dense Smoke': 884.3537414965987,
    'Drought': 384800.74130961014, 'Dust Devil': 7815.019607843137,
    'Dust Storm': 12849.391727493918, 'Excessive Heat': 891.4589923981302,
    'Extreme Cold/Wind Chill': 19936.888594457327, 'Flash Flood': 943428.4540878792,
    'Flood': 698049.6055167688, 'Freezing Fog': 7410.677618069815,
    'Frost/Freeze': 394129.32294074906, 'Funnel Cloud': 12.490691355539902,
    'Hail': 104208.02884643845, 'Heat': 14938.363516533898,
    'Heavy Rain': 51614.08036309392, 'Heavy Snow': 15153.678344372622,
    'High Surf': 30671.592212922034, 'High Wind': 173014.73729813244,
    'Hurricane (Typhoon)': 78005655.70497906, 'Ice Storm': 485649.21642388345,
    'Lake-Effect Snow': 103698.17287420941, 'Lakeshore Flood': 414749.30362116994,
    'Lightning': 59546.955253453685, 'Marine Dense Fog': 2954.5454545454545,
    'Marine Hail': 51.401869158878505, 'Marine High Wind': 15840.635416666666,
    'Marine Hurricane/Typhoon': 32110.091743119265, 'Marine Lightning': 500.0,
    'Marine Strong Wind': 13181.807228915663, 'Marine Thunderstorm Wind': 1311.8551836355184,
    'Marine Tropical Depression': 0.0, 'Marine Tropical Storm': 0.0,
    'Northern Lights': 0.0, 'Rip Current': 91.63135593220339,
    'Seiche': 18644.736842105263, 'Sleet': 6136.522753792298,
    'Sneakerwave': 1612.9032258064517, 'Storm Surge/Tide': 36839317.42598187,
    'Strong Wind': 33659.22389229235, 'Thunderstorm Wind': 29929.98211293705,
    'Tornado': 1017389.2322079865, 'Tropical Depression': 133119.5652173913,
    'Tropical Storm': 2990812.6574307303, 'Tsunami': 3050038.4615384615,
    'Volcanic Ash': 7142.857142857143, 'Volcanic Ashfall': 0.0,
    'Waterspout': 925.2327447833065, 'Wildfire': 4426331.989062835,
    'Winter Storm': 35607.57973005917, 'Winter Weather': 1585.1612980711488,
}


# ── Request ───────────────────────────────────────────────────────
class StormInput(BaseModel):
    state: str = Field(..., description="e.g. 'FLORIDA'")
    month_name: str = Field(..., description="e.g. 'July'")
    event_type: str = Field(..., description="e.g. 'Tornado'")
    injuries_direct: int = Field(0, ge=0, description="Direct injuries reported")
    magnitude: float = Field(0.0, ge=0.0, description="Event magnitude (wind speed, hail size, etc.)")
    duration_min: float = Field(0.0, ge=0.0, le=10000.0, description="Event duration in minutes")


# ── Response ──────────────────────────────────────────────────────
class ShapFeature(BaseModel):
    feature: str
    shap_value: float
    feature_value: float

class ShapExplanation(BaseModel):
    base_value: float
    top_features: list[ShapFeature]

class ClassProbability(BaseModel):
    tier: str
    probability: float

class PredictResponse(BaseModel):
    predicted_class: int
    predicted_tier: str
    confidence: float
    probabilities: list[ClassProbability]
    shap: ShapExplanation


# ── Metrics ───────────────────────────────────────────────────────
class ModelMetric(BaseModel):
    model: str
    weighted_f1: float

class BestParams(BaseModel):
    n_estimators: int
    max_depth: int
    learning_rate: float
    subsample: float
    colsample_bytree: float

class MetricsResponse(BaseModel):
    models: list[ModelMetric]
    winner: str
    best_params: BestParams