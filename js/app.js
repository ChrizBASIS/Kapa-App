// KAPA-App Main Application
let currentWeekView = 9;
let kapaCallTable = null;
let teamViewerTable = null;
let startWeek = 10; // Default start week

// Helper function to calculate week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

sap.ui.getCore().attachInit(async function() {
    console.log('Initializing KAPA-App...');
    
    await KAPAStorage.init();
    await KAPAHolidayCalendar.init();
    
    // Show role selection first, then initialize app
    const existingRole = KAPAAuth.getCurrentRole();
    if (existingRole) {
        initApp();
    } else {
        KAPAAuth.showRoleSelectionDialog(function() {
            initApp();
        });
    }
});

function initApp() {
    const app = new sap.m.App({
        id: "kapaApp"
    });
    
    const page = createMainPage();
    app.addPage(page);
    app.placeAt("content");
    
    // Apply role-based UI restrictions
    applyRoleRestrictions();
    
    console.log('KAPA-App initialized successfully with role: ' + KAPAAuth.getCurrentRole());
}

function applyRoleRestrictions() {
    // Settings button — Admin only
    const settingsBtn = sap.ui.getCore().byId("settingsButton");
    if (settingsBtn) {
        settingsBtn.setVisible(KAPAAuth.canChangeSettings());
    }
    
    // Holiday Calendar button — Admin only
    const holidayBtn = sap.ui.getCore().byId("holidayCalendarBtn");
    if (holidayBtn) {
        holidayBtn.setVisible(KAPAAuth.canChangeSettings());
    }
    
    // Save filter variant button — Admin + Manager
    const saveFilterBtn = sap.ui.getCore().byId("saveFilterVariantBtn");
    if (saveFilterBtn) {
        saveFilterBtn.setVisible(KAPAAuth.canSaveFilterVariants());
    }
}

function createMainPage() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const employeeCount = employees.length;
    
    const iconTabBar = new sap.m.IconTabBar({
        id: "mainTabBar",
        expandable: false,
        stretchContentHeight: false,
        items: [
            new sap.m.IconTabFilter({
                key: "dashboard",
                text: "Dashboard",
                icon: "sap-icon://home",
                count: "",
                content: [createKPIDashboard()]
            }),
            new sap.m.IconTabFilter({
                key: "teamviewer",
                text: "Team Viewer",
                icon: "sap-icon://group",
                count: employeeCount.toString(),
                content: [createTeamViewer()]
            }),
            new sap.m.IconTabFilter({
                key: "kapacall",
                text: "KAPA-Call",
                icon: "sap-icon://table-view",
                count: employeeCount.toString(),
                content: [createKAPACallDetail()]
            })
        ]
    });
    
    const filterChipsContainer = new sap.m.HBox({
        id: "filterChipsContainer",
        wrap: "Wrap",
        alignItems: "Center",
        items: []
    }).addStyleClass("sapUiTinyMarginBegin");
    
    const page = new sap.m.Page({
        title: "KAPA-App",
        showHeader: true,
        showNavButton: false,
        enableScrolling: true,
        headerContent: [
            filterChipsContainer,
            new sap.m.ToolbarSpacer(),
            new sap.m.Button({
                icon: "sap-icon://filter",
                tooltip: "Filter",
                type: "Transparent",
                press: function() {
                    openFilterDialog();
                }
            }),
            new sap.m.Button({
                icon: "sap-icon://clear-filter",
                tooltip: "Reset Filters",
                type: "Transparent",
                press: function() {
                    clearAllFilters();
                }
            }),
            new sap.m.Button({
                id: "saveFilterVariantBtn",
                icon: "sap-icon://save",
                tooltip: "Save Filter Variant",
                type: "Transparent",
                press: function() {
                    const currentFilters = window.currentFilters || { areas: [], regions: [], teams: [], skills: [], employeeId: null };
                    KAPAFilterVariants.openSaveDialog(currentFilters);
                }
            }),
            new sap.m.Button({
                icon: "sap-icon://open-folder",
                tooltip: "Load Filter Variant",
                type: "Transparent",
                press: function() {
                    KAPAFilterVariants.openLoadDialog(function(filters) {
                        applyFilters(filters);
                    });
                }
            }),
            new sap.m.Button({
                icon: "sap-icon://refresh",
                tooltip: "Refresh",
                type: "Transparent",
                press: function() {
                    refreshAllData();
                }
            }),
            new sap.m.Button({
                id: "holidayCalendarBtn",
                icon: "sap-icon://appointment",
                tooltip: "Holiday Calendar",
                type: "Transparent",
                press: function() {
                    KAPAHolidayCalendar.openManageDialog();
                }
            }),
            new sap.m.Button({
                id: "settingsButton",
                icon: "sap-icon://action-settings",
                text: "Settings",
                tooltip: "Configure Traffic Light Thresholds",
                type: "Emphasized",
                press: function() {
                    openSettingsDialog();
                }
            }),
            new sap.m.Button({
                id: "switchRoleBtn",
                icon: "sap-icon://person-placeholder",
                text: KAPAAuth.getCurrentRole() ? KAPAAuth.ROLE_LABELS[KAPAAuth.getCurrentRole()] : "Role",
                tooltip: "Switch Role",
                type: "Transparent",
                press: function() {
                    KAPAAuth.showRoleSelectionDialog(function(role) {
                        sap.ui.getCore().byId("switchRoleBtn").setText(KAPAAuth.ROLE_LABELS[role]);
                        applyRoleRestrictions();
                        sap.m.MessageToast.show("Role switched to " + KAPAAuth.ROLE_LABELS[role]);
                    });
                }
            })
        ],
        content: [iconTabBar]
    });
    
    return page;
}

function createKPIDashboard() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    // Employee filter dropdown
    const employeeSelect = new sap.m.ComboBox({
        id: "dashboardEmployeeFilter",
        placeholder: "All Employees",
        width: "300px",
        items: [
            new sap.ui.core.Item({ key: "", text: "All Employees" })
        ].concat(
            employees.map(emp => 
                new sap.ui.core.Item({
                    key: emp.id,
                    text: `${emp.lastName}, ${emp.firstName} (${emp.employeeNumber})`
                })
            )
        ),
        selectionChange: function(oEvent) {
            const selectedKey = oEvent.getParameter("selectedItem").getKey();
            refreshDashboard(selectedKey);
        }
    });
    
    const utilSummary = KAPACalculations.getUtilizationSummary();
    
    const utilizationTiles = new sap.m.FlexBox({
        id: "dashboardUtilTiles",
        justifyContent: "Start",
        wrap: "Wrap",
        items: [
            createKPITile("Util 2M", utilSummary['2M'] + "%", "green"),
            createKPITile("Util YTD", utilSummary['YTD'] + "%", "green"),
            createKPITile("Util 12M", utilSummary['12M'] + "%", "green")
        ]
    });
    
    const kapaCallAggregation = new sap.m.FlexBox({
        id: "dashboardAggregation",
        justifyContent: "Start",
        wrap: "Wrap",
        items: [
            createKAPACallCard("by Area", KAPACalculations.aggregateByArea()),
            createKAPACallCard("by Region", KAPACalculations.aggregateByRegion()),
            createKAPACallCard("by Skills", KAPACalculations.aggregateBySkills())
        ]
    });
    
    return new sap.m.VBox({
        id: "dashboardContainer",
        items: [
            new sap.m.HBox({
                justifyContent: "SpaceBetween",
                alignItems: "Center",
                items: [
                    new sap.m.Label({ 
                        text: "UTILIZATION METRICS",
                        design: "Bold"
                    }).addStyleClass("sectionLabel"),
                    employeeSelect
                ]
            }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBegin sapUiSmallMarginEnd"),
            utilizationTiles,
            new sap.m.Label({ 
                text: "KAPA-CALL AGGREGATION",
                design: "Bold"
            }).addStyleClass("sectionLabel sapUiMediumMarginTop sapUiSmallMarginBegin"),
            kapaCallAggregation
        ]
    }).addStyleClass("sapUiSmallMarginTop");
}

