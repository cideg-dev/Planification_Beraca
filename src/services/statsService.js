export const StatsService = {
    
    calculateStats(interventions) {
        if (!interventions || interventions.length === 0) return null;

        const total = interventions.length;

        // 1. Répartition par Type (pour Camembert)
        const typeCount = {};
        interventions.forEach(i => {
            const type = i.cult_type || i.type || 'Inconnu';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });

        // 2. Top Intervenants (pour Barres)
        const speakerCount = {};
        interventions.forEach(i => {
            let name = 'Inconnu';
            if (i.intervenants) {
                name = `${i.intervenants.title || ''} ${i.intervenants.first_name || ''} ${i.intervenants.last_name || ''}`.trim();
            } else {
                name = i.intervenant_name_snapshot || i.intervenantStr || i.intervenant?.last_name || 'Inconnu';
            }
            speakerCount[name] = (speakerCount[name] || 0) + 1;
        });
        
        // Trier et prendre le Top 5
        const sortedSpeakers = Object.entries(speakerCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // 3. Activité Mensuelle (pour Ligne)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyActivity = new Array(12).fill(0);
        
        interventions.forEach(i => {
            const d = new Date(i.date);
            if (!isNaN(d)) {
                monthlyActivity[d.getMonth()]++;
            }
        });

        // 4. Lieu le plus fréquent
        const placeCount = {};
        let topPlace = { name: '-', count: 0 };
        interventions.forEach(i => {
            const place = i.place || '-';
            placeCount[place] = (placeCount[place] || 0) + 1;
            if (placeCount[place] > topPlace.count) {
                topPlace = { name: place, count: placeCount[place] };
            }
        });

        return {
            kpi: {
                total,
                topSpeaker: sortedSpeakers[0] ? sortedSpeakers[0][0] : '-',
                topPlace: topPlace.name
            },
            charts: {
                types: {
                    labels: Object.keys(typeCount),
                    data: Object.values(typeCount)
                },
                speakers: {
                    labels: sortedSpeakers.map(s => s[0]),
                    data: sortedSpeakers.map(s => s[1])
                },
                timeline: {
                    labels: months,
                    data: monthlyActivity
                }
            }
        };
    }
};