// KAPA-App Skill Management
const SkillManager = {
    
    categoryLabels: {
        'SAP_Modules': 'SAP Modules',
        'Technologies': 'Technologies',
        'Solutions': 'Solutions',
        'Cloud': 'Cloud',
        'Soft_Skills': 'Soft Skills',
        'Languages': 'Programming Languages',
        'Sonstige': 'Other'
    },
    
    createSkillMultiComboBox: function(selectedSkills = [], onChange = null) {
        const skills = KAPAStorage.getSkills();
        
        const comboBox = new sap.m.MultiComboBox({
            width: "100%",
            placeholder: "Select skills...",
            selectedKeys: selectedSkills,
            selectionChange: function(oEvent) {
                if (onChange) {
                    const selected = oEvent.getSource().getSelectedKeys();
                    onChange(selected);
                }
            }
        });
        
        const groupedSkills = this.groupSkillsByCategory(skills);
        
        Object.keys(groupedSkills).forEach(category => {
            groupedSkills[category].forEach(skill => {
                comboBox.addItem(new sap.ui.core.Item({
                    key: skill.name,
                    text: skill.name,
                    customData: [
                        new sap.ui.core.CustomData({
                            key: "category",
                            value: skill.category
                        }),
                        new sap.ui.core.CustomData({
                            key: "isCustom",
                            value: skill.isCustom
                        })
                    ]
                }));
            });
        });
        
        return comboBox;
    },
    
    createSkillComboBoxWithAdd: function(selectedSkills = [], onChange = null) {
        const comboBox = this.createSkillMultiComboBox(selectedSkills, onChange);
        
        const addButton = new sap.m.Button({
            icon: "sap-icon://add",
            type: "Transparent",
            tooltip: "Add new skill",
            press: function() {
                SkillManager.openAddSkillDialog();
            }
        });
        
        const container = new sap.m.HBox({
            alignItems: "Center",
            items: [comboBox, addButton]
        });
        
        container.addStyleClass("skillComboBoxContainer");
        
        return container;
    },
    
    openAddSkillDialog: function() {
        if (this._addSkillDialog) {
            this._addSkillDialog.open();
            return;
        }
        
        const nameInput = new sap.m.Input({
            id: "skillNameInput",
            placeholder: "e.g. SAP IBP, Kubernetes, etc.",
            liveChange: function(oEvent) {
                const value = oEvent.getParameter("value");
                const skills = KAPAStorage.getSkills();
                const exists = skills.find(s => s.name.toLowerCase() === value.toLowerCase());
                
                if (exists) {
                    oEvent.getSource().setValueState("Error");
                    oEvent.getSource().setValueStateText("This skill already exists");
                } else {
                    oEvent.getSource().setValueState("None");
                }
            }
        });
        
        const categorySelect = new sap.m.Select({
            id: "skillCategorySelect",
            items: Object.keys(this.categoryLabels).map(key => 
                new sap.ui.core.Item({
                    key: key,
                    text: this.categoryLabels[key]
                })
            )
        });
        
        this._addSkillDialog = new sap.m.Dialog({
            title: "Add New Skill",
            contentWidth: "400px",
            content: [
                new sap.m.VBox({
                    items: [
                        new sap.m.Label({ 
                            text: "Skill Name", 
                            required: true,
                            labelFor: "skillNameInput"
                        }),
                        nameInput,
                        new sap.m.Label({ 
                            text: "Category", 
                            required: true,
                            labelFor: "skillCategorySelect",
                            class: "sapUiTinyMarginTop"
                        }),
                        categorySelect
                    ]
                }).addStyleClass("sapUiContentPadding")
            ],
            beginButton: new sap.m.Button({
                text: "Add",
                type: "Emphasized",
                press: function() {
                    const name = sap.ui.getCore().byId("skillNameInput").getValue().trim();
                    const category = sap.ui.getCore().byId("skillCategorySelect").getSelectedKey();
                    
                    if (!name) {
                        sap.m.MessageBox.error("Please enter a skill name.");
                        return;
                    }
                    
                    if (!category) {
                        sap.m.MessageBox.error("Please select a category.");
                        return;
                    }
                    
                    const result = KAPAStorage.addSkill(name, category);
                    
                    if (result.success) {
                        sap.m.MessageToast.show(`Skill "${name}" added successfully`);
                        SkillManager.refreshAllSkillComboBoxes();
                        SkillManager._addSkillDialog.close();
                        
                        sap.ui.getCore().byId("skillNameInput").setValue("");
                        sap.ui.getCore().byId("skillCategorySelect").setSelectedKey("");
                    } else {
                        sap.m.MessageBox.error(result.message);
                    }
                }
            }),
            endButton: new sap.m.Button({
                text: "Cancel",
                press: function() {
                    SkillManager._addSkillDialog.close();
                }
            }),
            afterClose: function() {
                sap.ui.getCore().byId("skillNameInput").setValue("");
                sap.ui.getCore().byId("skillNameInput").setValueState("None");
                sap.ui.getCore().byId("skillCategorySelect").setSelectedKey("");
            }
        });
        
        this._addSkillDialog.open();
    },
    
    openManageSkillsDialog: function() {
        const skills = KAPAStorage.getSkills();
        const customSkills = skills.filter(s => s.isCustom);
        
        const table = new sap.m.Table({
            columns: [
                new sap.m.Column({ header: new sap.m.Label({ text: "Skill Name" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Category" }) }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Created" }), width: "150px" }),
                new sap.m.Column({ header: new sap.m.Label({ text: "Actions" }), width: "100px" })
            ]
        });
        
        customSkills.forEach(skill => {
            const date = new Date(skill.createdAt);
            const formattedDate = date.toLocaleDateString('en-US');
            
            table.addItem(new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({ text: skill.name }),
                    new sap.m.Text({ text: this.categoryLabels[skill.category] || skill.category }),
                    new sap.m.Text({ text: formattedDate }),
                    new sap.m.Button({
                        icon: "sap-icon://delete",
                        type: "Transparent",
                        press: function() {
                            sap.m.MessageBox.confirm(
                                `Do you really want to delete skill "${skill.name}"?`,
                                {
                                    onClose: function(action) {
                                        if (action === sap.m.MessageBox.Action.OK) {
                                            const result = KAPAStorage.deleteSkill(skill.id);
                                            if (result.success) {
                                                sap.m.MessageToast.show(`Skill "${skill.name}" deleted`);
                                                SkillManager.openManageSkillsDialog();
                                                SkillManager.refreshAllSkillComboBoxes();
                                            } else {
                                                sap.m.MessageBox.error(result.message);
                                            }
                                        }
                                    }
                                }
                            );
                        }
                    })
                ]
            }));
        });
        
        const dialog = new sap.m.Dialog({
            title: "Manage Skills",
            contentWidth: "600px",
            contentHeight: "400px",
            content: [
                new sap.m.VBox({
                    items: [
                        new sap.m.Text({ 
                            text: `${customSkills.length} custom skills`,
                            class: "sapUiSmallMarginBottom"
                        }),
                        table
                    ]
                }).addStyleClass("sapUiContentPadding")
            ],
            beginButton: new sap.m.Button({
                text: "Add New Skill",
                icon: "sap-icon://add",
                press: function() {
                    dialog.close();
                    SkillManager.openAddSkillDialog();
                }
            }),
            endButton: new sap.m.Button({
                text: "Close",
                press: function() {
                    dialog.close();
                }
            }),
            afterClose: function() {
                dialog.destroy();
            }
        });
        
        dialog.open();
    },
    
    refreshAllSkillComboBoxes: function() {
        console.log('Refreshing all skill combo boxes...');
        
        if (window.kapaCallTable) {
            window.refreshKAPACallTable();
        }
    },
    
    groupSkillsByCategory: function(skills) {
        const grouped = {};
        
        skills.forEach(skill => {
            if (!grouped[skill.category]) {
                grouped[skill.category] = [];
            }
            grouped[skill.category].push(skill);
        });
        
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => a.name.localeCompare(b.name));
        });
        
        return grouped;
    },
    
    getSkillsByCategory: function(category) {
        return KAPAStorage.getSkills(category);
    },
    
    getAllCategories: function() {
        return Object.keys(this.categoryLabels);
    },
    
    getCategoryLabel: function(categoryKey) {
        return this.categoryLabels[categoryKey] || categoryKey;
    },
    
    createSkillBadges: function(skills) {
        const container = new sap.m.FlexBox({
            wrap: "Wrap",
            alignItems: "Start"
        });
        
        if (!skills || skills.length === 0) {
            container.addItem(new sap.m.Text({ 
                text: "No Skills",
                class: "textMuted"
            }));
            return container;
        }
        
        const allSkills = KAPAStorage.getSkills();
        
        skills.forEach(skillName => {
            const skill = allSkills.find(s => s.name === skillName);
            const isCustom = skill ? skill.isCustom : false;
            
            const badge = new sap.m.Text({
                text: skillName
            });
            badge.addStyleClass("skillBadge");
            if (isCustom) {
                badge.addStyleClass("custom");
            }
            
            container.addItem(badge);
        });
        
        return container;
    }
};
