// Matches the backend DashboardDto (Server/Services/Dashboard/IDashboardService.cs)
export type DashboardActivity = {
    description: string;
    type: string;
    timestamp: string;
    userName: string;
};

export type LicensesPerDay = {
    date: string;
    count: number;
};

export type Dashboard = {
    members: number;
    roles: number;
    apps: number;
    appsInactive: number;
    licensesTotal: number;
    licensesActive: number;
    licensesPaused: number;
    pendingInvites: number;
    signInsLast24H: number;
    licensesPerDay: LicensesPerDay[];
    recentActivity: DashboardActivity[];
};
