// Utilisation des versions globales chargées via CDN
// jsPDF est disponible via la variable globale jspdf.jsPDF
// jspdf-autotable étend jsPDF
// xlsx est disponible via la variable globale XLSX

// Utilitaire pour charger une image en Base64
const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (e) => {
            console.warn("Erreur chargement logo, PDF sans logo", e);
            resolve(null); // On continue sans logo si erreur
        };
        img.src = url;
    });
};

export const ExportService = {
    
    /**
     * Génère un fichier Excel (.xlsx)
     * @param {Array} interventions - Liste des objets interventions (V2 format)
     * @param {Object} config - Configuration globale (Eglise, Région, etc.)
     */
    exportToExcel(interventions, config = {}) {
        // 1. Préparer les données
        const data = interventions.map(item => {
            let speaker = 'Non assigné';
            if (item.intervenants) {
                speaker = `${item.intervenants.title || ''} ${item.intervenants.first_name || ''} ${item.intervenants.last_name || ''}`.trim();
            } else {
                speaker = item.intervenant_name_snapshot || item.intervenantStr || 'Non assigné';
            }

            return {
                'Date': new Date(item.date).toLocaleDateString('fr-FR'),
                'Jour': item.day_of_week || item.day || '',
                'Type': item.cult_type || item.type || '',
                'Lieu': item.place,
                'Thème/Desc': item.description || '',
                'Intervenant': speaker
            };
        });

        // 2. Créer le workbook
        const ws = XLSX.utils.json_to_sheet([]);
        
        // Ajouter les informations d'en-tête
        XLSX.utils.sheet_add_aoa(ws, [
            ["ASSEMBLÉES DE DIEU DU BÉNIN"],
            [`Église: ${config.church || 'AD BERACA'}`],
            [`Région: ${config.region || ''} | Section: ${config.section || ''}`],
            [`Planning: ${config.year || ''} - Trimestre ${config.quarter || ''}`],
            [""] // Ligne vide
        ], { origin: "A1" });

        // Ajouter les données après l'en-tête
        XLSX.utils.sheet_add_json(ws, data, { origin: "A6", skipHeader: false });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Planning");

        // 3. Télécharger
        XLSX.writeFile(wb, `Planning_AD_${config.church || 'Beraca'}_${new Date().toISOString().slice(0,10)}.xlsx`);
    },

    /**
     * Génère un fichier PDF
     * @param {Array} interventions - Liste des objets interventions
     * @param {Object} config - Configuration globale
     */
    async exportToPdf(interventions, config = {}) {
        // Initialisation de jsPDF (format UMD)
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Charger le logo défini dans la config ou par défaut
        let logoPath = config.logo && config.logo.trim() !== '' ? config.logo : './logo.jpeg';
        // Construire l'URL complète pour le chargement d'image
        if (!logoPath.startsWith('http')) {
            logoPath = new URL(logoPath, window.location.href).href;
        }
        const logoData = await loadImage(logoPath);

        // --- EN-TÊTE ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;

        // Logo
        if (logoData) {
            doc.addImage(logoData, 'JPEG', 14, 10, 20, 20); // x, y, w, h
        }

        // Titre Principal
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text("ASSEMBLÉES DE DIEU DU BÉNIN", pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 8;
        doc.setFontSize(14);
        doc.text(`ÉGLISE : ${config.church || 'AD BERACA'}`, pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 7;
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Région: ${config.region || 'ATACORA'} | Section: ${config.section || 'NATITINGOU'}`, pageWidth / 2, yPos, { align: 'center' });
        
        yPos += 5;
        // Contacts
        let contactText = "";
        if (config.phone) contactText += `Tél: ${config.phone} `;
        if (config.email) contactText += `| Email: ${config.email}`;
        if (contactText) {
            doc.setFontSize(9);
            doc.text(contactText.trim().replace(/^\| /, ''), pageWidth / 2, yPos, { align: 'center' });
            yPos += 5;
        }

        doc.setFontSize(11);
        doc.setTextColor(44, 62, 80);
        doc.text(`Planning Année: ${config.year || '2026'} - Trimestre: ${config.quarter || '1'}`, pageWidth / 2, yPos, { align: 'center' });
        
        // Ligne de séparation
        yPos += 5;
        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.line(14, yPos, pageWidth - 14, yPos);

        // --- TABLEAU ---
        const tableColumn = ["Date", "Jour", "Type", "Lieu", "Intervenant", "Détails"];
        const tableRows = [];

        interventions.forEach(item => {
            let speaker = 'Non assigné';
            if (item.intervenants) {
                speaker = `${item.intervenants.title || ''} ${item.intervenants.first_name || ''} ${item.intervenants.last_name || ''}`.trim();
            } else {
                speaker = item.intervenant_name_snapshot || item.intervenantStr || 'Non assigné';
            }

            const interventionData = [
                new Date(item.date).toLocaleDateString('fr-FR'),
                item.day_of_week || item.day || '',
                item.cult_type || item.type || '',
                item.place,
                speaker,
                item.description || ''
            ];
            tableRows.push(interventionData);
        });

        // Utilisation de autoTable (Extension jsPDF)
        // L'erreur getTextColor vient souvent d'un mauvais passage de l'instance doc
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: yPos + 10,
            theme: 'grid',
            styles: { 
                fontSize: 10,
                cellPadding: 3,
                valign: 'middle'
            },
            headStyles: { 
                fillColor: [240, 240, 240],
                textColor: [44, 62, 80],
                fontStyle: 'bold'
            },
            // Pied de page du tableau
            didDrawPage: function (data) {
                // Info Bancaire en bas de page
                if (config.bank) {
                    doc.setFontSize(9);
                    doc.setTextColor(44, 62, 80);
                    doc.text(`Données Bancaires: ${config.bank}`, 14, pageHeight - 15);
                }

                // Footer technique
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${doc.internal.getNumberOfPages()}`, 
                    pageWidth - 20, 
                    pageHeight - 10,
                    { align: 'right' }
                );
            }
        });

        doc.save(`Planning_AD_${config.church || 'Beraca'}_${new Date().toISOString().slice(0,10)}.pdf`);
    }
};
