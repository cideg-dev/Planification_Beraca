// Utilitaires pour l'interface utilisateur

export const UI = {
    /**
     * Affiche une alerte/notification à l'utilisateur
     * @param {string} message - Le message à afficher
     * @param {string} type - 'success', 'danger', 'warning', 'info'
     */
    showAlert(message, type = 'info') {
        const alertPlaceholder = document.getElementById('alert-placeholder');
        if (!alertPlaceholder) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);

        // Auto-dismiss après 5 secondes
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert'));
            if (alert) alert.close();
        }, 5000);
    },

    /**
     * Affiche ou masque un spinner de chargement global
     * @param {boolean} show - Vrai pour afficher, Faux pour masquer
     */
    toggleLoading(show) {
        let loader = document.getElementById('global-loader');
        
        if (!loader && show) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex; justify-content: center; align-items: center;
                z-index: 9999;
            `;
            loader.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Chargement...</span></div>';
            document.body.appendChild(loader);
        }

        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    },

    /**
     * Met à jour l'indicateur de synchronisation dans la navbar
     */
    updateSyncStatus(status) {
        // Cette fonction reprend la logique existante mais encapsulée
        const iconMap = {
            'loading': 'fas fa-sync-alt fa-spin',
            'synced': 'fas fa-check-circle text-success',
            'error': 'fas fa-exclamation-triangle text-danger',
            'saved': 'fas fa-save text-primary'
        };
        
        const labelMap = {
            'loading': 'Chargement...',
            'synced': 'Synchronisé',
            'error': 'Erreur',
            'saved': 'Sauvegardé'
        };

        const container = document.getElementById('sync-indicator');
        if (!container) return;

        container.innerHTML = `<i class="${iconMap[status] || ''}"></i> <span class="d-none d-md-inline">${labelMap[status] || ''}</span>`;
    }
};
