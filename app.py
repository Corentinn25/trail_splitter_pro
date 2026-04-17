from flask import Flask, render_template, request, jsonify
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

    # Parsing et calculs
    try:
        df = parse_gpx(file)
        total_dist = float(df['dist_cum'].max())
        total_dplus = float(df['ele_diff'].clip(lower=0).sum())
        total_dmoins = float(abs(df['ele_diff'].clip(upper=0).sum()))
        
        # On renvoie les stats globales au navigateur
        return jsonify({
            "distance": round(total_dist, 2),
            "dplus": round(total_dplus, 0),
            "dmoins": round(total_dmoins, 0)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)