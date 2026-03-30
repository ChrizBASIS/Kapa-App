// KAPA-App Filter Variants — Save/Load filter combinations
const KAPAFilterVariants = {
    STORAGE_KEY: 'kapa_filter_variants',
    
    getAll: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading filter variants:', e);
            return [];
        }
    },
    
    save: function(name, filters) {
        const variants = this.getAll();
        const existing = variants.findIndex(v => v.name === name);
        
        const variant = {
            name: name,
            filters: JSON.parse(JSON.stringify(filters)),
            createdAt: new Date().toISOString()
        };
        
        if (existing !== -1) {
            variants[existing] = variant;
        } else {
            variants.push(variant);
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(variants));
        return variant;
    },
    
    load: function(name) {
        const variants = this.getAll();
        const variant = variants.find(v => v.name === name);
        return variant ? variant.filters : null;
    },
    
    delete: function(name) {
        const variants = this.getAll();
        const filtered = variants.filter(v => v.name !== name);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    },
    
    openSaveDialog: function(currentFilters) {
        const nameInput = new sap.m.Input({
            placeholder: "Enter variant name...",
            width: "100%"
        });
        
        const dialog = new sap.m.Dialog({
            title: "Save Filter Variant",
            contentWidth: "400px",
            content: [
                new sap.m.VBox({
                    items: [
                        new sap.m.Label({ text: "Variant Name", required: true }),
                        nameInput,
                        new sap.m.MessageStrip({
                            text: "Save the current filter combination for quick access later.",
                            type: "Information",
                            showIcon: true
                        }).addStyleClass("sapUiSmallMarginTop")
                    ]
                }).addStyleClass("sapUiContentPadding")
            ],
            beginButton: new sap.m.Button({
                text: "Save",
                type: "Emphasized",
                press: function() {
                    const name = nameInput.getValue().trim();
                    if (!name) {
                        sap.m.MessageToast.show("Please enter a name");
                        return;
                    }
                    KAPAFilterVariants.save(name, currentFilters);
                    sap.m.MessageToast.show(`Filter variant "${name}" saved`);
                    dialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "Cancel",
                press: function() { dialog.close(); }
            }),
            afterClose: function() { dialog.destroy(); }
        });
        
        dialog.open();
    },
    
    openLoadDialog: function(onApply) {
        const variants = this.getAll();
        
        if (variants.length === 0) {
            sap.m.MessageBox.information("No saved filter variants found.");
            return;
        }
        
        const list = new sap.m.List({
            mode: "SingleSelectMaster",
            items: variants.map(v => {
                const filterSummary = [];
                if (v.filters.areas && v.filters.areas.length > 0) filterSummary.push("Areas: " + v.filters.areas.join(", "));
                if (v.filters.regions && v.filters.regions.length > 0) filterSummary.push("Regions: " + v.filters.regions.join(", "));
                if (v.filters.teams && v.filters.teams.length > 0) filterSummary.push("Teams: " + v.filters.teams.join(", "));
                if (v.filters.skills && v.filters.skills.length > 0) filterSummary.push("Skills: " + v.filters.skills.join(", "));
                
                return new sap.m.StandardListItem({
                    title: v.name,
                    description: filterSummary.join(" | ") || "No filters",
                    info: new Date(v.createdAt).toLocaleDateString('en-US'),
                    type: "Active"
                });
            })
        });
        
        const dialog = new sap.m.Dialog({
            title: "Load Filter Variant",
            contentWidth: "550px",
            contentHeight: "400px",
            content: [list],
            beginButton: new sap.m.Button({
                text: "Apply",
                type: "Emphasized",
                press: function() {
                    const selectedItem = list.getSelectedItem();
                    if (!selectedItem) {
                        sap.m.MessageToast.show("Please select a variant");
                        return;
                    }
                    const variantName = selectedItem.getTitle();
                    const filters = KAPAFilterVariants.load(variantName);
                    if (filters && onApply) {
                        onApply(filters);
                        sap.m.MessageToast.show(`Filter variant "${variantName}" applied`);
                    }
                    dialog.close();
                }
            }),
            endButton: new sap.m.Button({
                text: "Close",
                press: function() { dialog.close(); }
            }),
            customHeader: new sap.m.Bar({
                contentLeft: [new sap.m.Title({ text: "Load Filter Variant" })],
                contentRight: [
                    new sap.m.Button({
                        icon: "sap-icon://delete",
                        tooltip: "Delete selected variant",
                        type: "Transparent",
                        press: function() {
                            const selectedItem = list.getSelectedItem();
                            if (!selectedItem) {
                                sap.m.MessageToast.show("Please select a variant to delete");
                                return;
                            }
                            const variantName = selectedItem.getTitle();
                            KAPAFilterVariants.delete(variantName);
                            sap.m.MessageToast.show(`Variant "${variantName}" deleted`);
                            dialog.close();
                            KAPAFilterVariants.openLoadDialog(onApply);
                        }
                    })
                ]
            }),
            afterClose: function() { dialog.destroy(); }
        });
        
        dialog.open();
    }
};
