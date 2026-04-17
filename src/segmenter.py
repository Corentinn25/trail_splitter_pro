import pandas as pd

def compute_segments(df):
    segments = []
    # Exemple de découpage tous les 10km pour tester l'affichage
    step = 10 
    for i in range(0, int(df['dist_cum'].max()), step):
        sub_df = df[(df['dist_cum'] >= i) & (df['dist_cum'] < i + step)]
        if not sub_df.empty:
            segments.append({
                'Distance (km)': round(sub_df['dist_diff'].sum(), 2),
                'D+ (m)': int(sub_df['ele_diff'].clip(lower=0).sum()),
                'D- (m)': int(abs(sub_df['ele_diff'].clip(upper=0).sum()))
            })
    return pd.DataFrame(segments)