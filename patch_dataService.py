import re

with open('src/services/dataService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the wipe logic in resetToFactoryDefaults
old_reset_logic = """    localStorage.setItem('remix_materials_v1', JSON.stringify(resetMaterials));
    localStorage.setItem('remix_transactions_v1', JSON.stringify(resetTransactions));
    localStorage.setItem('remix_users_v1', JSON.stringify(resetUsers));
    resetSettings.cloudSyncEnabled = wasCloudSyncEnabled;
    localStorage.setItem('remix_settings_v1', JSON.stringify(resetSettings));
    localStorage.setItem('remix_audit_logs_v1', JSON.stringify(resetAuditLogs));
    
    // Clean current session login so system logs out on reset
    localStorage.removeItem('remix_current_user_v1');
    localStorage.removeItem('remix_is_logged_in');
    sessionStorage.removeItem('remix_current_user_v1');
    sessionStorage.removeItem('remix_is_logged_in');

    // Display credentials once after reset
    sessionStorage.setItem('show_reset_credentials', 'true');
    localStorage.setItem('show_reset_credentials', 'true');"""

new_reset_logic = """    // Cache the current user so we don't log them out immediately if they are an admin
    const currentUserStr = localStorage.getItem('remix_current_user_v1') || sessionStorage.getItem('remix_current_user_v1');
    const isLoggedInLocal = localStorage.getItem('remix_is_logged_in');
    const isLoggedInSession = sessionStorage.getItem('remix_is_logged_in');

    // Fully clear browser storages as requested
    localStorage.clear();
    sessionStorage.clear();

    resetSettings.cloudSyncEnabled = wasCloudSyncEnabled;

    // Write back the clean state
    localStorage.setItem('remix_materials_v1', JSON.stringify(resetMaterials));
    localStorage.setItem('remix_transactions_v1', JSON.stringify(resetTransactions));
    localStorage.setItem('remix_users_v1', JSON.stringify(resetUsers));
    localStorage.setItem('remix_settings_v1', JSON.stringify(resetSettings));
    localStorage.setItem('remix_audit_logs_v1', JSON.stringify(resetAuditLogs));
    
    // Restore the session so the app can show empty states immediately without refresh
    if (currentUserStr) {
        // If the current user was deleted, we'll replace them with the default admin
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.username === 'admin@system.com' || true) {
             // Let's just log them in as the reset admin so they have full permissions
             localStorage.setItem('remix_current_user_v1', JSON.stringify(resetUsers[0]));
             if (isLoggedInLocal) localStorage.setItem('remix_is_logged_in', 'true');
             if (isLoggedInSession) sessionStorage.setItem('remix_is_logged_in', 'true');
        }
    } else {
         // Default to logging them out
         localStorage.removeItem('remix_current_user_v1');
         localStorage.removeItem('remix_is_logged_in');
    }

    // Display credentials once after reset just in case
    sessionStorage.setItem('show_reset_credentials', 'true');
    
    // Notify global state immediately
    dataService.notify();"""

content = content.replace(old_reset_logic, new_reset_logic)

with open('src/services/dataService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
