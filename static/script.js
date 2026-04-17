// Fonctions de formatage identiques à tes souhaits
function formatHMS(heuresDecimales) {
    let totalSec = Math.floor(heuresDecimales * 3600);
    let h = Math.floor(totalSec / 3600);
    let m = Math.floor((totalSec % 3600) / 60);
    let s = totalSec % 60;
    return `${h} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
}

function formatAllure(allureDecimale) {
    let m = Math.floor(allureDecimale);
    let s = Math.round((allureDecimale % 1) * 60);
    return `${m} : ${String(s).padStart(2, '0')}`;
}

// Logique d'upload
document.getElementById('gpxFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', { method: 'POST', body: formData });
    const data = await response.json();

    if (data.distance) {
        // On stocke les données pour les calculs futurs
        window.raceData = data;
        alert(`Fichier chargé : ${data.distance} km`);
        // Ici on appellera la fonction de mise à jour de l'UI
    }
});