// KAPA-App Calculations and Business Logic
const KAPACalculations = {
    
    getThresholds: function(weeks) {
        const settings = KAPAStorage.get(KAPAStorage.KEYS.SETTINGS) || {};
        const defaultThresholds = { red: 30, yellow: 51 };
        
        // Migrate old format if needed
        if (settings.thresholdGreen !== undefined && !settings.thresholds) {
            return defaultThresholds;
        }
        
        const key = weeks + 'W';
        if (settings.thresholds && settings.thresholds[key]) {
            return settings.thresholds[key];
        }
        return defaultThresholds;
    },
    
    calculateAmpelStatus: function(employeeId, planningWeeks = 9) {
        const utilization = this.getPlannedUtilization(employeeId, planningWeeks);
        
        if (utilization === null || utilization === undefined) {
            return { status: 'grey', text: 'No Data', utilization: 0 };
        }
        
        const thresholds = this.getThresholds(planningWeeks);
        
        let status, text;
        if (utilization <= thresholds.red) {
            status = 'red';
            text = 'Low';
        } else if (utilization <= thresholds.yellow) {
            status = 'yellow';
            text = 'Medium';
        } else {
            status = 'green';
            text = 'High';
        }
        
        return {
            status: status,
            text: text,
            utilization: Math.round(utilization * 10) / 10
        };
    },
    
    getPlannedUtilization: function(employeeId, weeks = 9) {
        const capacityPlan = KAPAStorage.get(KAPAStorage.KEYS.CAPACITY_PLAN) || [];
        const startWeek = window.startWeek || 10;
        const employeePlan = capacityPlan.filter(cp => 
            cp.employeeId === employeeId && 
            cp.week >= startWeek && 
            cp.week < (startWeek + weeks)
        );
        
        if (employeePlan.length === 0) {
            return 0;
        }
        
        const totalBookedDays = employeePlan.reduce((sum, cp) => sum + cp.days, 0);
        
        // Use country-specific working days if available
        const emp = KAPAStorage.getEmployeeById(employeeId);
        const country = emp ? emp.country : null;
        let availableDays = weeks * 5;
        
        if (country && typeof KAPAHolidayCalendar !== 'undefined') {
            availableDays = KAPAHolidayCalendar.getWorkingDaysInWeekRange(
                country, startWeek, weeks, new Date().getFullYear()
            );
        }
        
        if (availableDays <= 0) availableDays = 1;
        
        return (totalBookedDays / availableDays) * 100;
    },
    
    getEmployeeWorkingDays: function(employeeId, weeks) {
        const startWeek = window.startWeek || 10;
        const emp = KAPAStorage.getEmployeeById(employeeId);
        const country = emp ? emp.country : null;
        var total = weeks * 5;
        var holidays = 0;
        
        if (country && typeof KAPAHolidayCalendar !== 'undefined') {
            holidays = KAPAHolidayCalendar.getHolidaysInWeekRange(
                country, startWeek, weeks, new Date().getFullYear()
            );
            total = total - holidays;
        }
        
        return { workingDays: Math.max(total, 0), holidays: holidays, weekdays: weeks * 5 };
    },
    
    getHistoricalUtilization: function(employeeId, period = 'YTD') {
        const utilization = KAPAStorage.get(KAPAStorage.KEYS.UTILIZATION) || [];
        const empUtil = utilization.find(u => u.employeeId === employeeId);
        
        if (!empUtil) return null;
        
        return empUtil[period] || null;
    },
    
    getFreeCapacity: function(employeeId, month) {
        const currentDate = new Date();
        const targetMonth = month || (currentDate.getMonth() + 1);
        const targetYear = currentDate.getFullYear();
        
        const emp = KAPAStorage.getEmployeeById(employeeId);
        const country = emp ? emp.country : null;
        const availableDays = this.getAvailableDaysInMonth(targetYear, targetMonth, country);
        const bookedDays = this.getBookedDaysInMonth(employeeId, targetYear, targetMonth);
        
        return Math.max(0, availableDays - bookedDays);
    },
    
    getFreeCapacityForWeeks: function(employeeId, weeks) {
        const startWeek = window.startWeek || 10;
        const capacityPlan = KAPAStorage.get(KAPAStorage.KEYS.CAPACITY_PLAN) || [];
        
        const employeePlan = capacityPlan.filter(cp => 
            cp.employeeId === employeeId && 
            cp.week >= startWeek && 
            cp.week < (startWeek + weeks)
        );
        
        const totalBookedDays = employeePlan.reduce((sum, cp) => sum + cp.days, 0);
        
        const emp = KAPAStorage.getEmployeeById(employeeId);
        const country = emp ? emp.country : null;
        let availableDays = weeks * 5;
        
        if (country && typeof KAPAHolidayCalendar !== 'undefined') {
            availableDays = KAPAHolidayCalendar.getWorkingDaysInWeekRange(
                country, startWeek, weeks, new Date().getFullYear()
            );
        }
        
        return Math.max(0, Math.round((availableDays - totalBookedDays) * 10) / 10);
    },
    
    getAvailableDaysInMonth: function(year, month, countryCode) {
        if (countryCode && typeof KAPAHolidayCalendar !== 'undefined') {
            return KAPAHolidayCalendar.getWorkingDaysInMonth(countryCode, year, month);
        }
        
        const daysInMonth = new Date(year, month, 0).getDate();
        let workingDays = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
        }
        
        return workingDays;
    },
    
    getBookedDaysInMonth: function(employeeId, year, month) {
        const capacityPlan = KAPAStorage.get(KAPAStorage.KEYS.CAPACITY_PLAN) || [];
        
        const weeksInMonth = this.getWeeksInMonth(year, month);
        
        const employeePlan = capacityPlan.filter(cp => 
            cp.employeeId === employeeId && 
            weeksInMonth.includes(cp.week)
        );
        
        return employeePlan.reduce((sum, cp) => sum + cp.days, 0);
    },
    
    getWeeksInMonth: function(year, month) {
        const weeks = [];
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        
        for (let week = 10; week <= 18; week++) {
            weeks.push(week);
        }
        
        return weeks;
    },
    
    aggregateByArea: function(weeks) {
        const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
        const aggregation = {};
        
        employees.forEach(emp => {
            const freeCapacity = weeks ? this.getFreeCapacityForWeeks(emp.id, weeks) : this.getFreeCapacity(emp.id);
            
            if (!aggregation[emp.area]) {
                aggregation[emp.area] = {
                    name: emp.area,
                    count: 0,
                    freeDays: 0,
                    employees: []
                };
            }
            
            if (freeCapacity > 0) {
                aggregation[emp.area].count++;
                aggregation[emp.area].freeDays += freeCapacity;
                aggregation[emp.area].employees.push({
                    name: `${emp.firstName} ${emp.lastName}`,
                    freeDays: freeCapacity
                });
            }
        });
        
        return Object.values(aggregation).sort((a, b) => b.freeDays - a.freeDays);
    },
    
    aggregateByRegion: function(weeks) {
        const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
        const aggregation = {};
        
        employees.forEach(emp => {
            const freeCapacity = weeks ? this.getFreeCapacityForWeeks(emp.id, weeks) : this.getFreeCapacity(emp.id);
            
            if (!aggregation[emp.region]) {
                aggregation[emp.region] = {
                    name: emp.region,
                    count: 0,
                    freeDays: 0,
                    employees: []
                };
            }
            
            if (freeCapacity > 0) {
                aggregation[emp.region].count++;
                aggregation[emp.region].freeDays += freeCapacity;
                aggregation[emp.region].employees.push({
                    name: `${emp.firstName} ${emp.lastName}`,
                    freeDays: freeCapacity
                });
            }
        });
        
        return Object.values(aggregation).sort((a, b) => b.freeDays - a.freeDays);
    },
    
    aggregateBySkills: function(weeks) {
        const employees = KAPAStorage.get(KAPAStorage.KEYS.EMPLOYEES) || [];
        const aggregation = {};
        
        employees.forEach(emp => {
            const freeCapacity = weeks ? this.getFreeCapacityForWeeks(emp.id, weeks) : this.getFreeCapacity(emp.id);
            
            if (freeCapacity > 0 && emp.skills && emp.skills.length > 0) {
                emp.skills.forEach(skill => {
                    if (!aggregation[skill]) {
                        aggregation[skill] = {
                            name: skill,
                            count: 0,
                            freeDays: 0,
                            employees: []
                        };
                    }
                    
                    aggregation[skill].count++;
                    aggregation[skill].freeDays += freeCapacity;
                    aggregation[skill].employees.push({
                        name: `${emp.firstName} ${emp.lastName}`,
                        freeDays: freeCapacity
                    });
                });
            }
        });
        
        return Object.values(aggregation).sort((a, b) => b.count - a.count).slice(0, 10);
    },
    
    getUtilizationSummary: function() {
        const utilization = KAPAStorage.get(KAPAStorage.KEYS.UTILIZATION) || [];
        
        if (utilization.length === 0) {
            return { '2M': 0, 'YTD': 0, '12M': 0 };
        }
        
        const summary = {
            '2M': 0,
            'YTD': 0,
            '12M': 0
        };
        
        utilization.forEach(u => {
            summary['2M'] += u['2M'];
            summary['YTD'] += u['YTD'];
            summary['12M'] += u['12M'];
        });
        
        const count = utilization.length;
        summary['2M'] = (summary['2M'] / count).toFixed(1);
        summary['YTD'] = (summary['YTD'] / count).toFixed(1);
        summary['12M'] = (summary['12M'] / count).toFixed(1);
        
        return summary;
    },
    
    getWeekData: function(employeeId, week) {
        const capacityPlan = KAPAStorage.get(KAPAStorage.KEYS.CAPACITY_PLAN) || [];
        return capacityPlan.filter(cp => cp.employeeId === employeeId && cp.week === week);
    },
    
    getTotalDaysInWeek: function(employeeId, week) {
        const weekData = this.getWeekData(employeeId, week);
        return weekData.reduce((sum, cp) => sum + cp.days, 0);
    },
    
    isOverbooked: function(employeeId, week) {
        const totalDays = this.getTotalDaysInWeek(employeeId, week);
        return totalDays > 5;
    },
    
    getAmpelColor: function(status) {
        const colors = {
            'green': '#2B7D2B',
            'yellow': '#F0AB00',
            'red': '#BB0000',
            'grey': '#6a6d70'
        };
        return colors[status] || colors['grey'];
    },
    
    getAmpelIcon: function(status) {
        const icons = {
            'green': 'sap-icon://thumb-up',
            'yellow': 'sap-icon://media-pause',
            'red': 'sap-icon://alert',
            'grey': 'sap-icon://question-mark'
        };
        return icons[status] || icons['grey'];
    },
    
    getAmpelState: function(status) {
        const states = {
            'green': 'Success',
            'yellow': 'Warning',
            'red': 'Error',
            'grey': 'None'
        };
        return states[status] || states['grey'];
    }
};
