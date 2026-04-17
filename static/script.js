let raceData = null;

// --- FORMATAGE SÉCURISÉ ---
function formatHMS(hours) {
    if (!isFinite(hours) || hours < 0) return "0 : 00 : 00";
    const totalSec = Math.floor(hours * 3600);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
}

function formatPace(minPerKm) {
    if (!isFinite(minPerKm) || minPerKm <= 0) return "0 : 00";
    const m = Math.floor(minPerKm);
    const s = Math.round((minPerKm % 1) * 60);
    return `${m} : ${String(s).padStart(2, '0')}`;
}

// --- CALCULS ---
function updateCalculations(source) {
    if (!raceData || raceData.distance <= 0) return;

    let cote = parseFloat(document.getElementById('input_cote').value);
    let tempsHrs = parseFloat(document.getElementById('input_temps').value);

    const dist = raceData.distance;
    const dplus = raceData.dplus;
    const dmoins = raceData.dmoins;
    const kmEffort = dist + (dplus / 100) + (dmoins / 200);

    const fFatigue = kmEffort > 15 ? Math.exp(0.029 * Math.pow(kmEffort - 15, 1.545)) : 1.0;

    if (source === 'cote') {
        if (cote <= 0) cote = 1; // Éviter division par zéro
        const tempsMin = (kmEffort * 60 * 1000 * fFatigue) / (31.5 * cote);
        tempsHrs = tempsMin / 60;
        document.getElementById('input_temps').value = tempsHrs.toFixed(2);
    } 
    else if (source === 'temps') {
        if (tempsHrs <= 0) tempsHrs = 0.1; // Éviter division par zéro
        const newCote = (kmEffort * 60 * 1000 * fFatigue) / (31.5 * tempsHrs * 60);
        document.getElementById('input_cote').value = Math.round(newCote);
    }

    // Calcul de l'allure moyenne
    const allureMoy = (tempsHrs * 60) / dist;
    document.getElementById('input_allure').value = allureMoy.toFixed(2);

    // MISE À JOUR DES TEXTES (H:M:S et M:S)
    document.getElementById('display_temps').innerText = formatHMS(tempsHrs);
    document.getElementById('display_allure').innerText = formatPace(allureMoy);
    
    renderTable(allureMoy, tempsHrs);
}

// --- AFFICHAGE TABLEAU ---
function renderTable(allureMoy, tempsTotal) {
    const tbody = document.getElementById('segments_body');
    if (!tbody || !raceData.segments) return;
    
    document.getElementById('table_area').classList.remove('hidden');
    tbody.innerHTML = ""; 

    raceData.segments.forEach((seg, index) => {
        // Temps proportionnel à la distance du segment
        const ratio = seg['Distance (km)'] / raceData.distance;
        const tempsSection = ratio * tempsTotal;
        
        const row = `
            <tr class="border-b border-slate-800 hover:bg-slate-700/50 transition-colors">
                <td class="p-3 text-slate-400">Section ${index + 1}</td>
                <td class="p-3">${seg['Distance (km)']} km</td>
                <td class="p-3 text-red-400">+${seg['D+ (m)']} m</td>
                <td class="p-3 text-slate-400">${formatPace(allureMoy)}</td>
                <td class="p-3 font-mono text-green-400">${formatHMS(tempsSection)}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// --- ÉVÉNEMENTS ---
document.getElementById('gpxFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', { method: 'POST', body: formData });
    const data = await response.json();

    if (data.distance) {
        raceData = data;
        renderChart(data.chart_data);
        updateCalculations('cote');
    }
});

document.getElementById('input_cote').addEventListener('input', () => updateCalculations('cote'));
document.getElementById('input_temps').addEventListener('input', () => updateCalculations('temps'));

// Fonction renderChart identique à la précédente...
function renderChart(chartData) {
    document.getElementById('chart_area').classList.remove('hidden');
    document.getElementById('placeholder_msg').classList.add('hidden');
    const trace = {
        x: chartData.dist_cum, y: chartData.ele,
        type: 'scatter', mode: 'lines', fill: 'tozeroy',
        line: { color: '#2ecc71', width: 2 },
        fillcolor: 'rgba(46, 204, 113, 0.1)'
    };
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 40, r: 20, t: 10, b: 40 },
        xaxis: { gridcolor: '#334155', color: '#94a3b8' },
        yaxis: { gridcolor: '#334155', color: '#94a3b8' }
    };
    Plotly.newPlot('elevation_chart', [trace], layout, {responsive: true});
}