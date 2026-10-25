import { Application, DashboardStats } from './types';
import { getApplications, getDashboardStats } from './storage';
import { evaluateApplication } from './review-rules';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionLinks?: { label: string; href: string }[];
  highlightItems?: string[];
}

/**
 * Natural language intent parser & response generator for RTO Officer
 * Formats response in clean, readable plain Tamil text without raw markdown asterisks.
 */
export function processOfficerQuery(
  rawQuery: string,
  currentAppId?: string
): { reply: string; actionLinks?: { label: string; href: string }[]; highlights?: string[] } {
  const query = rawQuery.toLowerCase().trim();
  const allApps = getApplications();
  const stats = getDashboardStats(allApps);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Current Application Contextual Query
  if (currentAppId && (query.includes('இந்த') || query.includes('this') || query.includes('விண்ணப்பம்') || query.includes('current') || query.includes('ஆவணம்'))) {
    const currentApp = allApps.find((a) => a.id === currentAppId);
    if (currentApp) {
      const evalResult = evaluateApplication(currentApp);
      const docsSummary = currentApp.documents
        .map((d) => `• ${d.name}: ${d.status === 'verified' ? 'சரிபார்க்கப்பட்டது' : d.status === 'missing' ? 'விடுபட்டுள்ளது' : d.status === 'rejected' ? 'நிராகரிக்கப்பட்டது' : 'ஆய்வில் உள்ளது'}`)
        .join('\n');

      return {
        reply: `விண்ணப்பம் ${currentApp.applicationNumber} (${currentApp.applicantName}) சுருக்கம்:

வகை: ${currentApp.applicationType} | வயது: ${currentApp.age} | மாவட்டம்: ${currentApp.district}
தற்போதைய நிலை: ${currentApp.status === 'pending' ? 'நிலுவையில் உள்ளது' : currentApp.status === 'under_review' ? 'ஆய்வில் உள்ளது' : currentApp.status === 'approved' ? 'ஒப்புதல் அளிக்கப்பட்டது' : currentApp.status === 'returned' ? 'திருப்பி அனுப்பப்பட்டது' : 'நிராகரிக்கப்பட்டது'}
AI பரிந்துரை: ${evalResult.suggestionLabel}

விண்ணப்பச் சுருக்கம்:
${evalResult.summary}

ஆவணங்களின் நிலை:
${docsSummary}

${evalResult.missingDocuments.length > 0 ? `விடுபட்ட ஆவணங்கள்:\n• ${evalResult.missingDocuments.join('\n• ')}\n` : ''}
${evalResult.inconsistencies.length > 0 ? `கவனிக்க வேண்டியவை:\n• ${evalResult.inconsistencies.join('\n• ')}` : ''}`,
        highlights: evalResult.reasons,
      };
    }
  }

  // 2. Query for Specific Applicant Name or Application Number
  const matchedApp = allApps.find(
    (a) =>
      query.includes(a.applicationNumber.toLowerCase()) ||
      query.includes(a.applicantName.toLowerCase()) ||
      (a.applicantNameEn && query.includes(a.applicantNameEn.toLowerCase()))
  );

  if (matchedApp) {
    const evalResult = evaluateApplication(matchedApp);
    return {
      reply: `விண்ணப்ப எண்: ${matchedApp.applicationNumber} — ${matchedApp.applicantName}

• வகை: ${matchedApp.applicationType} | மாவட்டம்: ${matchedApp.district}
• நிலை: ${matchedApp.status}
• AI பரிந்துரை: ${evalResult.suggestionLabel}
• சுருக்கம்: ${evalResult.summary}
${evalResult.missingDocuments.length > 0 ? `• விடுபட்டவை: ${evalResult.missingDocuments.join(', ')}` : '• ஆவணங்கள்: அனைத்து கட்டாய ஆவணங்களும் சரியாக உள்ளன.'}`,
      actionLinks: [{ label: `விவரங்களை காண்க (${matchedApp.applicationNumber})`, href: `/applications/${matchedApp.id}` }],
    };
  }

  // 3. Overall Office Workload Summary (அலுவலக பணிச்சுமை சுருக்கம்)
  if (
    query.includes('சுருக்கம்') ||
    query.includes('summary') ||
    query.includes('அலுவலக') ||
    query.includes('office') ||
    query.includes('workload') ||
    query.includes('பணிச்சுமை') ||
    query.includes('இன்றைய') ||
    query.includes('today')
  ) {
    const highPriorityPending = allApps.filter((a) => a.priority === 'high' && (a.status === 'pending' || a.status === 'under_review'));

    return {
      reply: `இன்றைய RTO அலுவலக பணிச்சுமை சுருக்கம் (நேரம்: ${timeStr}):

• மொத்த விண்ணப்பங்கள்: ${stats.total}
• நிலுவையில் உள்ளவை (Pending): ${stats.pending}
• ஆய்வில் உள்ளவை (Under Review): ${stats.underReview}
• உடனடி கவனம் தேவை (High Priority / Risk): ${stats.requiresAttention}
• ஒப்புதல் அளிக்கப்பட்டவை (Approved): ${stats.approved}
• திருப்பி அனுப்பப்பட்டவை (Returned): ${stats.returned}
• நிராகரிக்கப்பட்டவை (Rejected): ${stats.rejected}

${highPriorityPending.length > 0 ? `உடனடி தீர்வு காண வேண்டிய உயர் முன்னுரிமை விண்ணப்பங்கள்:\n` + highPriorityPending.map((a) => `• ${a.applicationNumber} - ${a.applicantName} (${a.district}, ${a.applicationType})`).join('\n') : 'உயர் முன்னுரிமை நிலுவைகள் எதுவும் இல்லை.'}`,
      actionLinks: [
        { label: 'நிலுவை விண்ணப்பங்கள்', href: '/applications?status=pending' },
        { label: 'உயர் முன்னுரிமை வரிசை', href: '/applications?priority=high' },
      ],
    };
  }

  // 4. Immediate Attention / High Priority (உடனடி கவனம் தேவைப்படுபவை)
  if (
    query.includes('உடனடி') ||
    query.includes('முன்னுரிமை') ||
    query.includes('attention') ||
    query.includes('urgent') ||
    query.includes('priority') ||
    query.includes('high')
  ) {
    const urgentApps = allApps.filter(
      (a) =>
        (a.status === 'pending' || a.status === 'under_review') &&
        (a.priority === 'high' || (a.riskFlags && a.riskFlags.length > 0))
    );

    return {
      reply: `உடனடி கவனம் தேவைப்படும் ${urgentApps.length} விண்ணப்பங்கள்:

` + urgentApps.map((a, idx) => {
      const evalResult = evaluateApplication(a);
      return `${idx + 1}. ${a.applicationNumber} — ${a.applicantName} (${a.district})
   • வகை: ${a.applicationType} | முன்னுரிமை: உயர் முன்னுரிமை
   • காரணம் / இடர்: ${a.riskFlags.length > 0 ? a.riskFlags.join(', ') : evalResult.summary}
   • AI பரிந்துரை: ${evalResult.suggestionLabel}`;
    }).join('\n\n'),
      actionLinks: urgentApps.map((a) => ({ label: `${a.applicantName} (${a.applicationNumber})`, href: `/applications/${a.id}` })),
    };
  }

  // 5. Missing Documents & Medical Certificates Query (விடுபட்ட ஆவணங்கள் / படிவம் 1A)
  if (
    query.includes('மருத்துவம்') ||
    query.includes('medical') ||
    query.includes('சான்றிதழ்') ||
    query.includes('document') ||
    query.includes('missing') ||
    query.includes('விடுபட்ட') ||
    query.includes('1a')
  ) {
    const missingDocsApps = allApps.filter((a) => {
      const evalRes = evaluateApplication(a);
      return evalRes.missingDocuments.length > 0 || a.documents.some((d) => d.status === 'missing');
    });

    return {
      reply: `ஆவணக் குறைபாடு அல்லது விடுபட்ட ஆவணங்கள் உள்ள ${missingDocsApps.length} விண்ணப்பங்கள்:

` + missingDocsApps.map((a, idx) => {
      const evalRes = evaluateApplication(a);
      return `${idx + 1}. ${a.applicationNumber} — ${a.applicantName} (${a.district})
   • விடுபட்டவை: ${evalRes.missingDocuments.join(', ')}
   • பரிந்துரை: திருத்தத்திற்கு திருப்பி அனுப்பவும் (Return)`;
    }).join('\n\n'),
      actionLinks: missingDocsApps.map((a) => ({ label: `${a.applicantName} (${a.applicationNumber})`, href: `/applications/${a.id}` })),
    };
  }

  // 6. District Query (சென்னை, கோவை, மதுரை etc.)
  const foundDistrict = ['சென்னை', 'கோயம்புத்தூர்', 'மதுரை', 'திருச்சிராப்பள்ளி', 'சேலம்', 'திருநெல்வேலி', 'ஈரோடு', 'வேலூர்', 'திண்டுக்கல்', 'தஞ்சாவூர்', 'காஞ்சிபுரம்', 'கன்னியாகுமரி'].find(
    (d) => query.includes(d.toLowerCase()) || (d === 'கோயம்புத்தூர்' && query.includes('கோவை')) || (d === 'சென்னை' && query.includes('chennai')) || (d === 'மதுரை' && query.includes('madurai'))
  );

  if (foundDistrict) {
    const districtApps = allApps.filter((a) => a.district.includes(foundDistrict) || (foundDistrict === 'கோயம்புத்தூர்' && a.district.includes('கோயம்புத்தூர்')));
    return {
      reply: `${foundDistrict} மாவட்ட விண்ணப்பங்கள் நிலை சுருக்கம்:

• மொத்த விண்ணப்பங்கள்: ${districtApps.length}
• நிலுவையில்: ${districtApps.filter((a) => a.status === 'pending').length}
• ஆய்வில்: ${districtApps.filter((a) => a.status === 'under_review').length}
• ஒப்புதல் பெற்றவை: ${districtApps.filter((a) => a.status === 'approved').length}
• திருப்பி / நிராகரிப்பு: ${districtApps.filter((a) => a.status === 'returned' || a.status === 'rejected').length}

விண்ணப்பதாரர்கள்:
` + districtApps.map((a) => `• ${a.applicationNumber} - ${a.applicantName} (${a.applicationType}) - ${a.status}`).join('\n'),
      actionLinks: [{ label: `${foundDistrict} மாவட்ட பதிவுகள்`, href: `/applications?district=${encodeURIComponent(foundDistrict)}` }],
    };
  }

  // 7. General Knowledge / Guidelines on RTO Review Rules
  if (query.includes('விதி') || query.includes('rule') || query.includes('வயது') || query.includes('age') || query.includes('renewal')) {
    return {
      reply: `மோட்டார் வாகனச் சட்டம் மற்றும் ஆய்வு வழிகாட்டுதல்:

1. பழகுநர் உரிமம் (LL):
   • LMV (நான்கு சக்கர வாகனம்): 18 வயது நிறைவு கட்டாயம்.
   • 50cc-க்குட்பட்ட கியர் இல்லாத இருசக்கர வாகனம்: 16 வயது.
2. ஓட்டுநர் உரிமம் (DL):
   • LLR பெற்று குறைந்தபட்சம் 30 நாட்கள் நிறைவடைந்திருக்க வேண்டும் (6 மாதங்களுக்குள்).
   • அங்கீகரிக்கப்பட்ட பயிற்சிப் பள்ளி படிவம் 5 சான்றிதழ் அவசியம்.
3. உரிமம் புதுப்பித்தல் (Renewal):
   • 40 வயதுக்கு மேற்பட்ட விண்ணப்பதாரர்களுக்கு பதிவுபெற்ற மருத்துவர் வழங்கிய படிவம் 1A மருத்துவ உடற்தகுதி சான்றிதழ் கட்டாயம்.`,
      actionLinks: [{ label: 'பயனர் கையேட்டை படிக்க', href: '/manual' }],
    };
  }

  // Default Fallback
  return {
    reply: `வணக்கம் அலுவலரே! நான் உங்கள் RTO AI உதவியாளர்.

உங்களுக்கு உதவக்கூடிய சில கேள்விகள்:
• "இன்றைய அலுவலக சுருக்கம் கூறு"
• "உடனடி கவனம் தேவைப்படும் விண்ணப்பங்கள் எவை?"
• "விடுபட்ட மருத்துவ சான்றிதழ் உள்ள விண்ணப்பங்களை காட்டு"
• "சென்னை மாவட்ட விண்ணப்பங்கள் நிலை என்ன?"
• அல்லது விண்ணப்ப எண் உள்ளிட்டு கேட்கலாம் (எ.கா: TN-2026-LL-10042).`,
    actionLinks: [
      { label: 'அலுவலக சுருக்கம்', href: '/dashboard' },
      { label: 'நிலுவை விண்ணப்பங்கள்', href: '/applications?status=pending' },
    ],
  };
}
