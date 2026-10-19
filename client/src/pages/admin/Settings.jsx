import AppShell from '../../components/AppShell';
import Card from '../../components/Card';

export default function AdminSettings() {
  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
      <p className="text-slate-500 mt-1">Platform configuration.</p>

      <Card className="p-6 mt-6 max-w-2xl">
        <h2 className="font-display font-semibold text-ink mb-2">Proctoring risk weights & thresholds</h2>
        <p className="text-sm text-slate-500">
          Currently configured via <code>server/config/proctoringConfig.js</code> and the
          <code> PROCTOR_RISK_WEIGHTS_JSON</code> environment variable. A form-based editor here is a natural
          next step — wire it to a small <code>PUT /api/settings/proctoring</code> endpoint backed by a
          Settings collection.
        </p>
        <h2 className="font-display font-semibold text-ink mb-2 mt-6">Certificate completion requirements</h2>
        <p className="text-sm text-slate-500">
          Set per-course under each course's <code>completionRequirements</code> field (minimum completion %,
          minimum quiz score %, whether the final assessment must be passed). Editable today via the course
          update API; a dedicated form can be added to the course management screen.
        </p>
      </Card>
    </AppShell>
  );
}
