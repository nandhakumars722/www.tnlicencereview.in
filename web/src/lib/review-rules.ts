import { Application, AIReviewOutput } from './types';

/**
 * விதிமுறை அடிப்படையிலான தானியங்கி உதவி (Deterministic Rule-Based AI Review Engine)
 * எந்தவித புற API அல்லது கட்டண சேவையும் இன்றி, தமிழ்நாடு போக்குவரத்துத் துறை
 * விதிகளுக்கு ஏற்ப முன்மாதிரி விதிகளைக் கொண்டு விண்ணப்பத்தை பகுப்பாய்வு செய்கிறது.
 */
export function evaluateApplication(app: Application): AIReviewOutput {
  const missingDocuments: string[] = [];
  const inconsistencies: string[] = [];
  const reasons: string[] = [];
  const nextSteps: string[] = [];

  // 1. ஆவணங்கள் சரிபார்ப்பு (Document Completeness & Verification)
  const hasAadhaarOrAddress = app.documents.some(
    (d) => (d.category === 'identity' || d.category === 'address') && d.status === 'verified'
  );
  if (!hasAadhaarOrAddress) {
    missingDocuments.push('செல்லுபடியாகும் அடையாள/முகவரிச் சான்று (ஆதார் / வாக்காளர் அட்டை)');
    reasons.push('அடையாளம் மற்றும் முகவரிச் சான்று இன்னும் முழுமையாக சரிபார்க்கப்படவில்லை.');
  }

  // விடுபட்ட அல்லது நிராகரிக்கப்பட்ட ஆவணங்கள் கண்டறிதல்
  app.documents.forEach((doc) => {
    if (doc.status === 'missing') {
      missingDocuments.push(`${doc.name} (விடுபட்டுள்ளது)`);
      reasons.push(`கட்டாய ஆவணமான "${doc.name}" சமர்ப்பிக்கப்படவில்லை.`);
    } else if (doc.status === 'rejected') {
      inconsistencies.push(`${doc.name} நிராகரிக்கப்பட்டுள்ளது: ${doc.notes || 'விதிகளுக்கு உட்படவில்லை'}`);
      reasons.push(`சமர்ப்பிக்கப்பட்ட "${doc.name}" தகுதியற்றது என குறிக்கப்பட்டுள்ளது.`);
    } else if (doc.status === 'pending') {
      reasons.push(`"${doc.name}" அலுவலரால் இன்னும் சரிபார்க்கப்படாமல் நிலுவையில் உள்ளது.`);
    }
  });

  // 2. விண்ணப்ப வகை சார்ந்த குறிப்பிட்ட விதிகள் (Application Type Specific Rules)
  if (app.applicationType === 'LL') {
    // LL-ல் 18 வயது நிறைவு (LMV வாகனங்களுக்கு)
    const hasLMV = app.vehicleClass.includes('LMV');
    if (hasLMV && app.age < 18) {
      inconsistencies.push(`விண்ணப்பதாரருக்கு வயது ${app.age} மட்டுமே ஆகிறது. LMV (நான்கு சக்கர வாகனம்) பெற 18 வயது நிறைவடைந்திருக்க வேண்டும்.`);
      reasons.push('மோட்டார் வாகனச் சட்டம் பிரிவு 4-ன் படி குறைந்தபட்ச வயது வரம்பு பூர்த்தி செய்யப்படவில்லை.');
    }
  } else if (app.applicationType === 'DL') {
    // நிரந்தர DL-க்கு LLR கட்டாயம்
    const llrDoc = app.documents.find((d) => d.category === 'existing_licence');
    if (!llrDoc || llrDoc.status !== 'verified') {
      inconsistencies.push('செல்லுபடியாகும் பழகுநர் உரிமம் (LLR) சான்றிதழ் சமர்ப்பிக்கப்படவில்லை அல்லது செல்லுபடியாகவில்லை.');
      reasons.push('நிரந்தர ஓட்டுநர் உரிமம் பெற செல்லுபடியாகும் பழகுநர் உரிமம் (LLR) அத்தியாவசியமாகும்.');
    }

    // ஓட்டுநர் பயிற்சி பள்ளி சான்றிதழ்
    const trainingDoc = app.documents.find((d) => d.category === 'training');
    if (!trainingDoc || trainingDoc.status === 'missing') {
      missingDocuments.push('அங்கீகரிக்கப்பட்ட ஓட்டுநர் பள்ளி படிவம் 5 பயிற்சி சான்றிதழ்');
    }
  } else if (app.applicationType === 'RENEWAL') {
    // 40 வயதுக்கு மேற்பட்டோருக்கு படிவம் 1A மருத்துவ சான்றிதழ் கட்டாயம்
    if (app.age >= 40) {
      const medicalDoc = app.documents.find((d) => d.category === 'medical');
      if (!medicalDoc || medicalDoc.status === 'missing' || medicalDoc.status === 'rejected') {
        missingDocuments.push('படிவம் 1A மருத்துவ தகுதி சான்றிதழ் (40 வயதுக்கு மேற்பட்டோருக்கு கட்டாயம்)');
        reasons.push('விண்ணப்பதாரருக்கு வயது 40-க்கு மேல் உள்ளதால் அரசு பதிவுபெற்ற மருத்துவர் வழங்கிய படிவம் 1A கட்டாயமாகும்.');
      }
    }
  }

  // 3. தகுதிப் பரிசோதனைகள் (Eligibility Checks)
  const failedEligibility = app.eligibilityChecks.filter((c) => !c.passed);
  if (failedEligibility.length > 0) {
    failedEligibility.forEach((chk) => {
      inconsistencies.push(`${chk.label}: ${chk.notes || 'தோல்வி / பூர்த்தி செய்யப்படவில்லை'}`);
      reasons.push(`தகுதி நிபந்தனை "${chk.label}" பூர்த்தி செய்யப்படவில்லை.`);
    });
  }

  // 4. இடர் எச்சரிக்கைகள் (Risk Flags)
  if (app.riskFlags && app.riskFlags.length > 0) {
    app.riskFlags.forEach((flag) => {
      inconsistencies.push(flag);
    });
  }

  // 5. முடிவு பரிந்துரை தீர்மானம் (Decision Suggestion Determination)
  let suggestion: 'approve' | 'return' | 'reject' | 'manual_review' = 'manual_review';
  let suggestionLabel = 'கையேடு ஆய்வு தேவை (Manual Review)';
  let confidenceLevel: 'high' | 'medium' | 'requires_human_attention' = 'medium';

  const hasHardRejection = 
    (app.applicationType === 'LL' && app.vehicleClass.includes('LMV') && app.age < 18) ||
    app.documents.some((d) => d.category === 'medical' && d.status === 'rejected') ||
    failedEligibility.some((c) => c.label.includes('மருத்துவத் தகுதி') || c.label.includes('குறைந்தபட்ச வயது'));

  const hasMissingDocsOrPendingReturns = 
    missingDocuments.length > 0 || 
    app.documents.some((d) => d.status === 'missing' || d.status === 'rejected');

  const allDocsVerified = app.documents.length > 0 && app.documents.every((d) => d.status === 'verified');
  const allEligibilityPassed = app.eligibilityChecks.length > 0 && app.eligibilityChecks.every((c) => c.passed);

  if (hasHardRejection) {
    suggestion = 'reject';
    suggestionLabel = 'நிராகரிக்க பரிந்துரைக்கப்படுகிறது (Recommend Rejection)';
    confidenceLevel = 'high';
    nextSteps.push('விண்ணப்பத்தை நிராகரிப்பதற்கான சட்டப்பூர்வ காரணத்தை பதிவு செய்யவும்.');
    nextSteps.push('விண்ணப்பதாரருக்கு உரிய நிராகரிப்பு அறிவிப்பை அனுப்பவும்.');
  } else if (hasMissingDocsOrPendingReturns) {
    suggestion = 'return';
    suggestionLabel = 'திருத்தத்திற்கு திருப்பி அனுப்ப பரிந்துரைக்கப்படுகிறது (Recommend Return)';
    confidenceLevel = 'high';
    nextSteps.push('விடுபட்ட அல்லது பிழையான ஆவணங்களின் பட்டியலைக் குறிப்பிட்டு விண்ணப்பத்தை திருப்பி அனுப்பவும்.');
    nextSteps.push('விண்ணப்பதாரர் புதிய ஆவணங்களை பதிவேற்ற 15 நாட்கள் கால அவகாசம் வழங்கவும்.');
  } else if (allDocsVerified && allEligibilityPassed && inconsistencies.length === 0) {
    suggestion = 'approve';
    suggestionLabel = 'ஒப்புதல் அளிக்க பரிந்துரைக்கப்படுகிறது (Recommend Approval)';
    confidenceLevel = 'high';
    reasons.push('அனைத்து கட்டாய ஆவணங்களும் சரிபார்க்கப்பட்டு தகுதி அளவுகோல்கள் பூர்த்தி செய்யப்பட்டுள்ளன.');
    nextSteps.push('விண்ணப்பத்திற்கு இறுதி ஒப்புதல் வழங்கி அடுத்த கட்ட ஓட்டுநர் உரிம அச்சிடுதலுக்கு அனுப்பவும்.');
  } else {
    suggestion = 'manual_review';
    suggestionLabel = 'அலுவலரின் நேரடி ஆய்வு தேவை (Manual Officer Review)';
    confidenceLevel = 'requires_human_attention';
    nextSteps.push('சந்தேகத்திற்குரிய ஆவணங்களை அசல் ஆவணங்களுடன் ஒப்பிட்டு சரிபார்க்கவும்.');
    nextSteps.push('தேவைப்படின் விண்ணப்பதாரரை RTO அலுவலகத்திற்கு நேரில் வரவழைத்து விளக்கம் பெறவும்.');
  }

  // 6. சுருக்க உரை (Summary Generator)
  let summary = '';
  if (suggestion === 'approve') {
    summary = 'விண்ணப்பத்தில் அனைத்து ஆவணங்களும் தகுதிகளும் விதிகளின்படி சரியாக உள்ளன. ஒப்புதல் அளிக்க தகுதியானது.';
  } else if (suggestion === 'return') {
    summary = `தேவையான ஆவணங்களில் ${missingDocuments.length} ஆவணம் சமர்ப்பிக்கப்படவில்லை அல்லது திருத்தம் தேவைப்படுகிறது.`;
  } else if (suggestion === 'reject') {
    summary = 'சட்டப்பூர்வ வயது அல்லது மருத்துவ தகுதி நிபந்தனைகள் பூர்த்தி செய்யப்படாததால் நிராகரிக்கப்படத்தக்கது.';
  } else {
    summary = 'சில ஆவணங்கள் அல்லது களப்பரிசோதனை முடிவுகள் அலுவலரின் நேரடி சரிபார்ப்பிற்கு நிலுவையில் உள்ளன.';
  }

  return {
    summary,
    suggestion,
    suggestionLabel,
    missingDocuments,
    inconsistencies,
    reasons,
    nextSteps,
    confidenceLevel,
  };
}

