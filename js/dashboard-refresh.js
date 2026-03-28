// Dashboard Refresh Functions

function updateFilterChips() {
    const container = sap.ui.getCore().byId("filterChipsContainer");
    if (!container) return;
    
    container.removeAllItems();
    
    const filters = window.currentFilters || {};
    
    // Employee filter chip
    if (filters.employeeId) {
        const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
        const emp = employees.find(e => e.id === filters.employeeId);
        if (emp) {
            container.addItem(new sap.m.Token({
                text: `Employee: ${emp.lastName}, ${emp.firstName}`,
                delete: function() {
                    clearAllFilters();
                }
            }));
        }
    }
    
    // Area filter chips
    if (filters.areas && filters.areas.length > 0) {
        filters.areas.forEach(area => {
            container.addItem(new sap.m.Token({
                text: `Area: ${area}`,
                delete: function() {
                    removeFilter('area', area);
                }
            }));
        });
    }
    
    // Region filter chips
    if (filters.regions && filters.regions.length > 0) {
        filters.regions.forEach(region => {
            container.addItem(new sap.m.Token({
                text: `Region: ${region}`,
                delete: function() {
                    removeFilter('region', region);
                }
            }));
        });
    }
    
    // Team filter chips
    if (filters.teams && filters.teams.length > 0) {
        filters.teams.forEach(team => {
            container.addItem(new sap.m.Token({
                text: `Team: ${team}`,
                delete: function() {
                    removeFilter('team', team);
                }
            }));
        });
    }
    
    // Skill filter chips
    if (filters.skills && filters.skills.length > 0) {
        filters.skills.forEach(skill => {
            container.addItem(new sap.m.Token({
                text: `Skill: ${skill}`,
                delete: function() {
                    removeFilter('skill', skill);
                }
            }));
        });
    }
}

function removeFilter(filterType, filterValue) {
    const filters = window.currentFilters || { areas: [], regions: [], teams: [], skills: [], employeeId: null };
    
    if (filterType === 'area') {
        filters.areas = filters.areas.filter(a => a !== filterValue);
    } else if (filterType === 'region') {
        filters.regions = filters.regions.filter(r => r !== filterValue);
    } else if (filterType === 'team') {
        filters.teams = filters.teams.filter(t => t !== filterValue);
    } else if (filterType === 'skill') {
        filters.skills = filters.skills.filter(s => s !== filterValue);
    }
    
    applyFilters(filters);
    updateFilterChips();
    
    // Reset dashboard if no filters remain
    if (filters.areas.length === 0 && filters.regions.length === 0 && filters.teams.length === 0 && (!filters.skills || filters.skills.length === 0) && !filters.employeeId) {
        const employeeFilter = sap.ui.getCore().byId("dashboardEmployeeFilter");
        if (employeeFilter) {
            employeeFilter.setSelectedKey("");
            employeeFilter.setPlaceholder("All Employees");
        }
        refreshDashboard("");
    }
}

function clearAllFilters() {
    applyFilters({ areas: [], regions: [], teams: [], skills: [], employeeId: null });
    window.currentEmployeeFilter = null;
    
    // Reset dashboard employee filter
    const employeeFilter = sap.ui.getCore().byId("dashboardEmployeeFilter");
    if (employeeFilter) {
        employeeFilter.setSelectedKey("");
        employeeFilter.setPlaceholder("All Employees");
    }
    
    // Reset Team Viewer dropdown filters (MultiComboBox)
    ["tvFilterArea","tvFilterTeam","tvFilterRegion","tvFilterCountry","tvFilterSkill"].forEach(function(id) {
        var mcb = sap.ui.getCore().byId(id);
        if (mcb) mcb.setSelectedKeys([]);
    });
    
    // Reset KAPA-Call dropdown filters (MultiComboBox)
    ["kcFilterArea","kcFilterTeam","kcFilterRole","kcFilterLocation","kcFilterCountry","kcFilterSkill","kcFilterName"].forEach(function(id) {
        var mcb = sap.ui.getCore().byId(id);
        if (mcb) mcb.setSelectedKeys([]);
    });
    
    // Reset traffic light filters
    var tvAmpel = sap.ui.getCore().byId("teamViewerAmpelFilter");
    if (tvAmpel) tvAmpel.setSelectedKey("all");
    var kcAmpel = sap.ui.getCore().byId("kapaCallAmpelFilter");
    if (kcAmpel) kcAmpel.setSelectedKey("all");
    
    // Navigate back to Dashboard
    var tabBar = sap.ui.getCore().byId("mainTabBar");
    if (tabBar) tabBar.setSelectedKey("dashboard");
    
    refreshDashboard("");
    updateFilterChips();
    sap.m.MessageToast.show("Filters reset");
}