function createKPITile(title, value, status) {
    const tile = new sap.m.GenericTile({
        header: title,
        press: function() {
            sap.m.MessageToast.show("Drill-Down to " + title);
        }
    });
    
    const content = new sap.m.TileContent({
        footer: status === "green" ? "On Target" : "Attention"
    });
    
    const numericContent = new sap.m.NumericContent({
        value: value,
        scale: "",
        valueColor: status === "green" ? "Good" : "Error",
        indicator: "None"
    });
    
    content.setContent(numericContent);
    tile.addTileContent(content);
    tile.addStyleClass("kpiTile");
    
    return tile;
}

function createKAPACallCard(title, data) {
    const list = new sap.m.List({
        items: data.map(item => 
            new sap.m.StandardListItem({
                title: item.name,
                description: `${item.count} Employees, ${item.freeDays.toFixed(1)} free days`,
                type: "Active",
                press: function() {
                    if (title.includes("Area")) {
                        refreshDashboardByFilter('area', item.name);
                    } else if (title.includes("Region")) {
                        refreshDashboardByFilter('region', item.name);
                    } else if (title.includes("Skills")) {
                        refreshDashboardByFilter('skill', item.name);
                    }
                }
            })
        )
    });
    
    const addButton = new sap.m.Button({
        icon: "sap-icon://add",
        type: "Transparent",
        tooltip: "Add",
        press: function() {
            if (title.includes("Area")) {
                openAddAreaDialog();
            } else if (title.includes("Region")) {
                openAddRegionDialog();
            } else if (title.includes("Skills")) {
                SkillManager.openAddSkillDialog();
            }
        }
    });
    
    const iconSrc = title.includes("Area") ? "sap-icon://org-chart" : 
                    title.includes("Region") ? "sap-icon://map" : "sap-icon://badge";

    const card = new sap.f.Card({
        width: "320px",
        header: new sap.f.cards.Header({
            title: title,
            iconSrc: iconSrc,
            subtitleMaxLines: 1
        }),
        headerToolbar: new sap.m.OverflowToolbar({
            content: [
                new sap.m.Title({ text: title }),
                new sap.m.ToolbarSpacer(),
                addButton
            ]
        }),
        content: list
    });
    
    card.addStyleClass("kpiCard");
    return card;
}

function createTeamViewer() {
    const weekToggle = new sap.m.SegmentedButton({
        selectedKey: "9",
        items: [
            new sap.m.SegmentedButtonItem({ key: "3", text: "3W" }),
            new sap.m.SegmentedButtonItem({ key: "6", text: "6W" }),
            new sap.m.SegmentedButtonItem({ key: "9", text: "9W" })
        ],
        selectionChange: function(oEvent) {
            currentWeekView = parseInt(oEvent.getParameter("item").getKey());
            refreshTeamViewerTable();
        }
    });
    
    const datePicker = new sap.m.DatePicker({
        id: "teamViewerDatePicker",
        placeholder: "Start date...",
        displayFormat: "dd.MM.yyyy",
        valueFormat: "yyyy-MM-dd",
        width: "140px",
        change: function(oEvent) {
            const selectedDate = oEvent.getParameter("value");
            if (selectedDate) {
                const date = new Date(selectedDate);
                const weekNumber = getWeekNumber(date);
                window.startWeek = weekNumber;
                refreshTeamViewerTable();
                sap.m.MessageToast.show(`View from week ${weekNumber}`);
            }
        }
    });
    
    teamViewerTable = new sap.ui.table.Table({
        id: "teamViewerTable",
        visibleRowCount: 15,
        selectionMode: "None",
        enableColumnReordering: false,
        columnHeaderHeight: 48,
        rowHeight: 72,
        toolbar: new sap.m.OverflowToolbar({
            content: [
                new sap.m.Title({ text: "Capacity Planning", level: "H4" }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Label({ text: "Traffic Light:" }),
                new sap.m.Select({
                    id: "teamViewerAmpelFilter",
                    selectedKey: "all",
                    items: [
                        new sap.ui.core.Item({ key: "all", text: "All" }),
                        new sap.ui.core.Item({ key: "red", text: "Red - Low" }),
                        new sap.ui.core.Item({ key: "yellow", text: "Yellow - Medium" }),
                        new sap.ui.core.Item({ key: "green", text: "Green - High" })
                    ],
                    change: function() {
                        refreshTeamViewerTable();
                    }
                }),
                new sap.m.ToolbarSeparator(),
                datePicker,
                new sap.m.ToolbarSeparator(),
                weekToggle,
                new sap.m.ToolbarSeparator(),
                new sap.m.Button({
                    text: "Kapa Vision",
                    icon: "sap-icon://action",
                    type: "Ghost",
                    press: function() {
                        openKapaVision('teamviewer');
                    }
                })
            ]
        })
    });
    
    teamViewerTable.setSelectionMode("MultiToggle");
    
    teamViewerTable.addColumn(new sap.ui.table.Column({
        label: new sap.m.Label({ text: "Employee", design: "Bold" }),
        template: createEmployeeCell(),
        width: "200px",
        frozen: true
    }));
    
    teamViewerTable.addColumn(new sap.ui.table.Column({
        label: new sap.m.Label({ text: "Country", design: "Bold" }),
        template: new sap.m.Text({ text: "{country}" }),
        width: "60px",
        sortProperty: "country",
        filterProperty: "country"
    }));
    
    teamViewerTable.addColumn(new sap.ui.table.Column({
        label: new sap.m.Label({ text: "Utilization", design: "Bold" }),
        template: new sap.m.ObjectStatus({
            text: "{utilizationDisplay}",
            icon: "{ampelIcon}",
            state: "{ampelState}",
            tooltip: "{utilizationTooltip}"
        }),
        width: "120px",
        sortProperty: "utilizationValue",
        filterProperty: "ampelStatus"
    }));
    
    teamViewerTable.addColumn(new sap.ui.table.Column({
        label: new sap.m.Label({ text: "Work Days", design: "Bold" }),
        template: new sap.m.Text({ text: "{workingDaysDisplay}" }),
        width: "90px"
    }));
    
    for (let i = 1; i <= 9; i++) {
        teamViewerTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ 
                text: `Week ${9 + i}`,
                design: "Bold"
            }),
            template: createWeekCell(i),
            width: "140px"
        }));
    }
    
    // Build dropdown filter bar for Team Viewer
    const tvFilterBar = createTeamViewerFilterBar();
    
    refreshTeamViewerTable();
    
    return new sap.m.VBox({
        items: [tvFilterBar, teamViewerTable]
    });
}

