/**
 * Dashboard household-safety logic (pure functions, no React).
 *
 * Turns per-profile safety-engine results (GET /safety/score/:id) into the
 * three things the dashboard shows: the overall Family Safety Index, ONE
 * prioritized Smart Safety Insight, and the Today status snapshot.
 *
 * Safety rules: every insight must come from a real structured alert
 * returned by the backend engine — nothing is invented here. Safe / no-data
 * states are shown only when the engine genuinely reports no findings.
 */

// Alert type importance for picking the single dashboard insight.
const TYPE_RANK = { allergy: 0, recall: 1, interaction: 2, duplicate: 3, amr: 4, condition: 5 };
const SEVERITY_RANK = { critical: 0, severe: 0, high: 0, moderate: 1, warning: 1, caution: 2, low: 2 };

const rank = (value, table) => {
  const key = String(value || '').toLowerCase();
  return table[key] != null ? table[key] : 3;
};

// One-line templates per alert type — neutral safety language only:
// never diagnoses, prescribes, or tells the user to start/stop a medicine.
const INSIGHT_TEMPLATES = {
  allergy: {
    tone: 'danger',
    title: 'Allergy conflict detected',
    message: (a) => `One of ${a.memberName}'s medicines may conflict with a recorded allergy. Review the safety details.`,
  },
  recall: {
    tone: 'danger',
    title: 'Medication safety alert',
    message: (a) => `A medicine recorded for ${a.memberName} is affected by a DRAP recall. Review the safety details.`,
  },
  interaction: {
    tone: 'warning',
    title: 'Interaction needs attention',
    message: (a) => `A potential medication interaction was detected in ${a.memberName}'s current medicines. Review the safety details.`,
  },
  duplicate: {
    tone: 'warning',
    title: 'Duplicate active ingredients',
    message: () => 'Potential duplicate active ingredients detected. Review before combining medicines.',
  },
  amr: {
    tone: 'warning',
    title: 'Antibiotic use review',
    message: (a) => `Multiple antibiotics are active for ${a.memberName}. This can contribute to antimicrobial resistance — a doctor should confirm the combination.`,
  },
  condition: {
    tone: 'caution',
    title: 'Condition precaution',
    message: (a) => `A recorded health condition requires precaution with one of ${a.memberName}'s medicines. Review the safety details.`,
  },
};

function prioritizeAlerts(alerts) {
  return [...alerts].sort((a, b) => {
    const byType = rank(a.type, TYPE_RANK) - rank(b.type, TYPE_RANK);
    if (byType !== 0) return byType;
    return rank(a.severity, SEVERITY_RANK) - rank(b.severity, SEVERITY_RANK);
  });
}

function buildInsight(hasData, topAlert) {
  if (!hasData) {
    return {
      tone: 'empty',
      title: 'Build your safety profile',
      message: 'Add household medication information to unlock personalized safety insights.',
      action: '/family-profile',
    };
  }
  if (!topAlert) {
    return {
      tone: 'safe',
      title: 'No major safety concerns',
      message: 'Your household medication profile currently shows no major safety concerns.',
      action: '/safety-center',
    };
  }
  const template = INSIGHT_TEMPLATES[topAlert.type] || INSIGHT_TEMPLATES.condition;
  return {
    tone: template.tone,
    title: template.title,
    message: template.message(topAlert),
    action: '/safety-center',
  };
}

function buildToday(hasData, topAlert, alerts) {
  if (!hasData) {
    return { tone: 'empty', title: 'Getting started', message: 'Add your household medicines to activate safety monitoring.' };
  }
  const hasCritical = alerts.some((a) => rank(a.severity, SEVERITY_RANK) === 0);
  if (hasCritical) {
    return { tone: 'danger', title: 'Important safety alert', message: 'Review the highlighted safety concern.' };
  }
  if (topAlert) {
    return { tone: 'warning', title: 'Attention needed', message: 'One safety concern requires review.' };
  }
  return { tone: 'safe', title: 'Everything looks good', message: 'No urgent medication safety action is pending.' };
}

/**
 * @param {Array} members - family profiles from GET /family/members
 * @param {Array} scoreResults - engine results aligned with members
 *   ({ score, structuredAlerts, activeMedicationCount, allergyCount, conditionCount })
 * @returns {{ hasData: boolean, index: number|null, profileCount: number,
 *             alerts: Array, insight: object, today: object, metrics: object }}
 */
export function buildHouseholdSnapshot(members = [], scoreResults = []) {
  const entries = members.map((member, i) => ({ member, result: scoreResults[i] || null }));

  // "Has data" = at least one profile has medicines, allergies or conditions
  // recorded. Without that the index is intentionally not shown — an empty
  // profile's 100/100 must never masquerade as a real safety result.
  const hasData = entries.some(
    (e) => e.result
      && ((e.result.activeMedicationCount || 0) > 0
        || (e.result.allergyCount || 0) > 0
        || (e.result.conditionCount || 0) > 0)
  );

  const alerts = [];
  let scoreSum = 0;
  let scoreCount = 0;
  const metrics = {
    protectedMembers: 0,
    medicinesMonitored: 0,
    activeSafetyChecks: 0,
    criticalInteractions: 0,
    drapMonitoring: 'Active',
    lastRiskAssessment: null,
  };

  entries.forEach(({ member, result }) => {
    if (!result) return;
    if (typeof result.score === 'number') {
      scoreSum += result.score;
      scoreCount += 1;
    }
    // Metrics: count only profiles with actual safety data as "protected"
    if ((result.activeMedicationCount || 0) > 0
      || (result.allergyCount || 0) > 0
      || (result.conditionCount || 0) > 0) {
      metrics.protectedMembers += 1;
    }
    metrics.medicinesMonitored += result.activeMedicationCount || 0;
    metrics.activeSafetyChecks += 1;

    (result.structuredAlerts || []).forEach((a) => {
      alerts.push({ ...a, memberId: member.id, memberName: member.name });
      const sev = String(a.severity || '').toLowerCase();
      const type = String(a.type || '').toLowerCase();
      if (type === 'interaction' && ['critical', 'severe', 'high'].includes(sev)) {
        metrics.criticalInteractions += 1;
      }
      if (type === 'recall') {
        metrics.drapMonitoring = 'Recall Detected';
      }
    });
  });

  const index = hasData && scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;
  const ordered = prioritizeAlerts(alerts);
  const topAlert = ordered[0] || null;

  // "Last risk assessment" — reflects that the engine just ran for this view
  metrics.lastRiskAssessment = scoreCount > 0 ? new Date() : null;

  return {
    hasData,
    index,
    profileCount: members.length,
    alerts,
    insight: buildInsight(hasData, topAlert),
    today: buildToday(hasData, topAlert, alerts),
    metrics,
    memberScores: members.map((member, i) => {
      const r = scoreResults[i] || null;
      return {
        id: member.id,
        name: member.name,
        relation: member.relation,
        age: member.age,
        score: r?.score ?? null,
        riskLevel: r?.riskLevel || 'unknown',
        activeMedsCount: r?.activeMedicationCount || 0,
        alertsCount: (r?.structuredAlerts || []).length,
        allergyCount: r?.allergyCount || 0,
        conditionCount: r?.conditionCount || 0,
      };
    }),
  };
}

export function getIndexLabel(index) {
  if (index == null) return null;
  if (index >= 80) return { label: 'Good', tone: 'safe' };
  if (index >= 50) return { label: 'Fair', tone: 'warning' };
  return { label: 'Needs Attention', tone: 'danger' };
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
