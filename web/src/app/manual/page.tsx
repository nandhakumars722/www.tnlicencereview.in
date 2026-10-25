'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '../../lib/auth';
import { getDashboardStats } from '../../lib/storage';
import { AuthSession } from '../../lib/types';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import {
  BookOpen,
  LogIn,
  LayoutDashboard,
  Search,
  FileCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function UserManualPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [highPriorityCount, setHighPriorityCount] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const currentSession = getCurrentSession();
    if (!currentSession) {
      router.replace('/login');
      return;
    }
    setSession(currentSession);
    const stats = getDashboardStats();
    setPendingCount(stats.pending);
    setHighPriorityCount(stats.highPriority);
  }, [router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">பயனர் கையேடு ஏற்றப்படுகிறது...</p>
        </div>
      </div>
    );
  }

  const manualSections = [
    {
      id: 'sec-1',
      number: '1',
      title: 'அலுவலர் உள்நுழைவு (Officer Login)',
      icon: LogIn,
      description: 'கணினியில் பாதுகாப்பாக உள்நுழைவதற்கான வழிமுறைகள்.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            மோட்டார் வாகன ஆய்வாளர்கள் (MVI) மற்றும் வட்டாரப் போக்குவரத்து அலுவலர்கள் (ARTO/RTO) தங்களுக்கு வழங்கப்பட்டுள்ள தனித்துவமான பயனர்பெயர் மற்றும் கடவுச்சொல்லைப் பயன்படுத்தி உள்நுழையலாம்.
          </p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block">மாதிரி சோதனை கணக்குகள் (Demo Credentials):</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>சென்னை RTO அலுவலர்:</strong> பயனர் பெயர்: <code className="text-emerald-700 font-mono font-bold">officer_chennai</code> | கடவுச்சொல்: <code className="text-emerald-700 font-mono font-bold">tn_rto_2026</code></li>
              <li><strong>கோவை RTO அலுவலர்:</strong> பயனர் பெயர்: <code className="text-emerald-700 font-mono font-bold">officer_kovai</code> | கடவுச்சொல்: <code className="text-emerald-700 font-mono font-bold">tn_rto_2026</code></li>
              <li><strong>தலைமையக நிர்வாகி:</strong> பயனர் பெயர்: <code className="text-emerald-700 font-mono font-bold">admin</code> | கடவுச்சொல்: <code className="text-emerald-700 font-mono font-bold">admin123</code></li>
            </ul>
          </div>
          <p className="text-slate-500 text-xs">
            குறிப்பு: உள்நுழைந்தவுடன் உலாவி அமர்வில் 2 மணி நேரம் செல்லுபடியாகும் மாதிரி JWT குறியீடு உருவாக்கப்பட்டு அமர்வு பாதுகாக்கப்படும்.
          </p>
        </div>
      ),
    },
    {
      id: 'sec-2',
      number: '2',
      title: 'முகப்புப் பலகை கண்ணோட்டம் (Dashboard Overview)',
      icon: LayoutDashboard,
      description: 'நிலுவை புள்ளிவிவரங்கள், முன்னுரிமை வரிசை மற்றும் விண்ணப்ப நிலை கண்காணிப்பு.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            முகப்புப் பலகையில் நீங்கள் அன்றாட பணியைத் தொடங்குவதற்குத் தேவையான அனைத்து முக்கிய புள்ளிவிவரங்களும் அட்டவணைப்படுத்தப்பட்டு காட்டப்படுகின்றன:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <strong className="text-slate-900">மொத்த விண்ணப்பங்கள்:</strong> கணினியில் பதிவான அனைத்து மாதிரி விண்ணப்பங்களின் கூட்டு எண்ணிக்கை.
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <strong className="text-amber-900">நிலுவையில் உள்ளவை:</strong> இன்னும் அலுவலரால் இறுதி முடிவு எடுக்கப்படாத புதிய விண்ணப்பங்கள்.
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <strong className="text-rose-900">உடனடி கவனம் தேவை:</strong> உயர் முன்னுரிமை கொண்ட அல்லது தரவு முரண்பாடு மற்றும் ஆவண குறைபாடு உள்ளவை.
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <strong className="text-emerald-900">முடிவு எடுக்கப்பட்டவை:</strong> ஒப்புதல் அளிக்கப்பட்ட, நிராகரிக்கப்பட்ட மற்றும் திருப்பி அனுப்பப்பட்ட விண்ணப்பங்கள்.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sec-3',
      number: '3',
      title: 'விண்ணப்பங்களை தேடுதல் மற்றும் வடிகட்டுதல் (Search & Filters)',
      icon: Search,
      description: 'எண், பெயர், விண்ணப்ப வகை, மாவட்டம் மற்றும் முன்னுரிமை கொண்டு கண்டறிதல்.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            நூற்றுக்கணக்கான விண்ணப்பங்களில் குறிப்பிட்ட விண்ணப்பதாரரை கண்டறிய பல அடுக்கு வடிகட்டிகள் வழங்கப்பட்டுள்ளன:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-2">
            <li><strong>விரைவுத் தேடல்:</strong> விண்ணப்ப எண் (எ.கா: <code>TN-2026-LL-10042</code>) அல்லது விண்ணப்பதாரரின் தமிழ்/ஆங்கில பெயரை உள்ளிட்டு உடனுக்குடன் தேடலாம்.</li>
            <li><strong>விண்ணப்ப வகை:</strong> பழகுநர் உரிமம் (LL), நிரந்தர ஓட்டுநர் உரிமம் (DL) அல்லது புதுப்பித்தல் (Renewal) என பிரிக்கலாம்.</li>
            <li><strong>நிலை வடிகட்டி:</strong> நிலுவையில் உள்ளவை, ஆய்வில் உள்ளவை, ஒப்புதல் அளிக்கப்பட்டவை, திருப்பி அனுப்பப்பட்டவை, நிராகரிக்கப்பட்டவை.</li>
            <li><strong>முன்னுரிமை:</strong> உயர் முன்னுரிமை உள்ள விண்ணப்பங்களை மட்டும் தனியாக வரிசைப்படுத்தலாம்.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sec-4',
      number: '4',
      title: 'ஆவணங்களை ஆய்வு செய்தல் (Reviewing Documents)',
      icon: FileCheck,
      description: 'ஆதார் அட்டை, பிறந்த தேதி சான்று, பயிற்சி பள்ளி சான்றிதழ் மற்றும் படிவம் 1A சரிபார்ப்பு.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            விண்ணப்ப விவரங்கள் பக்கத்தில் சமர்ப்பிக்கப்பட்ட ஒவ்வொரு ஆவணத்தின் நிலையும் விரிவாகக் குறிப்பிடப்பட்டிருக்கும்:
          </p>
          <div className="space-y-2">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>சரிபார்க்கப்பட்டது (Verified):</strong> ஆவணம் தெளிவானது மற்றும் அசல் சான்றிதழுடன் ஒத்துப் போகிறது.</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>விடுபட்டுள்ளது (Missing):</strong> கட்டாய ஆவணம் விண்ணப்பதாரரால் பதிவேற்றப்படவில்லை.</span>
            </div>
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>நிராகரிக்கப்பட்டது (Rejected):</strong> ஆவணம் காலாவதியாகிவிட்டது அல்லது விதிகளுக்கு உட்படவில்லை.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sec-5',
      number: '5',
      title: 'AI தானியங்கி வழிகாட்டியை புரிந்து கொள்ளுதல் (AI Assistance Rules)',
      icon: Sparkles,
      description: 'விதிமுறை அடிப்படையிலான தானியங்கி உதவி மற்றும் அலுவலரின் அதிகார வரம்பு.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 font-medium">
            &ldquo;விதிமுறை அடிப்படையிலான தானியங்கி உதவி — இறுதி முடிவு அலுவலருடையது.&rdquo;
          </div>
          <p>
            இந்த அமைப்பு புற AI API அல்லது பிழை வாய்ப்புள்ள LLM மாதிரிகளை சார்ந்திருக்காமல், மோட்டார் வாகன சட்ட விதிகளுக்கு உட்பட்ட 100% நம்பகமான நிரலாக்க விதிகளைக் கொண்டு விண்ணப்பத்தை மதிப்பீடு செய்கிறது:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li><strong>வயது சரிபார்ப்பு:</strong> LMV-க்கு 18 வயது கட்டாயம். குறைந்த வயது இருப்பின் தானாகவே நிராகரிப்பு எச்சரிக்கை வெளியிடும்.</li>
            <li><strong>Renewal 40+ விதி:</strong> 40 வயது அல்லது அதற்கு மேற்பட்டவர்களுக்கு படிவம் 1A மருத்துவ சான்றிதழ் சமர்ப்பிக்கப்பட்டுள்ளதா என சரிபார்க்கும்.</li>
            <li><strong>LLR செல்லுபடி காலம்:</strong> DL விண்ணப்பத்திற்கு LLR 30 நாட்கள் முடிந்திருக்க வேண்டும், ஆனால் 6 மாதத்திற்குள் இருக்க வேண்டும்.</li>
            <li><strong>பரிந்துரை மட்டுமே:</strong> AI அமைப்பு விண்ணப்பத்தை ஒருபோதும் தானாகவே ஒப்புதல் அளிக்கவோ நிராகரிக்கவோ செய்யாது; அது அலுவலருக்கு சுருக்கக் குறிப்பையும் அடுத்த கட்ட நடவடிக்கைகளையும் மட்டுமே பரிந்துரைக்கும்.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sec-6',
      number: '6',
      title: 'விண்ணப்பங்களுக்கு ஒப்புதல் அளித்தல் (Approving Applications)',
      icon: CheckCircle2,
      description: 'அனைத்து நிபந்தனைகளும் பூர்த்தி செய்யப்பட்ட பின் இறுதி ஒப்புதல் வழங்கும் முறை.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            அனைத்து ஆவணங்களும் சரிபார்க்கப்பட்டு, களப் பரிசோதனை மற்றும் விதிமுறைத் தேர்வுகளில் விண்ணப்பதாரர் தேர்ச்சி பெற்றிருந்தால், அலுவலர் ஒப்புதல் அளிக்கலாம்:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-2">
            <li>விண்ணப்ப விவரங்கள் பக்கத்தில் <strong>&ldquo;அலுவலர் முடிவை மாற்றுக&rdquo;</strong> பொத்தானை அழுத்தவும்.</li>
            <li>தோன்றும் உரையாடல் பெட்டியில் <strong>&ldquo;ஒப்புதல் (Approve)&rdquo;</strong> என்பதைத் தேர்ந்தெடுக்கவும்.</li>
            <li>விரும்பினால் அலுவலர் குறிப்புகளை பதிவு செய்து <strong>&ldquo;தொடரவும்&rdquo;</strong> என்பதை அழுத்தவும்.</li>
            <li>இறுதி உறுதிப்படுத்தல் திரையில் சரிபார்த்து <strong>&ldquo;முடிவை உறுதி செய்&rdquo;</strong> என்பதை அழுத்தவும்.</li>
          </ol>
          <p className="text-emerald-700 font-semibold text-xs">
            ✓ ஒப்புதல் அளிக்கப்பட்டவுடன் விண்ணப்பத்தின் நிலை உடனடியாக &ldquo;Approved&rdquo; என மாற்றப்பட்டு முகப்புப்பலகை புள்ளிவிவரங்கள் புதுப்பிக்கப்படும்.
          </p>
        </div>
      ),
    },
    {
      id: 'sec-7',
      number: '7',
      title: 'விண்ணப்பங்களை நிராகரித்தல் (Rejecting Applications)',
      icon: XCircle,
      description: 'சட்டரீதியான குறைபாடுகள் உள்ள விண்ணப்பங்களை காரணத்துடன் நிராகரித்தல்.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            சட்டப்பூர்வ குறைந்தபட்ச வயது பூர்த்தி செய்யப்படாத போதோ அல்லது கண் பார்வை/மருத்துவ உடற்தகுதி குறைபாடுகள் காரணமாக உரிமம் வழங்க இயலாத போதோ நிராகரிக்க வேண்டும்:
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
            <strong>முக்கிய விதி:</strong> விண்ணப்பத்தை நிராகரிக்கும் போது அதற்கான <strong>சட்டப்பூர்வ காரணத்தை குறிப்பிடுவது கட்டாயமாகும்</strong>. காரணம் குறிப்பிடாமல் கணினி நிராகரிப்பை ஏற்காது.
          </div>
          <p className="text-slate-600">
            எடுத்துக்காட்டு நிராகரிப்பு காரணங்கள்: &ldquo;மருத்துவ தகுதிச் சான்றிதழில் பார்வைத்திறன் குறைபாடு குறிப்பிடப்பட்டுள்ளது&rdquo; அல்லது &ldquo;நான்கு சக்கர வாகனத்திற்கு தேவையான 18 வயது பூர்த்தி செய்யப்படவில்லை.&rdquo;
          </p>
        </div>
      ),
    },
    {
      id: 'sec-8',
      number: '8',
      title: 'திருத்தத்திற்கு திருப்பி அனுப்புதல் (Return for Corrections)',
      icon: AlertTriangle,
      description: 'விடுபட்ட ஆவணங்கள் அல்லது மங்கலான சான்றிதழ்களை மீண்டும் சமர்ப்பிக்க கோருதல்.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            முக்கிய ஆவணங்கள் விடுபட்டிருந்தாலோ அல்லது நோட்டரி சான்றொப்பம் இல்லாத முகவரி சான்று சமர்ப்பிக்கப்பட்டிருந்தாலோ விண்ணப்பத்தை நிராகரிக்காமல் திருத்தத்திற்கு திருப்பி அனுப்பலாம்:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
            <li><strong>காரணம் கட்டாயம்:</strong> என்ன ஆவணங்கள் விடுபட்டுள்ளன அல்லது என்ன பிழை உள்ளது என்பதை தெளிவாக குறிப்பிட வேண்டும்.</li>
            <li>விண்ணப்பதாரர் 15 நாட்களுக்குள் புதிய ஆவணத்தை பதிவேற்றம் செய்ய அனுமதிக்கப்படுவார்.</li>
            <li>நிலை &ldquo;திருப்பி அனுப்பப்பட்டது (Returned)&rdquo; என மாறும்.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sec-9',
      number: '9',
      title: 'மறுஆய்வு வரலாற்றுப் பதிவை பார்த்தல் (Decision Audit History)',
      icon: History,
      description: 'ஒவ்வொரு விண்ணப்பத்திலும் எடுக்கப்பட்ட முந்தைய நடவடிக்கைகள் மற்றும் அதிகாரிகளின் பதிவுகள்.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            அரசு நிர்வாகத்தில் பொறுப்புடைமை (Accountability) மற்றும் தணிக்கை (Audit) மிக அவசியமானது. ஒவ்வொரு விண்ணப்பப் பக்கத்தின் வலது புறத்திலும் அதன் முழுமையான வரலாற்றுப் பதிவு காட்டப்படுகிறது:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div>• சமர்ப்பிக்கப்பட்ட தேதி மற்றும் நேரம்</div>
            <div>• ஆய்வு செய்த அலுவலரின் பெயர் மற்றும் பதவி (MVI / ARTO)</div>
            <div>• எடுக்கப்பட்ட நடவடிக்கை (ஒப்புதல், நிராகரிப்பு அல்லது திருப்பி அனுப்புதல்)</div>
            <div>• அலுவலர் பதிவு செய்த உத்தியோகபூர்வ காரணங்கள் மற்றும் உள் குறிப்புகள்</div>
          </div>
        </div>
      ),
    },
    {
      id: 'sec-10',
      number: '10',
      title: 'மாதிரித் தரவை மீட்டமைத்தல் (Resetting Demo Data)',
      icon: RotateCcw,
      description: 'தேர்வு மற்றும் செய்முறை விளக்கத்திற்காக மாதிரி விண்ணப்பங்களை தொடக்க நிலைக்கு கொண்டு வருதல்.',
      content: (
        <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed">
          <p>
            நீங்கள் பல விண்ணப்பங்களுக்கு ஒப்புதல் அல்லது நிராகரிப்பு வழங்கி பரிசோதித்த பிறகு, தொடக்க நிலை 14 மாதிரி விண்ணப்பங்களை மீண்டும் பெற விரும்பினால்:
          </p>
          <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-amber-900 text-xs space-y-1">
            <strong>வழிமுறை:</strong> மேல் மெனுவில் உள்ள <strong>&ldquo;மாதிரித் தரவை மீட்டமை&rdquo;</strong> பொத்தானை அழுத்தவும். உறுதிப்படுத்தல் கேட்கப்படும் போது &ldquo;ஆம், மீட்டமைக்கவும்&rdquo; என்பதை அழுத்தவும்.
          </div>
          <p className="text-slate-500 text-xs">
            உலாவியில் சேமிக்கப்பட்ட மாற்றங்கள் அனைத்தும் அழிக்கப்பட்டு மூல JSON தரவுத்தொகுப்பிலிருந்து தரவுகள் மீண்டும் புதியதாக ஏற்றப்படும்.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar
        session={session}
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex">
        <Sidebar
          pendingCount={pendingCount}
          highPriorityCount={highPriorityCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                அலுவலர் கையேடு
              </span>
              <span className="text-xs text-slate-500">• பயனர் வழிகாட்டி பதிப்பு 2.6</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
              தமிழ்நாடு ஓட்டுநர் உரிம மறுஆய்வு முறைமை — விரிவான பயனர் கையேடு
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              மோட்டார் வாகன ஆய்வாளர்கள் மற்றும் RTO அலுவலர்களுக்கான முழுமையான பணி வழிகாட்டி மற்றும் விதிகள் விளக்கம்.
            </p>
          </div>

          {/* Quick Table of Contents Grid */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>கையேடு தலைப்புகள் (Table of Contents)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {manualSections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-emerald-700 flex items-center gap-2 border border-slate-100 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-[10px] shrink-0">
                    {sec.number}
                  </span>
                  <span className="font-semibold truncate">{sec.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {manualSections.map((sec) => {
              const Icon = sec.icon;
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4 scroll-mt-20"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                          பிரிவு {sec.number}
                        </div>
                        <h2 className="text-base md:text-lg font-bold text-slate-900">
                          {sec.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div>{sec.content}</div>
                </section>
              );
            })}
          </div>

          {/* Bottom CTA to Dashboard */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">பணிப்பலகைக்கு திரும்பத் தயாரா?</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                விண்ணப்பங்களை ஆய்வு செய்து சட்ட விதிகளின்படி விரைவாக தீர்வு காணவும்.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold shadow-sm transition-colors shrink-0"
            >
              <span>முகப்புப் பலகைக்குச் செல்</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