function createTeamViewerFilterBar() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const uniqueAreas = [...new Set(employees.map(e => e.area))].sort();
    const uniqueTeams = [...new Set(employees.map(e => e.team))].sort();
    const uniqueRegions = [...new Set(employees.map(e => e.region))].filter(Boolean).sort();
    const uniqueCountries = [...new Set(employees.map(e => e.country))].filter(Boolean).sort();
    const allSkillNames = [...new Set(employees.flatMap(e => e.skills || []))].sort();
    
    function makeMultiCombo(id, label, values) {
        return new sap.m.VBox({
            items: [
                new sap.m.Label({ text: label, design: "Bold" }),
                new sap.m.MultiComboBox({
                    id: id,
                    width: "100%",
                    placeholder: "All",
                    items: values.map(v => new sap.ui.core.Item({ key: v, text: v })),
                    selectionChange: function() { refreshTeamViewerTable(); }
                })
            ]
        }).addStyleClass("sapUiTinyMarginEnd");
    }
    
    return new sap.m.FlexBox({
        id: "teamViewerFilterBar",
        wrap: "Wrap",
        alignItems: "End",
        items: [
            makeMultiCombo("tvFilterArea", "Area", uniqueAreas),
            makeMultiCombo("tvFilterTeam", "Team", uniqueTeams),
            makeMultiCombo("tvFilterRegion", "Region", uniqueRegions),
            makeMultiCombo("tvFilterCountry", "Country", uniqueCountries),
            makeMultiCombo("tvFilterSkill", "Skill", allSkillNames),
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ text: " " }),
                    new sap.m.Button({
                        icon: "sap-icon://clear-filter",
                        text: "Reset",
                        type: "Transparent",
                        press: function() {
                            ["tvFilterArea","tvFilterTeam","tvFilterRegion","tvFilterCountry","tvFilterSkill"].forEach(function(filterId) {
                                var mcb = sap.ui.getCore().byId(filterId);
                                if (mcb) mcb.setSelectedKeys([]);
                            });
                            refreshTeamViewerTable();
                        }
                    })
                ]
            })
        ]
    }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd sapUiSmallMarginBottom sapUiTinyMarginTop");
}

function createEmployeeCell() {
    return new sap.m.VBox({
        items: [
            new sap.m.Text({ 
                text: "{lastName}, {firstName}",
                class: "employeeName"
            }),
            new sap.m.Text({ 
                text: "{team}",
                class: "employeeTeam"
            })
        ],
        class: "employeeInfo"
    });
}

function createWeekCell(weekIndex) {
    return new sap.m.VBox({
        items: {
            path: `week${weekIndex}`,
            template: new sap.m.Text({
                text: "{projectName}",
                class: "weekCellText"
            })
        },
        class: "weekCell"
    });
}

function refreshTeamViewerTable() {
    let employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    // Apply filters if set
    if (window.currentFilters) {
        const filters = window.currentFilters;
        
        // Employee-specific filter
        if (filters.employeeId) {
            employees = employees.filter(emp => emp.id === filters.employeeId);
        } else {
            // Regular filters
            if (filters.areas && filters.areas.length > 0) {
                employees = employees.filter(emp => filters.areas.includes(emp.area));
            }
            if (filters.regions && filters.regions.length > 0) {
                employees = employees.filter(emp => filters.regions.includes(emp.region));
            }
            if (filters.teams && filters.teams.length > 0) {
                employees = employees.filter(emp => filters.teams.includes(emp.team));
            }
            if (filters.skills && filters.skills.length > 0) {
                employees = employees.filter(emp => 
                    emp.skills && filters.skills.some(skill => emp.skills.includes(skill))
                );
            }
        }
    }
    
    // Apply dropdown filter bar filters for Team Viewer (multi-select)
    function getTvMultiKeys(id) {
        var mcb = sap.ui.getCore().byId(id);
        return mcb ? mcb.getSelectedKeys() : [];
    }
    var tvAreas = getTvMultiKeys("tvFilterArea");
    var tvTeams = getTvMultiKeys("tvFilterTeam");
    var tvRegions = getTvMultiKeys("tvFilterRegion");
    var tvCountries = getTvMultiKeys("tvFilterCountry");
    var tvSkills = getTvMultiKeys("tvFilterSkill");
    
    if (tvAreas.length > 0) employees = employees.filter(emp => tvAreas.includes(emp.area));
    if (tvTeams.length > 0) employees = employees.filter(emp => tvTeams.includes(emp.team));
    if (tvRegions.length > 0) employees = employees.filter(emp => tvRegions.includes(emp.region));
    if (tvCountries.length > 0) employees = employees.filter(emp => tvCountries.includes(emp.country));
    if (tvSkills.length > 0) employees = employees.filter(emp => emp.skills && tvSkills.some(s => emp.skills.includes(s)));
    
    // Compute ampel status for each employee
    let tableData = employees.map(emp => {
        const ampelResult = KAPACalculations.calculateAmpelStatus(emp.id, currentWeekView);
        const wdInfo = KAPACalculations.getEmployeeWorkingDays(emp.id, currentWeekView);
        
        const rowData = {
            id: emp.id,
            employeeNumber: emp.employeeNumber,
            firstName: emp.firstName,
            lastName: emp.lastName,
            team: emp.team,
            area: emp.area,
            region: emp.region,
            country: emp.country || '—',
            ampelStatus: ampelResult.status,
            utilizationValue: ampelResult.utilization,
            utilizationDisplay: `${ampelResult.utilization}%`,
            ampelIcon: KAPACalculations.getAmpelIcon(ampelResult.status),
            ampelState: KAPACalculations.getAmpelState(ampelResult.status),
            utilizationTooltip: `${wdInfo.workingDays} working days (${wdInfo.holidays} holidays subtracted from ${wdInfo.weekdays} weekdays)`,
            workingDaysDisplay: `${wdInfo.workingDays}d (${wdInfo.holidays}h)`
        };
        
        // Use startWeek if set, otherwise default
        const baseWeek = window.startWeek || 10;
        
        for (let i = 1; i <= 9; i++) {
            const week = baseWeek + i - 1;
            const weekData = KAPACalculations.getWeekData(emp.id, week);
            
            rowData[`week${i}`] = weekData.map(wd => ({
                projectName: `${wd.projectName} (${wd.days}d)`,
                buttonType: wd.status === 'Firm' ? 'Accept' : 
                           wd.status === 'Option' ? 'Emphasized' : 'Reject',
                days: wd.days,
                status: wd.status
            }));
        }
        
        return rowData;
    });
    
    // Apply traffic light filter
    const ampelFilter = sap.ui.getCore().byId("teamViewerAmpelFilter");
    if (ampelFilter) {
        const selectedAmpel = ampelFilter.getSelectedKey();
        if (selectedAmpel !== "all") {
            tableData = tableData.filter(row => row.ampelStatus === selectedAmpel);
        }
    }
    
    const model = new sap.ui.model.json.JSONModel(tableData);
    teamViewerTable.setModel(model);
    teamViewerTable.bindRows("/");
    
    // Update column headers with correct week numbers (offset +2 for Employee + Utilization columns)
    const baseWeek = window.startWeek || 10;
    for (let i = 0; i < 9; i++) {
        const col = teamViewerTable.getColumns()[i + 2];
        if (col) {
            col.setVisible(i < currentWeekView);
            const label = col.getLabel();
            if (label && label.setText) {
                label.setText(`Week ${baseWeek + i}`);
            }
        }
    }
    
    // Adjust visible row count based on filtered data
    const visibleRows = Math.min(Math.max(tableData.length, 5), 20);
    teamViewerTable.setVisibleRowCount(visibleRows);
}

