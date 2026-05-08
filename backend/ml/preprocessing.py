import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPPING_PATH = os.path.join(BASE_DIR, "mapping_config.json")

DEFAULT_JABATAN_MAP = {
    "CEO": 0, "CFO": 1, "CMO": 2, "CTO": 3,
    "Manajer": 4, "SPV": 5, "STAF": 6, "Junior": 7
}

DEFAULT_DIVISI_MAP = {
    "Executive": 0, "Engineering": 1, "Product & Design": 2,
    "Data & AI": 3, "Growth & Marketing": 4, "People & Operations": 5
}

def load_mapping():
    jabatan_map = DEFAULT_JABATAN_MAP
    divisi_map = DEFAULT_DIVISI_MAP
    feature_order = ["Jabatan_Encoded", "Divisi_Encoded"]

    if os.path.exists(MAPPING_PATH):
        try:
            with open(MAPPING_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)

            jabatan_map = data.get("jabatan_map", jabatan_map)
            divisi_map = data.get("divisi_map", divisi_map)
            feature_order = data.get("feature_order", feature_order)
        except Exception:
            pass

    return jabatan_map, divisi_map, feature_order
