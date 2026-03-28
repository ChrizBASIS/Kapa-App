// KAPA-App Authorization — Role-based access control
const KAPAAuth = {
    STORAGE_KEY: 'kapa_current_role',
    
    ROLES: {
        ADMIN: 'admin',
        MANAGER: 'manager',
        VIEWER: 'viewer'
    },
    
    ROLE_LABELS: {
        'admin': 'Admin',
        'manager': 'Manager',
        'viewer': 'Viewer'
    },
    
    ROLE_DESCRIPTIONS: {
        'admin': 'Full access: edit data, manage settings, export',
        'manager': 'Edit comments, view settings, export',
        'viewer': 'Read-only access to all views'
    },
    
    getCurrentRole: function() {
        return localStorage.getItem(this.STORAGE_KEY) || null;
    },
    
    setRole: function(role) {
        localStorage.setItem(this.STORAGE_KEY, role);
    },
    
    canEditComments: function() {
        const role = this.getCurrentRole();
        return role === this.ROLES.ADMIN || role === this.ROLES.MANAGER;
    },
    
    canChangeSettings: function() {
        return this.getCurrentRole() === this.ROLES.ADMIN;
    },
    
    canManageSkills: function() {
        return this.getCurrentRole() === this.ROLES.ADMIN;
    },
    
    canExport: function() {
        const role = this.getCurrentRole();
        return role === this.ROLES.ADMIN || role === this.ROLES.MANAGER;
    },
    
    canManageAreas: function() {
        return this.getCurrentRole() === this.ROLES.ADMIN;
    },
    
    canSaveFilterVariants: function() {
        const role = this.getCurrentRole();
        return role === this.ROLES.ADMIN || role === this.ROLES.MANAGER;
    },
    
    showRoleSelectionDialog: function(onRoleSelected) {
        const roleSelect = new sap.m.Select({
            width: "100%",
            items: Object.keys(this.ROLES).map(key => {
                const roleValue = this.ROLES[key];
                return new sap.ui.core.Item({
                    key: roleValue,
                    text: this.ROLE_LABELS[roleValue] + ' — ' + this.ROLE_DESCRIPTIONS[roleValue]
                });
            })
        });
        
        // Pre-select current role if exists
        const currentRole = this.getCurrentRole();
        if (currentRole) {
            roleSelect.setSelectedKey(currentRole);
        }
        
        const dialog = new sap.m.Dialog({
            title: "KAPA-App — Select Role",
            contentWidth: "450px",
            type: "Message",
            content: [
                new sap.m.VBox({
                    items: [
                        new sap.m.Text({
                            text: "Please select your role to continue. Your permissions will be set accordingly."
                        }).addStyleClass("sapUiSmallMarginBottom"),
                        new sap.m.Label({ text: "Role", required: true }),
                        roleSelect
                    ]
                }).addStyleClass("sapUiContentPadding")
            ],
            beginButton: new sap.m.Button({
                text: "Continue",
                type: "Emphasized",
                press: function() {
                    const selectedRole = roleSelect.getSelectedKey();
                    KAPAAuth.setRole(selectedRole);
                    dialog.close();
                    if (onRoleSelected) {
                        onRoleSelected(selectedRole);
                    }
                }
            }),
            escapeHandler: function(promise) {
                // Prevent closing without selection
                promise.reject();
            },
            afterClose: function() {
                dialog.destroy();
            }
        });
        
        dialog.open();
    }
};
