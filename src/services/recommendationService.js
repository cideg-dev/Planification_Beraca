import { DataService } from './dataService.js';
import { CONSTANTS } from '../config.js';

export const RecommendationService = {

    /**
     * Analyse et retourne les meilleures suggestions pour une date et un type donné
     */
    async getSuggestions(targetDate, serviceType) {
        console.log(`🧠 Analyse IA pour : ${serviceType} le ${targetDate}`);

        // 1. Récupérer toutes les données nécessaires
        const [intervenants, history] = await Promise.all([
            DataService.getIntervenants(),
            DataService.getInterventions() // On récupère tout l'historique pour analyser la fréquence
        ]);

        // 2. Définir les préférences de catégorie selon le type de culte
        const categoryBonus = getCategoryPreferences(serviceType);

        // 3. Calculer le score pour chaque intervenant
        const scoredCandidates = intervenants.map(person => {
            // A. Vérifier s'il est déjà programmé ce jour-là (Conflit)
            const isBookedToday = history.some(h => 
                h.date === targetDate && 
                (h.intervenantId === person.id || h.intervenantStr === person.last_name)
            );

            if (isBookedToday) return null; // Exclure directement

            let score = 100; // Score de base
            const reasons = [];

            // B. Analyse de l'historique (Rotation)
            const personHistory = history
                .filter(h => h.intervenantId === person.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Du plus récent au plus vieux

            if (personHistory.length > 0) {
                const lastIntervention = personHistory[0];
                const daysSince = (new Date(targetDate) - new Date(lastIntervention.date)) / (1000 * 60 * 60 * 24);
                
                if (daysSince < 7) {
                    score -= 50; // Pénalité forte : a parlé il y a moins d'une semaine
                    reasons.push("🔴 A parlé très récemment");
                } else if (daysSince > 30) {
                    score += 20; // Bonus : reposé
                    reasons.push(`🟢 Dispo depuis ${Math.floor(daysSince)} jours`);
                } else {
                    reasons.push(`A parlé il y a ${Math.floor(daysSince)} jours`);
                }
            } else {
                score += 30; // Bonus : Jamais intervenu (Sang neuf)
                reasons.push("✨ Jamais intervenu");
            }

            // C. Analyse de la Catégorie (Pertinence)
            if (categoryBonus.includes(person.category)) {
                score += 15;
                reasons.push("⭐ Profil adapté au type");
            }

            // D. Analyse du Titre (Hiérarchie)
            // Pour les cultes principaux, on privilégie souvent les gradés
            if (serviceType.includes("Principal") && (person.title === "Pasteur" || person.title === "Diacre")) {
                score += 10;
            }

            return {
                ...person,
                score,
                reasons
            };
        });

        // 4. Filtrer les nuls et trier par score
        return scoredCandidates
            .filter(c => c !== null)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Retourner le Top 5
    }
};

/**
 * Helper : Définit qui est le mieux placé pour quel type
 */
function getCategoryPreferences(type) {
    const t = type.toLowerCase();
    if (t.includes('enseignement') || t.includes('principal') || t.includes('sainte cène')) {
        return ['clergy']; // Clergé prioritaire
    }
    if (t.includes('louange')) {
        return ['singers', 'musicians'];
    }
    return ['clergy', 'members']; // Par défaut, tout le monde
}