function createKAPACallDetail() {
    const kapaWeekToggle = new sap.m.SegmentedButton({
        id: "kapaCallWeekToggle",
        selectedKey: "9",
        items: [
            new sap.m.SegmentedButtonItem({ key: "3", text: "3W" }),
            new sap.m.SegmentedButtonItem({ key: "6", text: "6W" }),
            new sap.m.SegmentedButtonItem({ key: "9", text: "9W" })
        ],
        selectionChange: function() {
            refreshKAPACallTable();
        }
    });
    
    kapaCallTable = new sap.ui.table.Table({
        id: "kapaCallTable",
        visibleRowCount: 20,
        selectionMode: "MultiToggle",
        enableCellFilter: false,
        enableColumnReordering: false,
        toolbar: new sap.m.OverflowToolbar({
            content: [
                new sap.m.Title({ text: "Free Capacity Overview", level: "H4" }),
                new sap.m.ToolbarSpacer(),
                new sap.m.Label({ text: "Traffic Light:" }),
                new sap.m.Select({
                    id: "kapaCallAmpelFilter",
                    selectedKey: "all",
                    items: [
                        new sap.ui.core.Item({ key: "all", text: "All" }),
                        new sap.ui.core.Item({ key: "red", text: "Red - Low" }),
                        new sap.ui.core.Item({ key: "yellow", text: "Yellow - Medium" }),
                        new sap.ui.core.Item({ key: "green", text: "Green - High" })
                    ],
                    change: function() {
                        refreshKAPACallTable();
                    }
                }),
                new sap.m.ToolbarSeparator(),
                kapaWeekToggle,
                new sap.m.ToolbarSeparator(),
                new sap.m.Button({
                    text: "Kapa Vision",
                    icon: "sap-icon://action",
                    type: "Ghost",
                    press: function() {
                        openKapaVision('kapacall');
                    }
                }),
                new sap.m.ToolbarSeparator(),
                new sap.m.Button({
                    text: "Save",
                    icon: "sap-icon://save",
                    type: "Emphasized",
                    press: function() {
                        saveKAPACallComments();
                    }
                }),
                new sap.m.Button({
                    text: "Export",
                    icon: "sap-icon://excel-attachment",
                    type: "Transparent",
                    press: function() {
                        sap.m.MessageToast.show("Export function (in development)");
                    }
                })
            ]
        })
    });
    
    const columns = [
        { label: "Area", property: "area", width: "100px" },
        { label: "Team", property: "team", width: "100px" },
        { label: "Employee", property: "employeeNumber", width: "90px" },
        { label: "Name", property: "fullName", width: "150px" },
        { label: "Country", property: "country", width: "60px" },
        { label: "Utilization", property: "utilizationDisplay", width: "120px", ampel: true },
        { label: "Work Days", property: "workingDaysDisplay", width: "90px" },
        { label: "Role", property: "role", width: "130px" },
        { label: "Skills", property: "skillsText", width: "150px", clickable: true },
        { label: "Location", property: "location", width: "90px" },
        { label: "Free Capa", property: "freeCapacity", width: "90px" },
        { label: "Comments", property: "comments", width: "250px", editable: true }
    ];
    
    columns.forEach(col => {
        let template;
        
        // Utilization with colored ObjectStatus
        if (col.ampel) {
            template = new sap.m.ObjectStatus({
                text: `{${col.property}}`,
                icon: "{ampelIcon}",
                state: "{ampelState}"
            });
        }
        // Clickable Skills column
        else if (col.clickable) {
            template = new sap.m.Link({
                text: `{${col.property}}`,
                press: function(oEvent) {
                    const context = oEvent.getSource().getBindingContext();
                    const employeeId = context.getProperty("id");
                    openEmployeeSkillDialog(employeeId);
                }
            });
        }
        // Editable fields for comments
        else if (col.editable) {
            template = new sap.m.Input({
                value: `{${col.property}}`,
                placeholder: "Enter comment..."
            });
        } else {
            template = new sap.m.Text({ text: `{${col.property}}` });
        }
        
        kapaCallTable.addColumn(new sap.ui.table.Column({
            label: new sap.m.Label({ text: col.label }),
            template: template,
            width: col.width,
            sortProperty: col.property
        }));
    });
    
    
    window.kapaCallTable = kapaCallTable;
    window.refreshKAPACallTable = refreshKAPACallTable;
    
    // Build dropdown filter bar
    const kapaFilterBar = createKAPACallFilterBar();
    
    refreshKAPACallTable();
    
    return new sap.m.VBox({
        items: [kapaFilterBar, kapaCallTable]
    });
}

function createKAPACallFilterBar() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const uniqueAreas = [...new Set(employees.map(e => e.area))].sort();
    const uniqueTeams = [...new Set(employees.map(e => e.team))].sort();
    const uniqueRoles = [...new Set(employees.map(e => e.role))].filter(Boolean).sort();
    const uniqueLocations = [...new Set(employees.map(e => e.location))].filter(Boolean).sort();
    const uniqueCountries = [...new Set(employees.map(e => e.country))].filter(Boolean).sort();
    const allSkillNames = [...new Set(employees.flatMap(e => e.skills || []))].sort();
    const employeeNames = employees
        .map(e => ({ key: e.id, text: `${e.lastName}, ${e.firstName}` }))
        .sort((a, b) => a.text.localeCompare(b.text));
    
    function makeMultiCombo(id, label, values) {
        return new sap.m.VBox({
            items: [
                new sap.m.Label({ text: label, design: "Bold" }),
                new sap.m.MultiComboBox({
                    id: id,
                    width: "100%",
                    placeholder: "All",
                    items: values.map(v => new sap.ui.core.Item({ key: v, text: v })),
                    selectionChange: function() { refreshKAPACallTable(); }
                })
            ]
        }).addStyleClass("sapUiTinyMarginEnd");
    }
    
    return new sap.m.FlexBox({
        id: "kapaCallFilterBar",
        wrap: "Wrap",
        alignItems: "End",
        items: [
            makeMultiCombo("kcFilterArea", "Area", uniqueAreas),
            makeMultiCombo("kcFilterTeam", "Team", uniqueTeams),
            makeMultiCombo("kcFilterRole", "Role", uniqueRoles),
            makeMultiCombo("kcFilterLocation", "Location", uniqueLocations),
            makeMultiCombo("kcFilterCountry", "Country", uniqueCountries),
            makeMultiCombo("kcFilterSkill", "Skill", allSkillNames),
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ text: "Name", design: "Bold" }),
                    new sap.m.MultiComboBox({
                        id: "kcFilterName",
                        width: "100%",
                        placeholder: "All",
                        items: employeeNames.map(e => new sap.ui.core.Item({ key: e.key, text: e.text })),
                        selectionChange: function() { refreshKAPACallTable(); }
                    })
                ]
            }).addStyleClass("sapUiTinyMarginEnd"),
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ text: " " }),
                    new sap.m.Button({
                        icon: "sap-icon://clear-filter",
                        text: "Reset",
                        type: "Transparent",
                        press: function() {
                            ["kcFilterArea","kcFilterTeam","kcFilterRole","kcFilterLocation","kcFilterCountry","kcFilterSkill","kcFilterName"].forEach(function(filterId) {
                                var mcb = sap.ui.getCore().byId(filterId);
                                if (mcb) mcb.setSelectedKeys([]);
                            });
                            refreshKAPACallTable();
                        }
                    })
                ]
            })
        ]
    }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd sapUiSmallMarginBottom sapUiTinyMarginTop");
}

