let alerts = [];
export function createAlert(data) {
    const alert = {
        id: Date.now(),
        serviceName: data.serviceName,
        message: data.message,
        severity: data.severity,
        status: data.status || "active",
        createdAt: new Date(),
    };
    alerts.unshift(alert);
    return alert;
}
export function getAlerts() {
    return alerts;
}
export function getActiveAlerts() {
    return alerts.filter((a) => a.status === "active");
}
export function resolveAlert(serviceName) {
    const alert = alerts.find((a) => a.serviceName === serviceName && a.status === "active");
    if (alert) {
        alert.status = "resolved";
        alert.resolvedAt = new Date();
    }
    return alert;
}
export function hasActiveAlert(serviceName) {
    return alerts.some((a) => a.serviceName === serviceName && a.status === "active");
}