function refreshDashboard(employeeId) {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    let filteredEmployees = employees;
    let utilSummary;
    
    if (employeeId) {
        // Filter for specific employee
        filteredEmployees = employees.filter(emp => emp.id === employeeId);
        
        if (filteredEmployees.length > 0) {
            const emp = filteredEmployees[0];
            utilSummary = {
                '2M': KAPACalculations.getHistoricalUtilization(emp.id, '2M') || 0,
                'YTD': KAPACalculations.getHistoricalUtilization(emp.id, 'YTD') || 0,
                '12M': KAPACalculations.getHistoricalUtilization(emp.id, '12M') || 0
            };
        }
        
        // Apply filter to tables
        applyFilters({ 
            areas: [], 
            regions: [], 
            teams: [],
            employeeId: employeeId
        });
    } else {
        // Show all employees
        utilSummary = KAPACalculations.getUtilizationSummary();
        
        // Clear filters
        applyFilters({ areas: [], regions: [], teams: [], employeeId: null });
    }
    
    // Update utilization tiles
    var fmtUtil = function(v) { return (typeof v === 'number' ? v.toFixed(1) : String(v)) + "%"; };
    const tilesContainer = sap.ui.getCore().byId("dashboardUtilTiles");
    if (tilesContainer) {
        tilesContainer.removeAllItems();
        tilesContainer.addItem(createKPITile("Util 2M", fmtUtil(utilSummary['2M']), "green"));
        tilesContainer.addItem(createKPITile("Util YTD", fmtUtil(utilSummary['YTD']), "green"));
        tilesContainer.addItem(createKPITile("Util 12M", fmtUtil(utilSummary['12M']), "green"));
    }
    
    // Update aggregation cards
    const aggContainer = sap.ui.getCore().byId("dashboardAggregation");
    if (aggContainer) {
        aggContainer.removeAllItems();
        
        if (employeeId) {
            // Show employee-specific aggregation
            const emp = filteredEmployees[0];
            aggContainer.addItem(createEmployeeDetailCard(emp));
        } else {
            // Show standard aggregation
            aggContainer.addItem(createKAPACallCard("by Area", KAPACalculations.aggregateByArea()));
            aggContainer.addItem(createKAPACallCard("by Region", KAPACalculations.aggregateByRegion()));
            aggContainer.addItem(createKAPACallCard("by Skills", KAPACalculations.aggregateBySkills()));
        }
    }
    
    // Update filter chips
    updateFilterChips();
}

function createEmployeeDetailCard(emp) {
    const skills = emp.skills || [];
    const freeCapacity = KAPACalculations.getFreeCapacity(emp.id);
    
    const list = new sap.m.List({
        items: [
            new sap.m.StandardListItem({
                title: "Team",
                description: emp.team,
                icon: "sap-icon://group"
            }),
            new sap.m.StandardListItem({
                title: "Area",
                description: emp.area,
                icon: "sap-icon://org-chart"
            }),
            new sap.m.StandardListItem({
                title: "Region",
                description: emp.region,
                icon: "sap-icon://map"
            }),
            new sap.m.StandardListItem({
                title: "Skills",
                description: skills.length > 0 ? skills.join(', ') : 'No Skills',
                icon: "sap-icon://badge"
            }),
            new sap.m.StandardListItem({
                title: "Free Capacity",
                description: freeCapacity > 0 ? `${freeCapacity} Days` : "Fully Allocated",
                icon: "sap-icon://calendar"
            })
        ]
    });
    
    const card = new sap.f.Card({
        width: "320px",
        header: new sap.f.cards.Header({
            title: "Employee Details",
            subtitle: `${emp.lastName}, ${emp.firstName}`,
            iconSrc: "sap-icon://employee"
        }),
        content: list
    });
    
    card.addStyleClass("kpiCard");
    return card;
}