function refreshKAPACallTable() {
    let employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    // Apply filters if set
    if (window.currentFilters) {
        const filters = window.currentFilters;
        
        // Employee-specific filter
        if (filters.employeeId) {
            employees = employees.filter(emp => emp.id === filters.employeeId);
        } else {
            // Regular filters
            if (filters.areas && filters.areas.length > 0) {
                employees = employees.filter(emp => filters.areas.includes(emp.area));
            }
            if (filters.regions && filters.regions.length > 0) {
                employees = employees.filter(emp => filters.regions.includes(emp.region));
            }
            if (filters.teams && filters.teams.length > 0) {
                employees = employees.filter(emp => filters.teams.includes(emp.team));
            }
            if (filters.skills && filters.skills.length > 0) {
                employees = employees.filter(emp => 
                    emp.skills && filters.skills.some(skill => emp.skills.includes(skill))
                );
            }
        }
    }
    
    // Apply dropdown filter bar filters (multi-select)
    function getKcMultiKeys(id) {
        var mcb = sap.ui.getCore().byId(id);
        return mcb ? mcb.getSelectedKeys() : [];
    }
    var kcAreas = getKcMultiKeys("kcFilterArea");
    var kcTeams = getKcMultiKeys("kcFilterTeam");
    var kcRoles = getKcMultiKeys("kcFilterRole");
    var kcLocations = getKcMultiKeys("kcFilterLocation");
    var kcCountries = getKcMultiKeys("kcFilterCountry");
    var kcSkills = getKcMultiKeys("kcFilterSkill");
    var kcNames = getKcMultiKeys("kcFilterName");
    
    if (kcAreas.length > 0) employees = employees.filter(emp => kcAreas.includes(emp.area));
    if (kcTeams.length > 0) employees = employees.filter(emp => kcTeams.includes(emp.team));
    if (kcRoles.length > 0) employees = employees.filter(emp => kcRoles.includes(emp.role));
    if (kcLocations.length > 0) employees = employees.filter(emp => kcLocations.includes(emp.location));
    if (kcCountries.length > 0) employees = employees.filter(emp => kcCountries.includes(emp.country));
    if (kcSkills.length > 0) employees = employees.filter(emp => emp.skills && kcSkills.some(s => emp.skills.includes(s)));
    if (kcNames.length > 0) employees = employees.filter(emp => kcNames.includes(emp.id));
    
    // Get selected week period for utilization calculation
    const kapaWeekToggle = sap.ui.getCore().byId("kapaCallWeekToggle");
    const kapaWeeks = kapaWeekToggle ? parseInt(kapaWeekToggle.getSelectedKey()) : 9;
    
    let tableData = employees.map(emp => {
        const freeCapacity = KAPACalculations.getFreeCapacityForWeeks(emp.id, kapaWeeks);
        const skills = emp.skills || [];
        const skillsText = skills.length > 0 ? `${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''}` : "No Skills";
        const ampelResult = KAPACalculations.calculateAmpelStatus(emp.id, kapaWeeks);
        const wdInfo = KAPACalculations.getEmployeeWorkingDays(emp.id, kapaWeeks);
        
        return {
            id: emp.id,
            employeeNumber: emp.employeeNumber,
            firstName: emp.firstName,
            lastName: emp.lastName,
            fullName: `${emp.lastName}, ${emp.firstName}`,
            area: emp.area,
            team: emp.team,
            region: emp.region,
            country: emp.country || '—',
            workingDaysDisplay: `${wdInfo.workingDays}d (${wdInfo.holidays}h)`,
            location: emp.location,
            role: emp.role,
            skills: skills,
            skillsText: skillsText,
            freeCapacity: freeCapacity > 0 ? `${freeCapacity} Days` : "Fully Allocated",
            ampelStatus: ampelResult.status,
            utilizationValue: ampelResult.utilization,
            utilizationDisplay: `${ampelResult.utilization}%`,
            ampelIcon: KAPACalculations.getAmpelIcon(ampelResult.status),
            ampelState: KAPACalculations.getAmpelState(ampelResult.status),
            comments: emp.comments || ""
        };
    });
    
    // Apply traffic light filter
    const ampelFilter = sap.ui.getCore().byId("kapaCallAmpelFilter");
    if (ampelFilter) {
        const selectedAmpel = ampelFilter.getSelectedKey();
        if (selectedAmpel !== "all") {
            tableData = tableData.filter(row => row.ampelStatus === selectedAmpel);
        }
    }
    
    const model = new sap.ui.model.json.JSONModel(tableData);
    kapaCallTable.setModel(model);
    kapaCallTable.bindRows("/");
    
    // Adjust visible row count based on filtered data (min 5, max 25)
    const visibleRows = Math.min(Math.max(tableData.length, 5), 25);
    kapaCallTable.setVisibleRowCount(visibleRows);
    
    // Update toolbar title with count
    const toolbar = kapaCallTable.getToolbar();
    if (toolbar) {
        const title = toolbar.getContent()[0];
        if (title && title.setText) {
            title.setText(`Free Capacity Overview (${tableData.length} Employees)`);
        }
    }
}


function saveKAPACallComments() {
    const table = kapaCallTable;
    if (!table) {
        sap.m.MessageBox.error("Table not found");
        return;
    }
    
    const model = table.getModel();
    if (!model) {
        sap.m.MessageBox.error("No data available to save");
        return;
    }
    
    const tableData = model.getData();
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    let savedCount = 0;
    
    tableData.forEach(row => {
        const empIndex = employees.findIndex(e => e.id === row.id);
        if (empIndex !== -1) {
            employees[empIndex].comments = row.comments || "";
            savedCount++;
        }
    });
    
    KAPAStorage.set(KAPAStorage.KEYS.EMPLOYEES, employees);
    
    sap.m.MessageBox.success(
        `Comments for ${savedCount} employees successfully saved.`,
        {
            title: "Save Successful"
        }
    );
}

function openSettingsDialog() {
    const settings = KAPAStorage.get(KAPAStorage.KEYS.SETTINGS) || {};
    const defaultThresholds = { red: 30, yellow: 51 };
    const thresholds = settings.thresholds || {
        '3W': { ...defaultThresholds },
        '6W': { ...defaultThresholds },
        '9W': { ...defaultThresholds }
    };
    
    const sliders = {};
    const periods = ['3W', '6W', '9W'];
    const periodLabels = { '3W': '3 Weeks', '6W': '6 Weeks', '9W': '9 Weeks' };
    
    const periodItems = periods.map(period => {
        const t = thresholds[period] || defaultThresholds;
        
        sliders[period] = {
            red: new sap.m.Slider({
                value: t.red,
                min: 0,
                max: 100,
                step: 1,
                enableTickmarks: true,
                inputsAsTooltips: true,
                width: "100%"
            }),
            yellow: new sap.m.Slider({
                value: t.yellow,
                min: 0,
                max: 100,
                step: 1,
                enableTickmarks: true,
                inputsAsTooltips: true,
                width: "100%"
            })
        };
        
        return new sap.m.Panel({
            headerText: periodLabels[period],
            expandable: true,
            expanded: period === '9W',
            content: [
                new sap.m.VBox({
                    items: [
                        new sap.m.Label({ text: "Red Threshold (\u2264 X% = Low)" }),
                        sliders[period].red,
                        new sap.m.Label({ text: "Yellow Threshold (\u2264 X% = Medium)" }).addStyleClass("sapUiSmallMarginTop"),
                        sliders[period].yellow
                    ]
                }).addStyleClass("sapUiSmallMargin")
            ]
        });
    });
    
    const dialog = new sap.m.Dialog({
        title: "Settings — Traffic Light Thresholds",
        contentWidth: "550px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.MessageStrip({
                        text: "Configure utilization thresholds per planning period. Red = Low utilization, Yellow = Medium, Green = High (above yellow threshold).",
                        type: "Information",
                        showIcon: true
                    }),
                    ...periodItems
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        beginButton: new sap.m.Button({
            text: "Save",
            type: "Emphasized",
            press: function() {
                const newThresholds = {};
                periods.forEach(period => {
                    newThresholds[period] = {
                        red: sliders[period].red.getValue(),
                        yellow: sliders[period].yellow.getValue()
                    };
                });
                
                KAPAStorage.set(KAPAStorage.KEYS.SETTINGS, { thresholds: newThresholds });
                sap.m.MessageToast.show("Settings saved");
                refreshTeamViewerTable();
                refreshKAPACallTable();
                dialog.close();
            }
        }),
        endButton: new sap.m.Button({
            text: "Cancel",
            press: function() {
                dialog.close();
            }
        }),
        afterClose: function() {
            dialog.destroy();
        }
    });
    
    dialog.open();
}

