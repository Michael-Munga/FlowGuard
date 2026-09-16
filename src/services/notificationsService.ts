// src/services/notificationsService.ts
//
// Central place for outbound notifications.
// Today: mocked. Produces the exact HTML/JSON the backend will send later.
// Tomorrow: flip USE_BACKEND to true and the same calls hit your API.

export interface DriverEmailPayload {
  driverName: string;
  driverEmail: string;
  truckRegistration: string;
  orderNumber: string;
  fromBay: string;
  toBay: string;
  reason: string;
  savedMinutes: number;
  savedKes: number;
  depotName: string;
  timestamp: string;
}

export interface DriverPushPayload {
  driverName: string;
  driverEmail: string;
  truckRegistration: string;
  fromBay: string;
  toBay: string;
  savedMinutes: number;
  savedKes: number;
  depotName: string;
  timestamp: string;
}

export interface EmailPreview {
  subject: string;
  to: string;
  html: string;
  plain: string;
}

const USE_BACKEND = false;
const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000/api/v1";

const fmtKes = (n: number) =>
  `KES ${n.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ---------------------------------------------------------------------------
// Build the email content (used both for the mock preview and the real send)
// ---------------------------------------------------------------------------
export function buildRerouteEmail(p: DriverEmailPayload): EmailPreview {
  const subject = `[KPC FlowGuard] Reroute — ${p.truckRegistration} moved from Bay ${p.fromBay} to Bay ${p.toBay}`;

  const plain = [
    `Hi ${p.driverName},`,
    ``,
    `FlowGuard has rerouted your collection at ${p.depotName}.`,
    ``,
    `Truck: ${p.truckRegistration}`,
    `Order: ${p.orderNumber}`,
    `From: Bay ${p.fromBay} (degraded)`,
    `To:   Bay ${p.toBay} (available, healthy)`,
    ``,
    `Reason: ${p.reason}`,
    ``,
    `Estimated time saved: ${p.savedMinutes} minutes`,
    `Estimated demurrage avoided: ${fmtKes(p.savedKes)}`,
    ``,
    `Please follow the bay signboard and the in-app instruction.`,
    ``,
    `— KPC FlowGuard Autonomous Dispatch`,
    `${p.timestamp}`,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F4F6F8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0F1B2B;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4F6F8;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:10px;overflow:hidden;border:1px solid #E2E6EA;">
            <tr>
              <td style="background:#0B1420;color:#FFFFFF;padding:20px 24px;">
                <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#94A3B8;font-weight:700;">KPC FlowGuard · Autonomous Dispatch</div>
                <div style="font-size:20px;font-weight:800;margin-top:4px;">Reroute Notification</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:14px;">Hi <strong>${p.driverName}</strong>,</p>
                <p style="margin:0 0 16px;font-size:14px;line-height:1.5;">
                  FlowGuard has rerouted your collection at <strong>${p.depotName}</strong> to reduce demurrage risk.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E2E6EA;border-radius:8px;margin:8px 0 20px;">
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:12px;color:#5C6B7A;width:40%;">Truck</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:13px;font-weight:700;">${p.truckRegistration}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:12px;color:#5C6B7A;">Order</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:13px;">${p.orderNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:12px;color:#5C6B7A;">From bay</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:13px;">
                      <span style="background:#FDEAEA;color:#A30000;padding:2px 8px;border-radius:12px;font-weight:700;font-size:12px;">${p.fromBay} · degraded</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:12px;color:#5C6B7A;">New bay</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #EDF1F5;font-size:13px;">
                      <span style="background:#E9F8EE;color:#1B7A3D;padding:2px 8px;border-radius:12px;font-weight:700;font-size:12px;">${p.toBay} · available</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;font-size:12px;color:#5C6B7A;">Time saved</td>
                    <td style="padding:12px 14px;font-size:13px;font-weight:700;color:#1B7A3D;">${p.savedMinutes} min</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;font-size:12px;color:#5C6B7A;">Demurrage avoided</td>
                    <td style="padding:12px 14px;font-size:13px;font-weight:700;color:#1B7A3D;">${fmtKes(p.savedKes)}</td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:12px;color:#5C6B7A;text-transform:uppercase;font-weight:700;letter-spacing:.5px;">Reason</p>
                <p style="margin:0 0 20px;font-size:13px;line-height:1.55;">${p.reason}</p>

                <a href="#" style="display:inline-block;background:#1B7A3D;color:#FFFFFF;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:800;font-size:13px;">Open in driver app</a>
              </td>
            </tr>
            <tr>
              <td style="background:#F8FAFC;border-top:1px solid #E2E6EA;padding:14px 24px;font-size:11px;color:#8492A6;">
                Kenya Pipeline Company · FlowGuard Control Plane · ${p.timestamp}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, to: p.driverEmail, html, plain };
}

// ---------------------------------------------------------------------------
// Send email — mocked today, backend-ready
// ---------------------------------------------------------------------------
export async function sendRerouteEmail(payload: DriverEmailPayload): Promise<EmailPreview> {
  const preview = buildRerouteEmail(payload);
  if (USE_BACKEND) {
    await fetch(`${API_BASE}/notify/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: payload.driverEmail, subject: preview.subject, html: preview.html }),
    }).catch(() => undefined);
  }
  return preview;
}

// ---------------------------------------------------------------------------
// Send push — mocked today, backend-ready
// ---------------------------------------------------------------------------
export async function sendReroutePush(payload: DriverPushPayload): Promise<DriverPushPayload> {
  if (USE_BACKEND) {
    await fetch(`${API_BASE}/notify/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }
  return payload;
}

// ---------------------------------------------------------------------------
// Voice copy builders — the lines the voice assistant speaks
// ---------------------------------------------------------------------------
export function buildRerouteVoiceLine(p: DriverPushPayload): string {
  return (
    `Attention command centre. Truck ${p.truckRegistration}, driven by ${p.driverName}, ` +
    `has been rerouted at ${p.depotName} from bay ${p.fromBay} to bay ${p.toBay}. ` +
    `Estimated recovery ${p.savedMinutes} minutes. ` +
    `Demurrage avoided ${Math.round(p.savedKes).toLocaleString()} Kenya shillings. ` +
    `Driver has been notified by email and push.`
  );
}

export function buildKpiVoiceLine(summary: {
  exposureProtectedKes: number;
  realizedSavingsKes: number;
  turnaroundImprovementPct: number;
  currentTurnaroundMin: number;
  baselineTurnaroundMin: number;
  interventionsVerified: number;
  interventionsTotal: number;
  predictionAttainmentPct: number;
  recommendation: string;
}): string {
  const m = (n: number) =>
    `${Math.round(n / 1_000_000).toLocaleString()} million`;
  const sign = summary.turnaroundImprovementPct < 0 ? "compressed by" : "changed by";
  const pct = Math.abs(summary.turnaroundImprovementPct).toFixed(1);
  return (
    `Executive summary. ` +
    `FlowGuard has protected ${m(summary.exposureProtectedKes)} Kenya shillings in demurrage exposure, ` +
    `with ${m(summary.realizedSavingsKes)} already realized in verified gate-outs. ` +
    `Average depot turnaround is ${sign} ${pct} percent, ` +
    `from ${summary.baselineTurnaroundMin} minutes baseline to ${summary.currentTurnaroundMin} minutes. ` +
    `Model prediction attainment stands at ${summary.predictionAttainmentPct.toFixed(1)} percent. ` +
    `${summary.interventionsVerified} of ${summary.interventionsTotal} autonomous interventions verified. ` +
    `Stage-gate recommendation: ${summary.recommendation}.`
  );
}