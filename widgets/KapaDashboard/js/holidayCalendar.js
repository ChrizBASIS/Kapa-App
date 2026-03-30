// KAPA-App Holiday Calendar Management
const KAPAHolidayCalendar = {

    STORAGE_KEY: 'kapa_holidays',

    COUNTRY_LABELS: {
        'DE': 'Deutschland',
        'AT': 'Österreich',
        'CH': 'Schweiz',
        'IT': 'Italia',
        'US': 'United States',
        'NL': 'Nederland',
        'BE': 'België',
        'ES': 'España',
        'MX': 'México'
    },

    COUNTRY_FLAGS: {
        'DE': '🇩🇪', 'AT': '🇦🇹', 'CH': '🇨🇭', 'IT': '🇮🇹',
        'US': '🇺🇸', 'NL': '🇳🇱', 'BE': '🇧🇪', 'ES': '🇪🇸', 'MX': '🇲🇽'
    },

    init: async function() {
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            // Try widget-local path first (works on Netlify), then project-root path (local dev)
            const paths = ['data/holidays.json', '../../data/holidays.json'];
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        const data = await response.json();
                        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                        console.log('Holiday calendars loaded from:', path);
                        break;
                    }
                } catch (e) {
                    // try next path
                }
            }
        }
    },

    getAll: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    getCountryHolidays: function(countryCode) {
        const all = this.getAll();
        return all[countryCode] ? all[countryCode].holidays || [] : [];
    },

    getHolidaysInWeek: function(countryCode, year, weekNumber) {
        const holidays = this.getCountryHolidays(countryCode);
        return holidays.filter(function(h) {
            const d = new Date(h.date + 'T00:00:00');
            var dayOfWeek = d.getDay() || 7;
            // Find Thursday of that week to determine ISO week number
            var thursday = new Date(d);
            thursday.setDate(d.getDate() + (4 - dayOfWeek));
            var yearStart = new Date(thursday.getFullYear(), 0, 1);
            var wn = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
            // Only count weekday holidays (Mon-Fri)
            var dow = d.getDay();
            return wn === weekNumber && d.getFullYear() === year && dow !== 0 && dow !== 6;
        });
    },

    getHolidaysInWeekRange: function(countryCode, startWeek, numWeeks, year) {
        if (!year) year = new Date().getFullYear();
        var totalHolidays = 0;
        for (var w = startWeek; w < startWeek + numWeeks; w++) {
            totalHolidays += this.getHolidaysInWeek(countryCode, year, w).length;
        }
        return totalHolidays;
    },

    getWorkingDaysInWeekRange: function(countryCode, startWeek, numWeeks, year) {
        var totalWeekdays = numWeeks * 5;
        var holidays = this.getHolidaysInWeekRange(countryCode, startWeek, numWeeks, year);
        return totalWeekdays - holidays;
    },

    getWorkingDaysInMonth: function(countryCode, year, month) {
        var daysInMonth = new Date(year, month, 0).getDate();
        var workingDays = 0;
        var holidays = this.getCountryHolidays(countryCode);
        var holidayDates = holidays.map(function(h) { return h.date; });

        for (var day = 1; day <= daysInMonth; day++) {
            var date = new Date(year, month - 1, day);
            var dow = date.getDay();
            if (dow !== 0 && dow !== 6) {
                var dateStr = date.getFullYear() + '-' +
                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                    String(date.getDate()).padStart(2, '0');
                if (!holidayDates.includes(dateStr)) {
                    workingDays++;
                }
            }
        }
        return workingDays;
    },

    addHoliday: function(countryCode, date, name) {
        var all = this.getAll();
        if (!all[countryCode]) {
            all[countryCode] = {
                name: this.COUNTRY_LABELS[countryCode] || countryCode,
                flag: countryCode,
                holidays: []
            };
        }
        var exists = all[countryCode].holidays.some(function(h) { return h.date === date; });
        if (!exists) {
            all[countryCode].holidays.push({ date: date, name: name });
            all[countryCode].holidays.sort(function(a, b) { return a.date.localeCompare(b.date); });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
            return true;
        }
        return false;
    },

    removeHoliday: function(countryCode, date) {
        var all = this.getAll();
        if (all[countryCode]) {
            all[countryCode].holidays = all[countryCode].holidays.filter(function(h) {
                return h.date !== date;
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
            return true;
        }
        return false;
    },

    getCountryLabel: function(code) {
        return this.COUNTRY_LABELS[code] || code;
    },

    getCountryFlag: function(code) {
        return code || '??';
    },

    getSupportedCountries: function() {
        return Object.keys(this.COUNTRY_LABELS);
    },

    openManageDialog: function() {
        var self = this;
        var allData = this.getAll();
        var countries = Object.keys(allData);
        if (countries.length === 0) countries = this.getSupportedCountries();

        var selectedCountry = countries[0] || 'DE';

        var countrySelect = new sap.m.Select({
            id: "holidayCountrySelect",
            selectedKey: selectedCountry,
            items: countries.map(function(c) {
                return new sap.ui.core.Item({
                    key: c,
                    text: c + ' — ' + (self.COUNTRY_LABELS[c] || c)
                });
            }),
            change: function() {
                refreshHolidayList();
            }
        });

        var holidayList = new sap.m.List({
            id: "holidayListControl",
            noDataText: "No holidays configured"
        });

        function refreshHolidayList() {
            holidayList.removeAllItems();
            var code = countrySelect.getSelectedKey();
            var holidays = self.getCountryHolidays(code);
            var year = new Date().getFullYear();
            holidays.filter(function(h) {
                return h.date.startsWith(String(year)) || h.date.startsWith(String(year + 1));
            }).forEach(function(h) {
                var d = new Date(h.date + 'T00:00:00');
                var dayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                var dateText = dayNames[d.getDay()] + ', ' +
                    String(d.getDate()).padStart(2, '0') + '.' +
                    String(d.getMonth() + 1).padStart(2, '0') + '.' +
                    d.getFullYear();

                holidayList.addItem(new sap.m.CustomListItem({
                    content: [
                        new sap.m.HBox({
                            justifyContent: "SpaceBetween",
                            alignItems: "Center",
                            width: "100%",
                            items: [
                                new sap.m.VBox({
                                    items: [
                                        new sap.m.Text({ text: h.name }).addStyleClass("textBold"),
                                        new sap.m.Text({ text: dateText }).addStyleClass("textMuted")
                                    ]
                                }),
                                new sap.m.Button({
                                    icon: "sap-icon://delete",
                                    type: "Transparent",
                                    press: function() {
                                        self.removeHoliday(code, h.date);
                                        refreshHolidayList();
                                        sap.m.MessageToast.show("Holiday removed");
                                    }
                                })
                            ]
                        })
                    ]
                }));
            });
        }

        refreshHolidayList();

        var addDatePicker = new sap.m.DatePicker({
            id: "holidayAddDate",
            placeholder: "Date...",
            displayFormat: "dd.MM.yyyy",
            valueFormat: "yyyy-MM-dd",
            width: "160px"
        });

        var addNameInput = new sap.m.Input({
            id: "holidayAddName",
            placeholder: "Holiday name...",
            width: "200px"
        });

        var dialog = new sap.m.Dialog({
            title: "Holiday Calendar Management",
            contentWidth: "550px",
            content: [
                new sap.m.VBox({
                    items: [
                        new sap.m.MessageStrip({
                            text: "Manage public holidays per country. These are used to calculate the correct working days for utilization.",
                            type: "Information",
                            showIcon: true
                        }),
                        new sap.m.HBox({
                            alignItems: "End",
                            items: [
                                new sap.m.VBox({
                                    items: [
                                        new sap.m.Label({ text: "Country", design: "Bold" }),
                                        countrySelect
                                    ]
                                })
                            ]
                        }).addStyleClass("sapUiSmallMarginTop"),
                        holidayList,
                        new sap.m.HBox({
                            alignItems: "End",
                            items: [
                                addDatePicker,
                                addNameInput,
                                new sap.m.Button({
                                    text: "Add",
                                    type: "Emphasized",
                                    press: function() {
                                        var date = addDatePicker.getValue();
                                        var name = addNameInput.getValue().trim();
                                        if (!date || !name) {
                                            sap.m.MessageToast.show("Please enter date and name");
                                            return;
                                        }
                                        var code = countrySelect.getSelectedKey();
                                        if (self.addHoliday(code, date, name)) {
                                            refreshHolidayList();
                                            addDatePicker.setValue("");
                                            addNameInput.setValue("");
                                            sap.m.MessageToast.show("Holiday added");
                                        } else {
                                            sap.m.MessageToast.show("Holiday already exists for this date");
                                        }
                                    }
                                })
                            ]
                        }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBottom")
                    ]
                }).addStyleClass("sapUiContentPadding")
            ],
            endButton: new sap.m.Button({
                text: "Close",
                press: function() { dialog.close(); }
            }),
            afterClose: function() { dialog.destroy(); }
        });

        dialog.open();
    }
};

// Expose globally for the custom widget and standalone preview
window.holidayCalendar = KAPAHolidayCalendar;
window.KAPAHolidayCalendar = KAPAHolidayCalendar;

// Auto-initialise: load holiday data from data/holidays.json into localStorage.
// The init() function already checks whether data exists, so this is idempotent.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KAPAHolidayCalendar.init());
} else {
    KAPAHolidayCalendar.init();
}