function openFilterDialog() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const uniqueAreas = [...new Set(employees.map(e => e.area))];
    const uniqueRegions = [...new Set(employees.map(e => e.region))];
    const uniqueTeams = [...new Set(employees.map(e => e.team))];
    
    const dialog = new sap.m.Dialog({
        title: "Filter",
        contentWidth: "400px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ text: "Area" }),
                    new sap.m.MultiComboBox({
                        id: "filterArea",
                        items: uniqueAreas.map(area => new sap.ui.core.Item({ key: area, text: area }))
                    }),
                    new sap.m.Label({ text: "Region" }).addStyleClass("sapUiSmallMarginTop"),
                    new sap.m.MultiComboBox({
                        id: "filterRegion",
                        items: uniqueRegions.map(region => new sap.ui.core.Item({ key: region, text: region }))
                    }),
                    new sap.m.Label({ text: "Team" }).addStyleClass("sapUiSmallMarginTop"),
                    new sap.m.MultiComboBox({
                        id: "filterTeam",
                        items: uniqueTeams.map(team => new sap.ui.core.Item({ key: team, text: team }))
                    })
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        beginButton: new sap.m.Button({
            text: "Apply",
            type: "Emphasized",
            press: function() {
                const selectedAreas = sap.ui.getCore().byId("filterArea").getSelectedKeys();
                const selectedRegions = sap.ui.getCore().byId("filterRegion").getSelectedKeys();
                const selectedTeams = sap.ui.getCore().byId("filterTeam").getSelectedKeys();
                
                applyFilters({
                    areas: selectedAreas,
                    regions: selectedRegions,
                    teams: selectedTeams
                });
                
                sap.m.MessageToast.show("Filter applied");
                dialog.close();
            }
        }),
        endButton: new sap.m.Button({
            text: "Reset",
            press: function() {
                sap.ui.getCore().byId("filterArea").setSelectedKeys([]);
                sap.ui.getCore().byId("filterRegion").setSelectedKeys([]);
                sap.ui.getCore().byId("filterTeam").setSelectedKeys([]);
                
                applyFilters({ areas: [], regions: [], teams: [] });
                sap.m.MessageToast.show("Filter reset");
            }
        }),
        afterClose: function() {
            dialog.destroy();
        }
    });
    
    dialog.open();
}

function applyFilters(filters) {
    window.currentFilters = filters || { areas: [], regions: [], teams: [], employeeId: null };
    
    // Reset page title when clearing or changing filters
    if (!filters.employeeId) {
        window.currentEmployeeFilter = null;
        const page = sap.ui.getCore().byId("kapaApp").getCurrentPage();
        if (page) {
            page.setTitle("KAPA-App");
        }
    }
    
    refreshTeamViewerTable();
    refreshKAPACallTable();
    
    // Update filter chips
    if (typeof updateFilterChips === 'function') {
        updateFilterChips();
    }
}

function openKapaVision(source) {
    const table = source === 'teamviewer' ? teamViewerTable : kapaCallTable;
    if (!table) {
        sap.m.MessageToast.show("No table available");
        return;
    }
    
    const selectedIndices = table.getSelectedIndices();
    if (selectedIndices.length === 0) {
        sap.m.MessageBox.warning("Please select at least one employee to open in Kapa Vision.");
        return;
    }
    
    const model = table.getModel();
    const data = model.getData();
    const employeeIds = selectedIndices.map(idx => data[idx].id).filter(Boolean);
    const weeks = source === 'kapacall' 
        ? (sap.ui.getCore().byId("kapaCallWeekToggle")?.getSelectedKey() || '9')
        : currentWeekView;
    
    const url = `https://kapa-vision.example.com?employees=${employeeIds.join(',')}&weeks=${weeks}`;
    
    sap.m.MessageBox.information(
        `Opening Kapa Vision for ${employeeIds.length} employee(s).\n\nURL: ${url}`,
        {
            title: "Kapa Vision",
            actions: ["Open", sap.m.MessageBox.Action.CANCEL],
            onClose: function(action) {
                if (action === "Open") {
                    window.open(url, '_blank');
                }
            }
        }
    );
}

function refreshAllData() {
    refreshTeamViewerTable();
    refreshKAPACallTable();
    sap.m.MessageToast.show("Data updated");
}

function openEmployeeUtilizationDialog() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    // Employee list with utilization data
    const employeeData = employees.map(emp => {
        const util2M = KAPACalculations.getHistoricalUtilization(emp.id, '2M') || 0;
        const utilYTD = KAPACalculations.getHistoricalUtilization(emp.id, 'YTD') || 0;
        const util12M = KAPACalculations.getHistoricalUtilization(emp.id, '12M') || 0;
        
        return {
            id: emp.id,
            employeeNumber: emp.employeeNumber,
            fullName: `${emp.lastName}, ${emp.firstName}`,
            team: emp.team,
            area: emp.area,
            region: emp.region,
            location: emp.location,
            role: emp.role,
            workingHours: emp.workingHours,
            skills: emp.skills || [],
            util2M: util2M,
            utilYTD: utilYTD,
            util12M: util12M,
            searchText: `${emp.firstName} ${emp.lastName} ${emp.employeeNumber} ${emp.team}`.toLowerCase()
        };
    });
    
    const employeeList = new sap.m.List({
        mode: "SingleSelectMaster"
    });
    
    // Search field
    const searchField = new sap.m.SearchField({
        placeholder: "Search employees (Name, Number, Team)...",
        width: "100%",
        search: function(oEvent) {
            const query = oEvent.getParameter("query").toLowerCase();
            const binding = employeeList.getBinding("items");
            
            if (query) {
                binding.filter([
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("searchText", sap.ui.model.FilterOperator.Contains, query)
                        ],
                        and: false
                    })
                ]);
            } else {
                binding.filter([]);
            }
        }
    });
    
    const model = new sap.ui.model.json.JSONModel(employeeData);
    employeeList.setModel(model);
    employeeList.bindItems({
        path: "/",
        template: new sap.m.StandardListItem({
            title: "{fullName}",
            description: "{employeeNumber} | {team} | {area}",
            info: "Util YTD: {utilYTD}%",
            type: "Active",
            press: function(oEvent) {
                const context = oEvent.getSource().getBindingContext();
                const empData = context.getObject();
                
                // Apply filter to employee
                dialog.close();
                applyEmployeeFilter(empData);
                sap.m.MessageToast.show(`Filter applied: ${empData.fullName}`);
            }
        })
    });
    
    const dialog = new sap.m.Dialog({
        title: "Utilization by Teammember",
        contentWidth: "600px",
        contentHeight: "600px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.MessageStrip({
                        text: "Click on an employee to filter the view. Right-click for details.",
                        type: "Information",
                        showIcon: true
                    }),
                    new sap.m.Label({ 
                        text: `${employees.length} Employees`,
                        design: "Bold"
                    }).addStyleClass("sapUiSmallMarginTop"),
                    searchField,
                    employeeList
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
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
}

