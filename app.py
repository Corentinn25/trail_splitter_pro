from flask import Flask, render_template, request, jsonify
import pandas as pd
# On importe tes fonctions depuis le dossier src
from src.parser import parse_gpx
from src.segmenter import compute_segments
from src.calculateur import estimer_temps_utmb

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier trouvé"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nom de fichier vide"}), 400

    try:
        # 1. Parsing du fichier GPX via src/parser.py
        df = parse_gpx(file)
        
        # 2. Calcul des stats globales
        total_dist = float(df['dist_cum'].max())
        total_dplus = float(df['ele_diff'].clip(lower=0).sum())
        total_dmoins = float(abs(df['ele_diff'].clip(upper=0).sum()))
        
        # 3. Génération des segments via src/segmenter.py
        # On passe le DataFrame pour obtenir le découpage montées/descentes
        df_segments = compute_segments(df)
        segments_list = df_segments.to_dict(orient='records')
        
        # 4. Préparation des données pour le graphique Plotly
        # On réduit un peu le nombre de points si le fichier est énorme (optionnel)
        chart_data = {
            "dist_cum": df['dist_cum'].tolist(),
            "ele": df['ele'].tolist()
        }
        
        # 5. On renvoie tout au JavaScript
        return jsonify({
            "distance": round(total_dist, 2),
            "dplus": int(total_dplus),
            "dmoins": int(total_dmoins),
            "segments": segments_list,
            "chart_data": chart_data
        })
        
    except Exception as e:
        # En cas d'erreur, on renvoie le message pour l'afficher dans la console web
        print(f"Erreur lors de l'upload: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)