import math

def estimer_temps_utmb(distance_km, d_plus, d_moins, cote_utmb):
    if distance_km <= 0:
        return 0
    
    # Logique Distance-Effort (UTMB)
    km_effort = distance_km + (d_plus / 100) + (d_moins / 200)
    
    # Facteur de fatigue exponentiel (basé sur l'effort)
    f_fatigue = math.exp(0.029 * math.pow(km_effort - 15, 1.545)) if km_effort > 15 else 1.0
    
    # Formule de base : Vitesse (km/h) = 31.5 / (Cote / 1000)
    # Temps (min) = (km_effort * 60 * 1000 * f_fatigue) / (31.5 * Cote)
    temps_minutes = (km_effort * 60 * 1000 * f_fatigue) / (31.5 * cote_utmb)
    
    return temps_minutes