function applyEmployeeFilter(empData) {
    // Store current employee filter
    window.currentEmployeeFilter = empData;
    
    // Update dashboard to show employee-specific data
    updateDashboardForEmployee(empData);
    
    // Apply filter to tables
    applyFilters({ 
        areas: [], 
        regions: [], 
        teams: [],
        employeeId: empData.id
    });
}

function updateDashboardForEmployee(empData) {
    // Update page title to show filtered employee
    const page = sap.ui.getCore().byId("kapaApp").getCurrentPage();
    if (page) {
        page.setTitle(`KAPA-App — ${empData.fullName}`);
    }
    
    // Show employee details
    sap.m.MessageBox.information(
        `Active filter: ${empData.fullName}\n\n` +
        `${empData.employeeNumber} · ${empData.team} · ${empData.area}\n` +
        `${empData.location} · ${empData.role}\n\n` +
        `Utilization:  2M ${empData.util2M.toFixed(1)}%  |  YTD ${empData.utilYTD.toFixed(1)}%  |  12M ${empData.util12M.toFixed(1)}%`,
        {
            title: "Employee Filter",
            actions: [sap.m.MessageBox.Action.OK]
        }
    );
}

function showEmployeeUtilizationDetail(empData) {
    const skills = empData.skills || [];
    const skillsText = skills.length > 0 ? skills.join(', ') : 'No Skills';
    
    const detailDialog = new sap.m.Dialog({
        title: `Utilization Detail - ${empData.fullName}`,
        contentWidth: "700px",
        contentHeight: "600px",
        content: [
            new sap.m.VBox({
                items: [
                    // Employee Info Section
                    new sap.m.Title({ 
                        text: "Employee Information",
                        level: "H3"
                    }),
                    new sap.m.VBox({
                        items: [
                            new sap.m.Label({ text: "Employee Number:" }),
                            new sap.m.Text({ text: empData.employeeNumber }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Name:" }),
                            new sap.m.Text({ text: empData.fullName }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Team:" }),
                            new sap.m.Text({ text: empData.team }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Area:" }),
                            new sap.m.Text({ text: empData.area }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Location:" }),
                            new sap.m.Text({ text: `${empData.location} (${empData.region})` }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Role:" }),
                            new sap.m.Text({ text: empData.role }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Working Hours:" }),
                            new sap.m.Text({ text: `${empData.workingHours} Hours/Week` }).addStyleClass("sapUiTinyMarginBottom"),
                            
                            new sap.m.Label({ text: "Skills:" }),
                            new sap.m.Text({ text: skillsText }).addStyleClass("sapUiTinyMarginBottom")
                        ]
                    }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom"),
                    
                    // Utilization Section
                    new sap.m.Title({ 
                        text: "Utilization Metrics (Historical)",
                        level: "H3"
                    }).addStyleClass("sapUiMediumMarginTop"),
                    
                    new sap.m.FlexBox({
                        justifyContent: "SpaceAround",
                        wrap: "Wrap",
                        items: [
                            new sap.m.GenericTile({
                                header: "Utilization 2M",
                                subheader: "Last 2 Months",
                                tileContent: [
                                    new sap.m.TileContent({
                                        content: new sap.m.NumericContent({
                                            value: empData.util2M.toFixed(1),
                                            scale: "%",
                                            valueColor: empData.util2M >= 80 ? "Good" : empData.util2M >= 60 ? "Critical" : "Error"
                                        })
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMargin"),
                            
                            new sap.m.GenericTile({
                                header: "Utilization YTD",
                                subheader: "Year-to-Date",
                                tileContent: [
                                    new sap.m.TileContent({
                                        content: new sap.m.NumericContent({
                                            value: empData.utilYTD.toFixed(1),
                                            scale: "%",
                                            valueColor: empData.utilYTD >= 80 ? "Good" : empData.utilYTD >= 60 ? "Critical" : "Error"
                                        })
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMargin"),
                            
                            new sap.m.GenericTile({
                                header: "Utilization 12M",
                                subheader: "Last 12 Months",
                                tileContent: [
                                    new sap.m.TileContent({
                                        content: new sap.m.NumericContent({
                                            value: empData.util12M.toFixed(1),
                                            scale: "%",
                                            valueColor: empData.util12M >= 80 ? "Good" : empData.util12M >= 60 ? "Critical" : "Error"
                                        })
                                    })
                                ]
                            }).addStyleClass("sapUiTinyMargin")
                        ]
                    }).addStyleClass("sapUiSmallMarginTop"),
                    
                    new sap.m.MessageStrip({
                        text: "Note: Utilization data is sourced from the HR system (utilization.json) and shows historical utilization.",
                        type: "Information",
                        showIcon: true
                    }).addStyleClass("sapUiMediumMarginTop")
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        endButton: new sap.m.Button({
            text: "Close",
            press: function() {
                detailDialog.close();
            }
        }),
        afterClose: function() {
            detailDialog.destroy();
        }
    });
    
    detailDialog.open();
}

function openAddAreaDialog() {
    openManageAreasDialog();
}

function openAddRegionDialog() {
    openManageRegionsDialog();
}

function openEmployeeSkillDialog(employeeId) {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) {
        sap.m.MessageToast.show("Employee not found");
        return;
    }
    
    const allSkills = KAPAStorage.get(KAPAStorage.KEYS.SKILLS) || [];
    const employeeSkills = employee.skills || [];
    
    // MultiComboBox for skill selection from existing skills
    const skillMultiCombo = new sap.m.MultiComboBox({
        width: "100%",
        placeholder: "Select skills...",
        selectedKeys: employeeSkills,
        items: allSkills.map(skill => 
            new sap.ui.core.Item({
                key: skill.name,
                text: skill.name
            })
        )
    });
    
    const dialog = new sap.m.Dialog({
        title: `Manage Skills — ${employee.firstName} ${employee.lastName}`,
        contentWidth: "500px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ 
                        text: `Employee: ${employee.employeeNumber} — ${employee.firstName} ${employee.lastName}`,
                        design: "Bold"
                    }),
                    new sap.m.Label({ 
                        text: `Team: ${employee.team} | Area: ${employee.area}`
                    }).addStyleClass("sapUiTinyMarginBottom"),
                    new sap.m.Label({ 
                        text: "Assign Skills (multi-select)",
                        design: "Bold"
                    }).addStyleClass("sapUiMediumMarginTop"),
                    skillMultiCombo,
                    new sap.m.MessageStrip({
                        text: "Select multiple skills from the predefined list. Deselect to remove.",
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
                const selectedSkills = skillMultiCombo.getSelectedKeys();
                employee.skills = selectedSkills;
                
                const allEmployees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
                const empIndex = allEmployees.findIndex(e => e.id === employeeId);
                if (empIndex !== -1) {
                    allEmployees[empIndex] = employee;
                    KAPAStorage.set(KAPAStorage.KEYS.EMPLOYEES, allEmployees);
                }
                
                refreshKAPACallTable();
                sap.m.MessageToast.show(`Skills updated for ${employee.firstName} ${employee.lastName}`);
                dialog.close();
            }
        }),
        endButton: new sap.m.Button({
            text: "Cancel",
            press: function() {
                dialog.close();
            }
        }),
        afterClose: function() {
            dialog.destroy();
        }
    });
    
    dialog.open();
}

function openManageAreasDialog() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const uniqueAreas = [...new Set(employees.map(e => e.area))].sort();
    
    const table = new sap.m.Table({
        columns: [
            new sap.m.Column({ header: new sap.m.Label({ text: "Area" }) }),
            new sap.m.Column({ header: new sap.m.Label({ text: "Employees" }), width: "120px" }),
            new sap.m.Column({ header: new sap.m.Label({ text: "Actions" }), width: "100px" })
        ]
    });
    
    uniqueAreas.forEach(area => {
        const count = employees.filter(e => e.area === area).length;
        
        table.addItem(new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({ text: area }),
                new sap.m.Text({ text: count + " Emp" }),
                new sap.m.Button({
                    icon: "sap-icon://delete",
                    type: "Transparent",
                    enabled: count === 0,
                    tooltip: count > 0 ? "Cannot delete (employees assigned)" : "Delete",
                    press: function() {
                        sap.m.MessageBox.confirm(
                            `Do you really want to delete area "${area}"?`,
                            {
                                onClose: function(action) {
                                    if (action === sap.m.MessageBox.Action.OK) {
                                        sap.m.MessageToast.show(`Area "${area}" deleted`);
                                        openManageAreasDialog();
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
        title: "Manage Areas",
        contentWidth: "600px",
        contentHeight: "400px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Text({ 
                        text: `${uniqueAreas.length} Areas configured`,
                        class: "sapUiSmallMarginBottom"
                    }),
                    table
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        beginButton: new sap.m.Button({
            text: "Add New Area",
            icon: "sap-icon://add",
            press: function() {
                dialog.close();
                openAddNewAreaDialog();
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
}

function openAddNewAreaDialog() {
    const nameInput = new sap.m.Input({
        id: "newAreaNameInput",
        placeholder: "e.g. APRA, AS, BC, CX, ES",
        liveChange: function(oEvent) {
            const value = oEvent.getParameter("value");
            const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
            const uniqueAreas = [...new Set(employees.map(e => e.area))];
            const exists = uniqueAreas.find(a => a.toLowerCase() === value.toLowerCase());
            
            if (exists) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("This area already exists");
            } else {
                oEvent.getSource().setValueState("None");
            }
        }
    });
    
    const dialog = new sap.m.Dialog({
        title: "Add New Area",
        contentWidth: "400px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ 
                        text: "Area Name", 
                        required: true,
                        labelFor: "newAreaNameInput"
                    }),
                    nameInput,
                    new sap.m.MessageStrip({
                        text: "Note: Areas are modules/departments (e.g. APRA, AS, BC, CX, ES), not countries.",
                        type: "Information",
                        showIcon: true
                    }).addStyleClass("sapUiSmallMarginTop")
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        beginButton: new sap.m.Button({
            text: "Add",
            type: "Emphasized",
            press: function() {
                const name = sap.ui.getCore().byId("newAreaNameInput").getValue().trim();
                
                if (!name) {
                    sap.m.MessageBox.error("Please enter an area name.");
                    return;
                }
                
                sap.m.MessageToast.show(`Area "${name}" added`);
                dialog.close();
                openManageAreasDialog();
            }
        }),
        endButton: new sap.m.Button({
            text: "Cancel",
            press: function() {
                dialog.close();
                openManageAreasDialog();
            }
        }),
        afterClose: function() {
            dialog.destroy();
        }
    });
    
    dialog.open();
}

function openManageRegionsDialog() {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    const uniqueRegions = [...new Set(employees.map(e => e.region))].sort();
    
    const table = new sap.m.Table({
        columns: [
            new sap.m.Column({ header: new sap.m.Label({ text: "Region" }) }),
            new sap.m.Column({ header: new sap.m.Label({ text: "Employees" }), width: "120px" }),
            new sap.m.Column({ header: new sap.m.Label({ text: "Actions" }), width: "100px" })
        ]
    });
    
    uniqueRegions.forEach(region => {
        const count = employees.filter(e => e.region === region).length;
        
        table.addItem(new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({ text: region }),
                new sap.m.Text({ text: count + " Emp" }),
                new sap.m.Button({
                    icon: "sap-icon://delete",
                    type: "Transparent",
                    enabled: count === 0,
                    tooltip: count > 0 ? "Cannot delete (employees assigned)" : "Delete",
                    press: function() {
                        sap.m.MessageBox.confirm(
                            `Do you really want to delete region "${region}"?`,
                            {
                                onClose: function(action) {
                                    if (action === sap.m.MessageBox.Action.OK) {
                                        sap.m.MessageToast.show(`Region "${region}" deleted`);
                                        openManageRegionsDialog();
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
        title: "Manage Regions",
        contentWidth: "600px",
        contentHeight: "400px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Text({ 
                        text: `${uniqueRegions.length} Regions configured`,
                        class: "sapUiSmallMarginBottom"
                    }),
                    table
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        beginButton: new sap.m.Button({
            text: "Add New Region",
            icon: "sap-icon://add",
            press: function() {
                dialog.close();
                openAddNewRegionDialog();
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
}

function openAddNewRegionDialog() {
    const nameInput = new sap.m.Input({
        id: "newRegionNameInput",
        placeholder: "e.g. Munich, Hamburg, Zurich, Vienna",
        liveChange: function(oEvent) {
            const value = oEvent.getParameter("value");
            const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
            const uniqueRegions = [...new Set(employees.map(e => e.region))];
            const exists = uniqueRegions.find(r => r.toLowerCase() === value.toLowerCase());
            
            if (exists) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("This region already exists");
            } else {
                oEvent.getSource().setValueState("None");
            }
        }
    });
    
    const dialog = new sap.m.Dialog({
        title: "Add New Region",
        contentWidth: "400px",
        content: [
            new sap.m.VBox({
                items: [
                    new sap.m.Label({ 
                        text: "Region Name", 
                        required: true,
                        labelFor: "newRegionNameInput"
                    }),
                    nameInput,
                    new sap.m.MessageStrip({
                        text: "Note: Regions are locations/countries (e.g. Munich, Hamburg, Zurich, Vienna).",
                        type: "Information",
                        showIcon: true
                    }).addStyleClass("sapUiSmallMarginTop")
                ]
            }).addStyleClass("sapUiContentPadding")
        ],
        beginButton: new sap.m.Button({
            text: "Add",
            type: "Emphasized",
            press: function() {
                const name = sap.ui.getCore().byId("newRegionNameInput").getValue().trim();
                
                if (!name) {
                    sap.m.MessageBox.error("Please enter a region name.");
                    return;
                }
                
                sap.m.MessageToast.show(`Region "${name}" added`);
                dialog.close();
                openManageRegionsDialog();
            }
        }),
        endButton: new sap.m.Button({
            text: "Cancel",
            press: function() {
                dialog.close();
                openManageRegionsDialog();
            }
        }),
        afterClose: function() {
            dialog.destroy();
        }
    });
    
    dialog.open();
}