function refreshDashboardByFilter(filterType, filterValue) {
    const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
    
    // Get current filters or initialize
    const currentFilters = window.currentFilters || { areas: [], regions: [], teams: [], skills: [], employeeId: null };
    
    // Add new filter to existing filters (combine instead of replace)
    if (filterType === 'area') {
        if (!currentFilters.areas.includes(filterValue)) {
            currentFilters.areas.push(filterValue);
        }
    } else if (filterType === 'region') {
        if (!currentFilters.regions.includes(filterValue)) {
            currentFilters.regions.push(filterValue);
        }
    } else if (filterType === 'skill') {
        if (!currentFilters.skills) {
            currentFilters.skills = [];
        }
        if (!currentFilters.skills.includes(filterValue)) {
            currentFilters.skills.push(filterValue);
        }
    }
    
    // Apply combined filters
    applyFilters(currentFilters);
    
    // Filter employees based on ALL active filters
    let filteredEmployees = employees;
    
    if (currentFilters.areas.length > 0) {
        filteredEmployees = filteredEmployees.filter(emp => currentFilters.areas.includes(emp.area));
    }
    if (currentFilters.regions.length > 0) {
        filteredEmployees = filteredEmployees.filter(emp => currentFilters.regions.includes(emp.region));
    }
    if (currentFilters.teams && currentFilters.teams.length > 0) {
        filteredEmployees = filteredEmployees.filter(emp => currentFilters.teams.includes(emp.team));
    }
    if (currentFilters.skills && currentFilters.skills.length > 0) {
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.skills && currentFilters.skills.some(skill => emp.skills.includes(skill))
        );
    }
    
    // Calculate average utilization for filtered employees
    let util2M = 0, utilYTD = 0, util12M = 0;
    
    if (filteredEmployees.length > 0) {
        filteredEmployees.forEach(emp => {
            util2M += KAPACalculations.getHistoricalUtilization(emp.id, '2M') || 0;
            utilYTD += KAPACalculations.getHistoricalUtilization(emp.id, 'YTD') || 0;
            util12M += KAPACalculations.getHistoricalUtilization(emp.id, '12M') || 0;
        });
        
        util2M = util2M / filteredEmployees.length;
        utilYTD = utilYTD / filteredEmployees.length;
        util12M = util12M / filteredEmployees.length;
    }
    
    const utilSummary = {
        '2M': util2M,
        'YTD': utilYTD,
        '12M': util12M
    };
    
    // Update utilization tiles
    var fmtU = function(v) { return (typeof v === 'number' ? v.toFixed(1) : String(v)) + "%"; };
    const tilesContainer = sap.ui.getCore().byId("dashboardUtilTiles");
    if (tilesContainer) {
        tilesContainer.removeAllItems();
        tilesContainer.addItem(createKPITile("Util 2M", fmtU(utilSummary['2M']), "green"));
        tilesContainer.addItem(createKPITile("Util YTD", fmtU(utilSummary['YTD']), "green"));
        tilesContainer.addItem(createKPITile("Util 12M", fmtU(utilSummary['12M']), "green"));
    }
    
    // Update employee filter dropdown to show filter is active
    const employeeFilter = sap.ui.getCore().byId("dashboardEmployeeFilter");
    if (employeeFilter) {
        employeeFilter.setSelectedKey("");
        employeeFilter.setPlaceholder(`Filtered: ${filterValue} (${filteredEmployees.length} Emp)`);
    }
    
    // Update filter chips
    updateFilterChips();
    
    sap.m.MessageToast.show(`Filter: ${filterValue} (${filteredEmployees.length} Employees)`);
}
