import gpxpy
import pandas as pd
from geopy.distance import geodesic

def parse_gpx(file):
    gpx = gpxpy.parse(file)
    data = []
    
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                data.append({
                    'lat': point.latitude,
                    'lon': point.longitude,
                    'ele': point.elevation
                })
    
    df = pd.DataFrame(data)
    
    # Calcul des distances entre points
    df['dist_diff'] = 0.0
    df['ele_diff'] = 0.0
    
    for i in range(1, len(df)):
        p1 = (df.loc[i-1, 'lat'], df.loc[i-1, 'lon'])
        p2 = (df.loc[i, 'lat'], df.loc[i, 'lon'])
        df.loc[i, 'dist_diff'] = geodesic(p1, p2).kilometers
        df.loc[i, 'ele_diff'] = df.loc[i, 'ele'] - df.loc[i-1, 'ele']
        
    df['dist_cum'] = df['dist_diff'].cumsum()
    return df