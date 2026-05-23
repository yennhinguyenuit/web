const adminShell = document.getElementById('admin-shell');
const adminSidebarToggle = document.getElementById('admin-sidebar-toggle');

if (!adminShell || !adminSidebarToggle) {
    console.error('Admin layout toggle is missing a required element.', {
        hasShell: Boolean(adminShell),
        hasToggle: Boolean(adminSidebarToggle),
    });
}

function setAdminSidebarCollapsed(isCollapsed) {
    if (!adminShell || !adminSidebarToggle) return;

    adminShell.classList.toggle('admin-sidebar-collapsed', isCollapsed);
    adminSidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));

    try {
        localStorage.setItem('luxe_admin_sidebar_collapsed', isCollapsed ? '1' : '0');
    } catch {
        // Ignore private-mode storage errors.
    }
}

try {
    setAdminSidebarCollapsed(localStorage.getItem('luxe_admin_sidebar_collapsed') === '1');
} catch {
    setAdminSidebarCollapsed(false);
}

adminSidebarToggle?.addEventListener('click', () => {
    setAdminSidebarCollapsed(!adminShell.classList.contains('admin-sidebar-collapsed'));
});
