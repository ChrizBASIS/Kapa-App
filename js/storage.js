// KAPA-App LocalStorage Management
const KAPAStorage = {
    KEYS: {
        EMPLOYEES: 'kapa_employees',
        CAPACITY_PLAN: 'kapa_capacity_plan',
        PROJECTS: 'kapa_projects',
        SKILLS: 'kapa_skills',
        UTILIZATION: 'kapa_utilization',
        SETTINGS: 'kapa_settings',
        FREE_CAPACITY: 'kapa_free_capacity',
        INITIALIZED: 'kapa_initialized'
    },
    
    DATA_VERSION: '2',
    
    init: async function() {
        const isInitialized = localStorage.getItem(this.KEYS.INITIALIZED);
        const currentVersion = localStorage.getItem('kapa_data_version');
        
        // Force re-init if data version changed (e.g. country field added)
        if (isInitialized && currentVersion !== this.DATA_VERSION) {
            console.log('Data version changed, re-initializing...');
            this.reset();
        }
        
        if (!isInitialized || currentVersion !== this.DATA_VERSION) {
            console.log('Initializing KAPA Storage from JSON files...');
            
            try {
                await this.loadFromJSON('data/employees.json', this.KEYS.EMPLOYEES);
                await this.loadFromJSON('data/skills.json', this.KEYS.SKILLS);
                await this.loadFromJSON('data/projects.json', this.KEYS.PROJECTS);
                await this.loadFromJSON('data/capacityPlan.json', this.KEYS.CAPACITY_PLAN);
                await this.loadFromJSON('data/utilization.json', this.KEYS.UTILIZATION);
                
                this.set(this.KEYS.SETTINGS, {
                    thresholds: {
                        '3W': { red: 30, yellow: 51 },
                        '6W': { red: 30, yellow: 51 },
                        '9W': { red: 30, yellow: 51 }
                    }
                });
                
                this.set(this.KEYS.FREE_CAPACITY, []);
                
                localStorage.setItem(this.KEYS.INITIALIZED, 'true');
                localStorage.setItem('kapa_data_version', this.DATA_VERSION);
                console.log('KAPA Storage initialized successfully (v' + this.DATA_VERSION + ')');
            } catch (error) {
                console.error('Error initializing storage:', error);
            }
        } else {
            console.log('KAPA Storage already initialized');
        }
    },
    
    loadFromJSON: async function(url, key) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.set(key, data);
            console.log(`Loaded ${key} from ${url}`);
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
            throw error;
        }
    },
    
    get: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting ${key}:`, error);
            return null;
        }
    },
    
    set: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            return false;
        }
    },
    
    update: function(key, id, updatedItem) {
        try {
            const data = this.get(key);
            if (!data) return false;
            
            const index = data.findIndex(item => item.id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...updatedItem };
                this.set(key, data);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error updating ${key}:`, error);
            return false;
        }
    },
    
    add: function(key, newItem) {
        try {
            const data = this.get(key) || [];
            data.push(newItem);
            this.set(key, data);
            return true;
        } catch (error) {
            console.error(`Error adding to ${key}:`, error);
            return false;
        }
    },
    
    delete: function(key, id) {
        try {
            const data = this.get(key);
            if (!data) return false;
            
            const filteredData = data.filter(item => item.id !== id);
            this.set(key, filteredData);
            return true;
        } catch (error) {
            console.error(`Error deleting from ${key}:`, error);
            return false;
        }
    },
    
    getSkills: function(category = null) {
        const skills = this.get(this.KEYS.SKILLS) || [];
        if (category) {
            return skills.filter(skill => skill.category === category);
        }
        return skills;
    },
    
    addSkill: function(skillName, category) {
        const skills = this.getSkills();
        
        const exists = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
        if (exists) {
            return { success: false, message: 'Skill already exists' };
        }
        
        const newSkill = {
            id: 'SKL' + Date.now(),
            name: skillName,
            category: category,
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        
        skills.push(newSkill);
        this.set(this.KEYS.SKILLS, skills);
        
        return { success: true, skill: newSkill };
    },
    
    deleteSkill: function(skillId) {
        const skills = this.getSkills();
        const skill = skills.find(s => s.id === skillId);
        
        if (!skill) {
            return { success: false, message: 'Skill not found' };
        }
        
        if (!skill.isCustom) {
            return { success: false, message: 'Default skills cannot be deleted' };
        }
        
        this.delete(this.KEYS.SKILLS, skillId);
        return { success: true };
    },
    
    getEmployeeById: function(employeeId) {
        const employees = this.get(this.KEYS.EMPLOYEES) || [];
        return employees.find(emp => emp.id === employeeId);
    },
    
    getProjectById: function(projectId) {
        const projects = this.get(this.KEYS.PROJECTS) || [];
        return projects.find(proj => proj.id === projectId);
    },
    
    getCapacityPlanByEmployee: function(employeeId, week = null) {
        const capacityPlan = this.get(this.KEYS.CAPACITY_PLAN) || [];
        let filtered = capacityPlan.filter(cp => cp.employeeId === employeeId);
        
        if (week !== null) {
            filtered = filtered.filter(cp => cp.week === week);
        }
        
        return filtered;
    },
    
    updateCapacityPlan: function(capacityItem) {
        const capacityPlan = this.get(this.KEYS.CAPACITY_PLAN) || [];
        const index = capacityPlan.findIndex(cp => cp.id === capacityItem.id);
        
        if (index !== -1) {
            capacityPlan[index] = capacityItem;
        } else {
            capacityPlan.push(capacityItem);
        }
        
        this.set(this.KEYS.CAPACITY_PLAN, capacityPlan);
        return true;
    },
    
    reset: function() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('KAPA Storage reset complete');
    },
    
    export: function() {
        const data = {};
        Object.entries(this.KEYS).forEach(([name, key]) => {
            data[name] = this.get(key);
        });
        return data;
    }
};
