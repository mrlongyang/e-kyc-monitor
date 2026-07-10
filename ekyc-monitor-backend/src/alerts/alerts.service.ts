type Alert = {
  id: number;
  serviceName?: string;
  message: string;
  severity: "info" | "warning" | "critical";
  status: "active" | "resolved";
  createdAt: Date;
  resolvedAt?: Date;
};

let alerts: Alert[] = [];

export function createAlert(data: {
  serviceName?: string;
  message: string;
  severity: "info" | "warning" | "critical";
  status?: "active" | "resolved";
}) {
  const alert: Alert = {
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

export function resolveAlert(serviceName: string) {
  const alert = alerts.find(
    (a) => a.serviceName === serviceName && a.status === "active"
  );

  if (alert) {
    alert.status = "resolved";
    alert.resolvedAt = new Date();
  }

  return alert;
}

export function hasActiveAlert(serviceName: string) {
  return alerts.some(
    (a) => a.serviceName === serviceName && a.status === "active"
  );
}