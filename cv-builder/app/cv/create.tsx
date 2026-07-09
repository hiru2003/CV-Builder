import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

// --- Type Definitions ---
type PersonalInfo = { fullName: string; jobTitle: string; email: string; phone: string; address: string; linkedin: string; github: string; };
type Experience = { id: string; jobTitle: string; company: string; startDate: string; endDate: string; description: string; location: string; current: boolean; };
type Education = { id: string; degree: string; school: string; startDate: string; endDate: string; fieldOfStudy: string; current: boolean; gpa: string; };
type Language = { id: string; name: string; level: string; };
type Certification = { id: string; name: string; issuer: string; date: string; };
type Award = { id: string; title: string; issuer: string; date: string; description: string; };
type SocialLink = { id: string; label: string; url: string; };
type Reference = { id: string; name: string; relationship: string; company: string; email: string; phone: string; };
type CustomSectionItem = { id: string; title: string; subtitle: string; description: string; };

const TABS = ['PERSONAL', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY', 'ADD', 'LAYOUT'] as const;
type TabType = typeof TABS[number];

const ATS_TEMPLATES = ['classic', 'modern', 'timeline', 'compact', 'tech'];

export default function CreateCVScreen() {
  const router = useRouter();
  const { template = 'classic' } = useLocalSearchParams<{ template?: string }>();
  const isAtsTemplate = ATS_TEMPLATES.includes(template);
  
  // --- Mode & Navigation State ---
  const [activeMode, setActiveMode] = useState<'edit' | 'preview'>('edit');
  const [activeTab, setActiveTab] = useState<TabType>('PERSONAL');
  
  // --- Form Data State ---
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: '', jobTitle: '', email: '', phone: '', address: '', linkedin: '', github: '' });
  const [photoInfo, setPhotoInfo] = useState<{ uri: string; base64: string } | null>(null);
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // --- Additional Sections State ---
  const [languages, setLanguages] = useState<Language[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [websites, setWebsites] = useState<SocialLink[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState('');
  const [customSectionTitle, setCustomSectionTitle] = useState('Custom Section');
  const [customSectionItems, setCustomSectionItems] = useState<CustomSectionItem[]>([]);

  // --- Active Section Toggles ---
  const [showLanguages, setShowLanguages] = useState(false);
  const [showCertifications, setShowCertifications] = useState(false);
  const [showAwards, setShowAwards] = useState(false);
  const [showWebsites, setShowWebsites] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [showHobbies, setShowHobbies] = useState(false);
  const [showCustomSection, setShowCustomSection] = useState(false);

  // --- Expanded Accordion Cards in ADD tab ---
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // --- Layout Configuration State ---
  const [accentColor, setAccentColor] = useState('#00A3FF');
  const [customColorText, setCustomColorText] = useState('#00A3FF');
  const [showCustomColorInput, setShowCustomColorInput] = useState(false);
  const [marginSize, setMarginSize] = useState<'compact' | 'normal' | 'loose'>('normal');
  const [typographySize, setTypographySize] = useState<'small' | 'medium' | 'large'>('medium');
  const [documentFont, setDocumentFont] = useState('Inter');

  // --- AI Summary State ---
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatingExperienceId, setGeneratingExperienceId] = useState<string | null>(null);
  const [pendingAIAction, setPendingAIAction] = useState<{ type: 'summary' | 'experience'; expId?: string } | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  // --- Handlers for Photo Picker ---
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need photo library permissions to upload your profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setPhotoInfo({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64 || '',
        });
      }
    } catch (error) {
      console.error("Image pick error", error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // --- Handlers for Experience ---
  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now().toString(), jobTitle: '', company: '', startDate: '', endDate: '', description: '', location: '', current: false }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperiences(experiences.map(exp => {
      if (exp.id === id) {
        const updated = { ...exp, [field]: value };
        if (field === 'current' && value === true) {
          updated.endDate = 'Present';
        }
        return updated;
      }
      return exp;
    }));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  // --- Handlers for Education ---
  const addEducation = () => {
    setEducations([...educations, { id: Date.now().toString(), degree: '', school: '', startDate: '', endDate: '', fieldOfStudy: '', current: false, gpa: '' }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setEducations(educations.map(edu => {
      if (edu.id === id) {
        const updated = { ...edu, [field]: value };
        if (field === 'current' && value === true) {
          updated.endDate = 'Present';
        }
        return updated;
      }
      return edu;
    }));
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  // --- Handlers for Skills ---
  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // --- Handlers for Languages ---
  const addLanguage = () => {
    setLanguages([...languages, { id: Date.now().toString(), name: '', level: '' }]);
  };
  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setLanguages(languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang));
  };
  const removeLanguage = (id: string) => {
    setLanguages(languages.filter(lang => lang.id !== id));
  };

  // --- Handlers for Certifications ---
  const addCertification = () => {
    setCertifications([...certifications, { id: Date.now().toString(), name: '', issuer: '', date: '' }]);
  };
  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert => cert.id === id ? { ...cert, [field]: value } : cert));
  };
  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  // --- Handlers for Awards ---
  const addAward = () => {
    setAwards([...awards, { id: Date.now().toString(), title: '', issuer: '', date: '', description: '' }]);
  };
  const updateAward = (id: string, field: keyof Award, value: string) => {
    setAwards(awards.map(aw => aw.id === id ? { ...aw, [field]: value } : aw));
  };
  const removeAward = (id: string) => {
    setAwards(awards.filter(aw => aw.id !== id));
  };

  // --- Handlers for Websites ---
  const addWebsite = () => {
    setWebsites([...websites, { id: Date.now().toString(), label: '', url: '' }]);
  };
  const updateWebsite = (id: string, field: keyof SocialLink, value: string) => {
    setWebsites(websites.map(web => web.id === id ? { ...web, [field]: value } : web));
  };
  const removeWebsite = (id: string) => {
    setWebsites(websites.filter(web => web.id !== id));
  };

  // --- Handlers for References ---
  const addReference = () => {
    setReferences([...references, { id: Date.now().toString(), name: '', relationship: '', company: '', email: '', phone: '' }]);
  };
  const updateReference = (id: string, field: keyof Reference, value: string) => {
    setReferences(references.map(ref => ref.id === id ? { ...ref, [field]: value } : ref));
  };
  const removeReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
  };

  // --- Handlers for Hobbies ---
  const addHobby = () => {
    if (newHobby.trim()) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby('');
    }
  };
  const removeHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  // --- Handlers for Custom Section ---
  const addCustomSectionItem = () => {
    setCustomSectionItems([...customSectionItems, { id: Date.now().toString(), title: '', subtitle: '', description: '' }]);
  };
  const updateCustomSectionItem = (id: string, field: keyof CustomSectionItem, value: string) => {
    setCustomSectionItems(customSectionItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const removeCustomSectionItem = (id: string) => {
    setCustomSectionItems(customSectionItems.filter(item => item.id !== id));
  };

  // --- AI Summary Generator Handler ---
  const generateSummaryWithAI = async (providedKey?: string) => {
    const apiKey = providedKey || customApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      setPendingAIAction({ type: 'summary' });
      setShowApiKeyModal(true);
      return;
    }

    try {
      setIsGeneratingSummary(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const jobTitlePrompt = personalInfo.jobTitle ? `- Job Title: ${personalInfo.jobTitle}` : '';
      const skillsPrompt = skills.length > 0 ? `- Skills: ${skills.join(', ')}` : '';
      const expPrompt = experiences.length > 0 
        ? `- Experience: ${experiences.map(exp => `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}): ${exp.description}`).join('; ')}`
        : '';
      const eduPrompt = educations.length > 0
        ? `- Education: ${educations.map(edu => `${edu.degree} from ${edu.school}`).join('; ')}`
        : '';

      const prompt = `You are a professional resume writer. Write a compelling, high-impact, and professional profile summary for a resume/CV. 
It must be 3 to 4 sentences long (about 50-70 words). 
Focus on matching the experiences, skills, and education details below to write a tailored summary.

Candidate Details:
${jobTitlePrompt}
${skillsPrompt}
${expPrompt}
${eduPrompt}

Writing Rules:
1. Write in a professional third-person perspective (or first-person implied: no "I" or "my" or "we").
2. Focus on key strengths, achievements, and career value.
3. Return ONLY the plain text summary.
4. Do NOT include markdown styling, bold text, introductory remarks (e.g. "Here is your summary:"), or quotes.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No summary text was returned from the API.');
      }

      const cleanedText = generatedText.replace(/\*\*/g, '').replace(/"/g, '').trim();
      setSummary(cleanedText);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      Alert.alert(
        'Generation Failed',
        'Could not generate summary. Please check your network connection and verify your Gemini API key is active and correct.'
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const generateExperienceWithAI = async (expId: string, providedKey?: string) => {
    const apiKey = providedKey || customApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      setPendingAIAction({ type: 'experience', expId });
      setShowApiKeyModal(true);
      return;
    }

    const exp = experiences.find(e => e.id === expId);
    if (!exp || !exp.jobTitle.trim()) {
      Alert.alert('Job Title Required', 'Please enter a Position/Job Title for this experience before generating details.');
      return;
    }

    try {
      setGeneratingExperienceId(expId);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const jobTitlePrompt = `Job Title: ${exp.jobTitle}`;
      const companyPrompt = exp.company ? `Company: ${exp.company}` : '';
      const locationPrompt = exp.location ? `Location: ${exp.location}` : '';

      const prompt = `You are a professional resume writer. Write 3-4 high-impact, professional resume accomplishment statements (bullet points) for the following job role:
${jobTitlePrompt}
${companyPrompt}
${locationPrompt}

Writing Rules:
1. Each statement must start with a strong action verb (e.g., Developed, Led, Managed, Optimized, Created, Designed).
2. Highlight professional achievements, responsibilities, and key skills relevant to this role.
3. Keep each statement concise and results-oriented.
4. Return ONLY the statements separated by a comma and a space. Do NOT use bullet points (such as "-", "•", "*"), numbers, newlines, markdown formatting, or bold text. 
5. Do NOT include introductory or concluding remarks. Just return the comma-separated statements as a single paragraph.

Example output:
Led a team of 4 engineers to design a scalable microservices architecture, Optimized SQL queries to improve database performance by 35%, Collaborated with product owners to deliver key product features ahead of schedule`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No text was returned from the API.');
      }

      const cleanedText = generatedText.replace(/\*\*/g, '').replace(/"/g, '').trim();
      
      updateExperience(expId, 'description', cleanedText);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Gemini API Error (Experience):', error);
      Alert.alert(
        'Generation Failed',
        'Could not generate experience details. Please check your network connection and verify your Gemini API key.'
      );
    } finally {
      setGeneratingExperienceId(null);
    }
  };

  // --- HTML Template Generation (Supports 10 Visually Distinct Formats) ---
  const generateHTML = () => {
    // --- Layout and Styling Configuration Helpers ---
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const margins = marginSize === 'compact' ? '0.4in' : (marginSize === 'loose' ? '0.8in' : '0.6in');
    const baseSize = typographySize === 'small' ? 11.5 : (typographySize === 'large' ? 14.5 : 13);
    const sizeFactor = baseSize / 13;
    const fontStack = documentFont === 'Playfair' ? "'Playfair Display', serif" :
                      documentFont === 'Merriweather' ? "'Merriweather', serif" :
                      documentFont === 'Lora' ? "'Lora', serif" :
                      documentFont === 'Times' ? "'Times New Roman', Times, serif" :
                      documentFont === 'Fira Code' ? "'Fira Code', monospace" :
                      documentFont === 'Outfit' ? "'Outfit', sans-serif" :
                      documentFont === 'Montserrat' ? "'Montserrat', sans-serif" :
                      documentFont === 'Roboto' ? "'Roboto', sans-serif" :
                      "'Inter', sans-serif";

    const googleFontsLink = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fira+Code:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    `;

    // --- Global Custom Styles Overrides ---
    const globalStylesOverride = `
      ${googleFontsLink}
      <style>
        * {
          font-family: ${fontStack} !important;
        }
        body {
          margin: ${margins} !important;
          font-size: ${baseSize}px !important;
          line-height: 1.5;
        }
        .name {
          font-size: ${28 * sizeFactor}px !important;
          color: ${accentColor} !important;
        }
        .title {
          color: ${accentColor} !important;
          font-size: ${14 * sizeFactor}px !important;
        }
        .section-title {
          color: ${accentColor} !important;
          border-bottom-color: ${hexToRgba(accentColor, 0.2)} !important;
          font-size: ${13 * sizeFactor}px !important;
        }
        .skill-tag {
          background-color: ${hexToRgba(accentColor, 0.08)} !important;
          color: ${accentColor} !important;
          border-color: ${hexToRgba(accentColor, 0.2)} !important;
        }
        /* Layout overrides */
        .exec-header {
          background: linear-gradient(135deg, ${accentColor}, ${hexToRgba(accentColor, 0.85)}) !important;
          border-bottom-color: ${accentColor} !important;
        }
        .timeline-container {
          border-left-color: ${accentColor} !important;
        }
        .section-title::before {
          background-color: ${accentColor} !important;
        }
        .sidebar-title {
          border-bottom-color: ${accentColor} !important;
          color: ${accentColor} !important;
        }
        .item-sub {
          color: ${accentColor} !important;
        }
        a {
          color: ${accentColor} !important;
        }
        .item-title {
          font-size: ${13 * sizeFactor}px !important;
        }
        .item-date {
          font-size: ${11 * sizeFactor}px !important;
        }
        .item-desc {
          font-size: ${11 * sizeFactor}px !important;
        }
        .summary-text {
          font-size: ${12 * sizeFactor}px !important;
        }
      </style>
    `;

    // --- Additional Sections HTML Builders ---
    const renderLanguagesHTML = (isSidebar = false) => {
      if (!showLanguages || languages.length === 0) return '';
      if (isSidebar) {
        return `
          <div class="sidebar-title" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; color: ${accentColor};">Languages</div>
          <div style="margin-top: 8px;">
            ${languages.map(l => `
              <div style="margin-bottom: 6px; font-size: 11px; color: #d1d5db;">
                <span style="font-weight: bold; color: white;">${l.name || 'Language'}</span>
                ${l.level ? `<br/><span style="color: #9ca3af; font-size: 10px;">${l.level}</span>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
      return `
        <div class="section">
          <div class="section-title">Languages</div>
          <div class="skills-container" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${languages.map(l => `
              <span class="skill-tag" style="background-color: ${hexToRgba(accentColor, 0.08)}; color: ${accentColor}; padding: 3px 8px; border: 1px solid ${hexToRgba(accentColor, 0.2)}; border-radius: 8px; font-size: 10.5px; display: inline-block; margin: 2px;">
                <strong>${l.name || 'Language'}</strong>${l.level ? `: ${l.level}` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderCertificationsHTML = (isSidebar = false) => {
      if (!showCertifications || certifications.length === 0) return '';
      if (isSidebar) {
        return `
          <div class="sidebar-title" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; color: ${accentColor};">Certifications</div>
          <div style="margin-top: 8px;">
            ${certifications.map(c => `
              <div style="margin-bottom: 8px; font-size: 10.5px; color: #d1d5db;">
                <span style="font-weight: bold; color: white;">${c.name || 'Certificate'}</span>
                ${c.issuer ? `<br/><span style="color: #9ca3af; font-style: italic;">${c.issuer}</span>` : ''}
                ${c.date ? ` • <span style="color: #9ca3af;">${c.date}</span>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
      return `
        <div class="section">
          <div class="section-title">Certifications & Licenses</div>
          ${certifications.map(c => `
            <div class="item" style="margin-bottom: 10px;">
              <div class="item-header" style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${12.5 * sizeFactor}px; color: #111827;">
                <span class="item-title">${c.name || 'Certificate'}</span>
                <span class="item-date" style="font-size: ${11 * sizeFactor}px; color: #6b7280; font-weight: normal;">${c.date || ''}</span>
              </div>
              ${c.issuer ? `<div class="item-sub" style="font-size: ${11.5 * sizeFactor}px; font-style: italic; color: #4b5563; margin-top: 2px;">${c.issuer}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderAwardsHTML = () => {
      if (!showAwards || awards.length === 0) return '';
      return `
        <div class="section">
          <div class="section-title">Awards & Honors</div>
          ${awards.map(a => `
            <div class="item" style="margin-bottom: 10px;">
              <div class="item-header" style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${12.5 * sizeFactor}px; color: #111827;">
                <span class="item-title">${a.title || 'Award'}</span>
                <span class="item-date" style="font-size: ${11 * sizeFactor}px; color: #6b7280; font-weight: normal;">${a.date || ''}</span>
              </div>
              <div class="item-sub" style="font-size: ${11.5 * sizeFactor}px; font-style: italic; color: ${accentColor}; margin-top: 2px;">${a.issuer || ''}</div>
              ${a.description ? `<div class="item-desc" style="font-size: ${11 * sizeFactor}px; color: #4b5563; margin-top: 3px;">${a.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderWebsitesHTML = (isSidebar = false) => {
      if (!showWebsites || websites.length === 0) return '';
      if (isSidebar) {
        return `
          <div class="sidebar-title" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; color: ${accentColor};">Links</div>
          <div style="margin-top: 8px;">
            ${websites.map(w => `
              <div style="margin-bottom: 6px; font-size: 11px; color: #d1d5db; word-wrap: break-word;">
                <span style="font-weight: bold; color: white;">${w.label || 'Link'}</span><br/>
                <a href="${w.url.startsWith('http') ? w.url : 'https://' + w.url}" style="color: ${accentColor}; text-decoration: none;">${w.url}</a>
              </div>
            `).join('')}
          </div>
        `;
      }
      return `
        <div class="section">
          <div class="section-title">Websites & Links</div>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            ${websites.map(w => `
              <div style="font-size: ${11.5 * sizeFactor}px;">
                <strong style="color: #111827;">${w.label || 'Link'}:</strong>
                <a href="${w.url.startsWith('http') ? w.url : 'https://' + w.url}" style="color: ${accentColor}; text-decoration: none; margin-left: 4px;">${w.url}</a>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderReferencesHTML = () => {
      if (!showReferences || references.length === 0) return '';
      return `
        <div class="section">
          <div class="section-title">References</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            ${references.map(r => `
              <div style="font-size: ${11.5 * sizeFactor}px; color: #4b5563; margin-bottom: 8px;">
                <strong style="font-size: ${12 * sizeFactor}px; color: #111827; display: block; margin-bottom: 2px;">${r.name || 'Reference'}</strong>
                ${r.relationship ? `<span>${r.relationship}</span>` : ''}
                ${r.company ? ` • <span>${r.company}</span>` : ''}
                ${r.email ? `<br/><span style="font-size: ${10.5 * sizeFactor}px; color: #6b7280;">Email: ${r.email}</span>` : ''}
                ${r.phone ? `<br/><span style="font-size: ${10.5 * sizeFactor}px; color: #6b7280;">Phone: ${r.phone}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderHobbiesHTML = (isSidebar = false) => {
      if (!showHobbies || hobbies.length === 0) return '';
      if (isSidebar) {
        return `
          <div class="sidebar-title" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; color: ${accentColor};">Hobbies & Interests</div>
          <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px;">
            ${hobbies.map(h => `
              <span style="background-color: rgba(255,255,255,0.1); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; display: inline-block; margin: 1px;">${h}</span>
            `).join('')}
          </div>
        `;
      }
      return `
        <div class="section">
          <div class="section-title">Hobbies & Interests</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${hobbies.map(h => `
              <span class="skill-tag" style="background-color: ${hexToRgba(accentColor, 0.08)}; color: ${accentColor}; padding: 3px 8px; border: 1px solid ${hexToRgba(accentColor, 0.2)}; border-radius: 8px; font-size: 10.5px; display: inline-block; margin: 2px;">
                <strong>${h}</strong>
              </span>
            `).join('')}
          </div>
        </div>
      `;
    };

    const renderCustomSectionHTML = (isSidebar = false) => {
      if (!showCustomSection || customSectionItems.length === 0) return '';
      if (isSidebar) {
        return `
          <div class="sidebar-title" style="font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${accentColor}; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; color: ${accentColor};">${customSectionTitle}</div>
          <div style="margin-top: 8px;">
            ${customSectionItems.map(item => `
              <div style="margin-bottom: 8px; font-size: 10.5px; color: #d1d5db;">
                <span style="font-weight: bold; color: white;">${item.title || 'Item Title'}</span>
                ${item.subtitle ? `<br/><span style="color: #9ca3af; font-size: 9.5px;">${item.subtitle}</span>` : ''}
                ${item.description ? `<br/><span style="color: #d1d5db; font-size: 9.5px;">${item.description}</span>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
      return `
        <div class="section">
          <div class="section-title">${customSectionTitle}</div>
          ${customSectionItems.map(item => `
            <div class="item" style="margin-bottom: 10px;">
              <div class="item-header" style="display: flex; justify-content: space-between; font-weight: bold; font-size: ${12.5 * sizeFactor}px; color: #111827;">
                <span class="item-title">${item.title || 'Item Title'}</span>
                <span class="item-date" style="font-size: ${11 * sizeFactor}px; color: #6b7280; font-weight: normal;">${item.subtitle || ''}</span>
              </div>
              ${item.description ? `<div class="item-desc" style="font-size: ${11 * sizeFactor}px; color: #4b5563; margin-top: 3px;">${item.description.replace(/\n/g, '<br/>')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    };

    const experiencesHTML = experiences.map(exp => `
      <div class="item">
        <div class="item-header">
          <span class="item-title">${exp.jobTitle || 'Job Title'}</span>
          <span class="item-date">${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}</span>
        </div>
        <div class="item-sub">
          ${exp.company || 'Company'} ${exp.location ? `• ${exp.location}` : ''}
        </div>
        <div class="item-desc">${exp.description ? exp.description.replace(/\n/g, '<br/>') : ''}</div>
      </div>
    `).join('');

    const educationsHTML = educations.map(edu => `
      <div class="item">
        <div class="item-header">
          <span class="item-title">${edu.degree || 'Degree'} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</span>
          <span class="item-date">${edu.startDate || ''} - ${edu.current ? 'Present' : (edu.endDate || '')}</span>
        </div>
        <div class="item-sub">
          ${edu.school || 'School'} ${edu.gpa ? `• GPA: ${edu.gpa}` : ''}
        </div>
      </div>
    `).join('');

    const skillsHTML = skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');

    const photoHTML = (!isAtsTemplate && photoInfo) 
      ? `<div class="photo-container"><img class="profile-photo" src="data:image/jpeg;base64,${photoInfo.base64}" /></div>`
      : '';

    // --- HTML Structure Builder based on selected Template ID ---
    
    // 1. CLASSIC CORPORATE (ATS)
    if (template === 'classic') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 40px; line-height: 1.5; font-size: 13px; }
            .header { text-align: center; margin-bottom: 25px; }
            .name { font-size: 26px; font-weight: bold; margin-bottom: 4px; color: #1e3a8a; }
            .title { font-size: 15px; font-weight: 600; color: #4b5563; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.2px; }
            .contact { font-size: 11px; color: #6b7280; display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
            .section { margin-bottom: 22px; }
            .section-title { font-size: 13px; font-weight: bold; color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; }
            .summary-text { font-size: 11.5px; color: #4b5563; text-align: justify; }
            .item { margin-bottom: 12px; }
            .item-header { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: bold; color: #111827; }
            .item-date { font-size: 11px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11.5px; font-style: italic; color: #4b5563; margin-bottom: 4px; }
            .item-desc { font-size: 11px; color: #4b5563; text-align: justify; }
            .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background-color: #eff6ff; color: #1e40af; padding: 3px 8px; border: 1px solid #dbeafe; border-radius: 8px; font-size: 10.5px; display: inline-block; margin: 2px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="header">
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            <div class="contact">
              ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span>•</span><span>${personalInfo.phone}</span>` : ''}
              ${personalInfo.address ? `<span>•</span><span>${personalInfo.address}</span>` : ''}
              ${personalInfo.linkedin ? `<span>•</span><span>${personalInfo.linkedin}</span>` : ''}
              ${personalInfo.github ? `<span>•</span><span>${personalInfo.github}</span>` : ''}
            </div>
          </div>
          ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary-text">${summary}</div></div>` : ''}
          ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiencesHTML}</div>` : ''}
          ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
          ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
          ${renderLanguagesHTML(false)}
          ${renderCertificationsHTML(false)}
          ${renderAwardsHTML()}
          ${renderWebsitesHTML(false)}
          ${renderReferencesHTML()}
          ${renderHobbiesHTML(false)}
          ${renderCustomSectionHTML(false)}
        </body>
        </html>
      `;
    }

    // 2. MODERN MINIMALIST (ATS)
    if (template === 'modern') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Georgia, serif; color: #1f2937; margin: 45px; line-height: 1.6; font-size: 13.5px; }
            .header { text-align: center; margin-bottom: 30px; }
            .name { font-size: 28px; font-weight: normal; margin-bottom: 6px; color: #111827; }
            .title { font-size: 13px; color: #6b7280; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 2px; }
            .contact { font-size: 11px; color: #4b5563; display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 6px 0; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 12px; font-weight: bold; color: #111827; padding-bottom: 3px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 2px; text-align: center; }
            .section-title::after { content: ''; display: block; width: 30px; height: 1px; background-color: #374151; margin: 4px auto 0 auto; }
            .summary-text { font-size: 12px; color: #4b5563; text-align: center; }
            .item { margin-bottom: 14px; }
            .item-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #111827; }
            .item-date { font-size: 11.5px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 12px; font-style: italic; color: #4b5563; margin-bottom: 4px; }
            .item-desc { font-size: 11.5px; color: #4b5563; }
            .skills-container { text-align: center; }
            .skill-tag { border: 1px solid #e5e7eb; padding: 3px 8px; border-radius: 4px; font-size: 11px; display: inline-block; margin: 3px; color: #374151; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="header">
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            <div class="contact">
              ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span>${personalInfo.phone}</span>` : ''}
              ${personalInfo.address ? `<span>${personalInfo.address}</span>` : ''}
              ${personalInfo.linkedin ? `<span>${personalInfo.linkedin}</span>` : ''}
              ${personalInfo.github ? `<span>${personalInfo.github}</span>` : ''}
            </div>
          </div>
          ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary-text">${summary}</div></div>` : ''}
          ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiencesHTML}</div>` : ''}
          ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
          ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
          ${renderLanguagesHTML(false)}
          ${renderCertificationsHTML(false)}
          ${renderAwardsHTML()}
          ${renderWebsitesHTML(false)}
          ${renderReferencesHTML()}
          ${renderHobbiesHTML(false)}
          ${renderCustomSectionHTML(false)}
        </body>
        </html>
      `;
    }

    // 3. CREATIVE SIDEBAR (Non-ATS)
    if (template === 'creative') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; font-size: 12px; }
            .wrapper { display: table; width: 100%; min-height: 100vh; }
            .sidebar { display: table-cell; width: 32%; background-color: #f3f4f6; padding: 30px 20px; vertical-align: top; border-right: 1px solid #e5e7eb; }
            .main-content { display: table-cell; width: 68%; padding: 30px 25px; vertical-align: top; }
            .profile-photo { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #d97706; margin-bottom: 20px; object-cover: cover; }
            .name { font-size: 22px; font-weight: 800; color: #111827; line-height: 1.2; margin-bottom: 6px; }
            .title { font-size: 12px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; }
            .sidebar-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #111827; border-bottom: 2px solid #d97706; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; }
            .contact-item { margin-bottom: 10px; font-size: 11px; color: #4b5563; word-wrap: break-word; }
            .contact-label { font-weight: bold; color: #111827; display: block; margin-bottom: 2px; }
            .section { margin-bottom: 22px; }
            .section-title { font-size: 13px; font-weight: bold; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 14px; text-transform: uppercase; }
            .summary-text { font-size: 11.5px; color: #4b5563; text-align: justify; line-height: 1.5; }
            .item { margin-bottom: 14px; }
            .item-header { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: bold; color: #111827; }
            .item-date { font-size: 10.5px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11.5px; font-style: italic; color: #d97706; margin-bottom: 4px; }
            .skill-tag { background-color: #111827; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 10px; display: inline-block; margin: 3px 2px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="wrapper">
            <div class="sidebar">
              ${photoHTML}
              <div class="name">${personalInfo.fullName || 'Your Name'}</div>
              <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
              <div class="sidebar-title">Contact</div>
              ${personalInfo.email ? `<div class="contact-item"><span class="contact-label">Email</span>${personalInfo.email}</div>` : ''}
              ${personalInfo.phone ? `<div class="contact-item"><span class="contact-label">Phone</span>${personalInfo.phone}</div>` : ''}
              ${personalInfo.address ? `<div class="contact-item"><span class="contact-label">Address</span>${personalInfo.address}</div>` : ''}
              ${personalInfo.linkedin ? `<div class="contact-item"><span class="contact-label">LinkedIn</span>${personalInfo.linkedin}</div>` : ''}
              ${personalInfo.github ? `<div class="contact-item"><span class="contact-label">GitHub</span>${personalInfo.github}</div>` : ''}
              ${skills.length > 0 ? `<div class="sidebar-title">Skills</div><div style="margin-top: 8px;">${skillsHTML}</div>` : ''}
              ${renderLanguagesHTML(true)}
              ${renderWebsitesHTML(true)}
              ${renderHobbiesHTML(true)}
            </div>
            <div class="main-content">
              ${summary ? `<div class="section"><div class="section-title">Profile Summary</div><div class="summary-text">${summary}</div></div>` : ''}
              ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiencesHTML}</div>` : ''}
              ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
              ${renderCertificationsHTML(false)}
              ${renderAwardsHTML()}
              ${renderReferencesHTML()}
              ${renderCustomSectionHTML(false)}
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 4. ELEGANT BANNER (Non-ATS)
    if (template === 'banner') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; font-size: 12.5px; }
            .banner-header { background-color: #1f2937; color: white; padding: 30px; display: flex; align-items: center; gap: 24px; }
            .profile-photo { width: 90px; height: 90px; border-radius: 50%; border: 3px solid white; object-fit: cover; }
            .banner-info { flex-grow: 1; }
            .name { font-size: 30px; font-weight: bold; margin-bottom: 4px; color: white; }
            .title { font-size: 14px; font-weight: 600; color: #00aaff; text-transform: uppercase; letter-spacing: 1.5px; }
            .banner-contact { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #d1d5db; margin-top: 8px; border-top: 1px solid #374151; padding-top: 8px; }
            .body-container { padding: 30px 40px; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 13px; font-weight: bold; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase; }
            .summary-text { font-size: 12px; color: #4b5563; text-align: justify; }
            .item { margin-bottom: 14px; }
            .item-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #111827; }
            .item-date { font-size: 11px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11.5px; font-style: italic; color: #4b5563; margin-bottom: 4px; }
            .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background-color: #f3f4f6; color: #1f2937; padding: 4px 10px; border-radius: 8px; font-size: 11px; border: 1px solid #e5e7eb; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="banner-header">
            ${photoHTML}
            <div class="banner-info">
              <div class="name">${personalInfo.fullName || 'Your Name'}</div>
              <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
              <div class="banner-contact">
                ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span>• ${personalInfo.phone}</span>` : ''}
                ${personalInfo.address ? `<span>• ${personalInfo.address}</span>` : ''}
                ${personalInfo.linkedin ? `<span>• ${personalInfo.linkedin}</span>` : ''}
                ${personalInfo.github ? `<span>• ${personalInfo.github}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="body-container">
            ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><div class="summary-text">${summary}</div></div>` : ''}
            ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiencesHTML}</div>` : ''}
            ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
            ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
            ${renderLanguagesHTML(false)}
            ${renderCertificationsHTML(false)}
            ${renderAwardsHTML()}
            ${renderWebsitesHTML(false)}
            ${renderReferencesHTML()}
            ${renderHobbiesHTML(false)}
            ${renderCustomSectionHTML(false)}
          </div>
        </body>
        </html>
      `;
    }

    // 5. MODERN TIMELINE (ATS)
    if (template === 'timeline') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 40px 60px; line-height: 1.5; font-size: 13px; }
            .header { text-align: left; margin-bottom: 25px; }
            .name { font-size: 32px; font-weight: 900; margin-bottom: 4px; color: #111827; }
            .title { font-size: 14px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 1.5px; }
            .contact { font-size: 11.5px; color: #4b5563; display: flex; gap: 14px; margin-top: 8px; }
            .timeline-container { border-left: 2px solid #10b981; padding-left: 24px; position: relative; margin-top: 20px; }
            .section { margin-bottom: 24px; position: relative; }
            .section-title { font-size: 12px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; position: relative; }
            .section-title::before { content: ''; position: absolute; left: -31px; top: 3px; width: 10px; height: 10px; border-radius: 50%; background-color: #10b981; border: 2px solid white; }
            .summary-text { font-size: 12px; color: #4b5563; }
            .item { margin-bottom: 14px; }
            .item-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; color: #111827; }
            .item-date { font-size: 11px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11.5px; font-style: italic; color: #10b981; margin-bottom: 4px; }
            .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px; font-size: 10.5px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="header">
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            <div class="contact">
              ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span>• ${personalInfo.phone}</span>` : ''}
              ${personalInfo.address ? `<span>• ${personalInfo.address}</span>` : ''}
              ${personalInfo.linkedin ? `<span>• ${personalInfo.linkedin}</span>` : ''}
              ${personalInfo.github ? `<span>• ${personalInfo.github}</span>` : ''}
            </div>
          </div>
          <div class="timeline-container">
            ${summary ? `<div class="section"><div class="section-title">Summary</div><div class="summary-text">${summary}</div></div>` : ''}
            ${experiences.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experiencesHTML}</div>` : ''}
            ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
            ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
            ${renderLanguagesHTML(false)}
            ${renderCertificationsHTML(false)}
            ${renderAwardsHTML()}
            ${renderWebsitesHTML(false)}
            ${renderReferencesHTML()}
            ${renderHobbiesHTML(false)}
            ${renderCustomSectionHTML(false)}
          </div>
        </body>
        </html>
      `;
    }

    // 6. EXECUTIVE PREMIUM (Non-ATS)
    if (template === 'executive') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Georgia', serif; color: #1f2937; margin: 0; padding: 0; font-size: 12.5px; }
            .exec-header { background: linear-gradient(135deg, #1e1b4b, #311042); color: white; padding: 35px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 5px solid #d97706; }
            .exec-info { flex-grow: 1; }
            .name { font-size: 32px; font-weight: 800; color: white; }
            .title { font-size: 14px; font-weight: bold; color: #d97706; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
            .profile-photo { width: 90px; height: 90px; border-radius: 12px; border: 3px solid #d97706; object-fit: cover; }
            .exec-contact { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #e2e8f0; margin-top: 10px; }
            .body-grid { padding: 35px 40px; display: table; width: 100%; }
            .main-col { display: table-cell; width: 68%; padding-right: 25px; vertical-align: top; }
            .side-col { display: table-cell; width: 32%; padding-left: 20px; border-left: 1px solid #e2e8f0; vertical-align: top; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 13px; font-weight: bold; color: #1e1b4b; border-bottom: 1.5px solid #d97706; padding-bottom: 4px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .summary-text { font-size: 12px; color: #4b5563; text-align: justify; line-height: 1.6; }
            .item { margin-bottom: 14px; }
            .item-header { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: bold; color: #111827; }
            .item-date { font-size: 11px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11.5px; font-style: italic; color: #d97706; margin-bottom: 4px; }
            .skill-tag { background-color: #1e1b4b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; display: inline-block; margin: 3px 2px; font-family: sans-serif; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="exec-header">
            <div class="exec-info">
              <div class="name">${personalInfo.fullName || 'Your Name'}</div>
              <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
              <div class="exec-contact">
                ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span>• ${personalInfo.phone}</span>` : ''}
                ${personalInfo.address ? `<span>• ${personalInfo.address}</span>` : ''}
                ${personalInfo.linkedin ? `<span>• ${personalInfo.linkedin}</span>` : ''}
                ${personalInfo.github ? `<span>• ${personalInfo.github}</span>` : ''}
              </div>
            </div>
            ${photoHTML}
          </div>
          <div class="body-grid">
            <div class="main-col">
              ${summary ? `<div class="section"><div class="section-title">Executive Summary</div><div class="summary-text">${summary}</div></div>` : ''}
              ${experiences.length > 0 ? `<div class="section"><div class="section-title">Professional Experience</div>${experiencesHTML}</div>` : ''}
              ${renderAwardsHTML()}
              ${renderReferencesHTML()}
              ${renderCustomSectionHTML(false)}
            </div>
            <div class="side-col">
              ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
              ${skills.length > 0 ? `<div class="section"><div class="section-title">Core Skills</div><div style="margin-top: 8px;">${skillsHTML}</div></div>` : ''}
              ${renderLanguagesHTML(true)}
              ${renderWebsitesHTML(true)}
              ${renderCertificationsHTML(true)}
              ${renderHobbiesHTML(true)}
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 7. CLEAN COMPACT (ATS)
    if (template === 'compact') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2d3748; margin: 25px 30px; line-height: 1.4; font-size: 11.5px; }
            .header { text-align: justify; display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 8px; margin-bottom: 15px; }
            .name { font-size: 22px; font-weight: bold; color: #0d9488; }
            .title { font-size: 12px; font-weight: bold; color: #4a5568; margin-top: 2px; }
            .contact { text-align: right; font-size: 10px; color: #718096; line-height: 1.4; }
            .section { margin-bottom: 15px; }
            .section-title { font-size: 11px; font-weight: bold; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
            .summary-text { color: #4a5568; text-align: justify; }
            .item { margin-bottom: 10px; }
            .item-header { display: flex; justify-content: space-between; font-size: 11.5px; font-weight: bold; color: #1a202c; }
            .item-date { font-size: 10px; color: #718096; font-weight: normal; }
            .item-sub { font-size: 11px; font-style: italic; color: #4a5568; margin-bottom: 2px; }
            .skills-container { display: flex; flex-wrap: wrap; gap: 4px; }
            .skill-tag { background-color: #f0fdf4; color: #115e59; padding: 2px 6px; border: 1px solid #ccfbf1; border-radius: 4px; font-size: 9.5px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="header">
            <div>
              <div class="name">${personalInfo.fullName || 'Your Name'}</div>
              <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            </div>
            <div class="contact">
              ${personalInfo.email ? `<div>${personalInfo.email}</div>` : ''}
              ${personalInfo.phone ? `<div>${personalInfo.phone}</div>` : ''}
              ${personalInfo.address ? `<div>${personalInfo.address}</div>` : ''}
              ${personalInfo.linkedin ? `<div>${personalInfo.linkedin}</div>` : ''}
              ${personalInfo.github ? `<div>${personalInfo.github}</div>` : ''}
            </div>
          </div>
          ${summary ? `<div class="section"><div class="section-title">Summary</div><div class="summary-text">${summary}</div></div>` : ''}
          ${experiences.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experiencesHTML}</div>` : ''}
          ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
          ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
          ${renderLanguagesHTML(false)}
          ${renderCertificationsHTML(false)}
          ${renderAwardsHTML()}
          ${renderWebsitesHTML(false)}
          ${renderReferencesHTML()}
          ${renderHobbiesHTML(false)}
          ${renderCustomSectionHTML(false)}
        </body>
        </html>
      `;
    }

    // 8. VIBRANT CRIMSON (Non-ATS)
    if (template === 'vibrant') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 40px; line-height: 1.5; font-size: 13px; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 4px double #dc2626; padding-bottom: 20px; }
            .profile-photo { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #dc2626; margin-bottom: 12px; object-fit: cover; }
            .name { font-size: 28px; font-weight: bold; color: #dc2626; margin-bottom: 4px; }
            .title { font-size: 14px; font-weight: bold; color: #4b5563; text-transform: uppercase; letter-spacing: 1.2px; }
            .contact { font-size: 11px; color: #6b7280; display: flex; justify-content: center; gap: 12px; margin-top: 8px; }
            .section { margin-bottom: 22px; }
            .section-title { font-size: 13px; font-weight: bold; color: white; background-color: #dc2626; padding: 4px 10px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-radius: 4px; }
            .summary-text { font-size: 11.5px; color: #4b5563; }
            .item { margin-bottom: 12px; }
            .item-header { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: bold; color: #111827; }
            .item-date { font-size: 11px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11.5px; font-style: italic; color: #dc2626; margin-bottom: 4px; }
            .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background-color: #fef2f2; color: #991b1b; padding: 3px 8px; border: 1px solid #fee2e2; border-radius: 6px; font-size: 10.5px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="header">
            ${photoHTML}
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            <div class="contact">
              ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span>• ${personalInfo.phone}</span>` : ''}
              ${personalInfo.address ? `<span>• ${personalInfo.address}</span>` : ''}
              ${personalInfo.linkedin ? `<span>• ${personalInfo.linkedin}</span>` : ''}
              ${personalInfo.github ? `<span>• ${personalInfo.github}</span>` : ''}
            </div>
          </div>
          ${summary ? `<div class="section"><div class="section-title">Summary</div><div class="summary-text">${summary}</div></div>` : ''}
          ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiencesHTML}</div>` : ''}
          ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
          ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
          ${renderLanguagesHTML(false)}
          ${renderCertificationsHTML(false)}
          ${renderAwardsHTML()}
          ${renderWebsitesHTML(false)}
          ${renderReferencesHTML()}
          ${renderHobbiesHTML(false)}
          ${renderCustomSectionHTML(false)}
        </body>
        </html>
      `;
    }

    // 9. DEVELOPER TERMINAL (ATS)
    if (template === 'tech') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Consolas, Monaco, monospace, sans-serif; color: #1f2937; margin: 40px; line-height: 1.5; font-size: 12.5px; }
            .header { text-align: left; margin-bottom: 25px; border-left: 4px solid #059669; padding-left: 15px; }
            .name { font-size: 26px; font-weight: bold; color: #111827; }
            .title { font-size: 14px; color: #059669; margin-top: 2px; }
            .contact { font-size: 11px; color: #4b5563; display: flex; gap: 14px; margin-top: 6px; }
            .section { margin-bottom: 22px; border-left: 4px solid #e5e7eb; padding-left: 15px; }
            .section-title { font-size: 12px; font-weight: bold; color: #059669; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .summary-text { font-size: 11.5px; color: #4b5563; }
            .item { margin-bottom: 12px; }
            .item-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; }
            .item-date { font-size: 10.5px; color: #6b7280; font-weight: normal; }
            .item-sub { font-size: 11px; font-style: italic; color: #059669; margin-bottom: 4px; }
            .skills-container { display: flex; flex-wrap: wrap; gap: 6px; }
            .skill-tag { background-color: #111827; color: #34d399; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="header">
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            <div class="contact">
              ${personalInfo.email ? `<span>${personalInfo.email}</span>` : ''}
              ${personalInfo.phone ? `<span>• ${personalInfo.phone}</span>` : ''}
              ${personalInfo.address ? `<span>• ${personalInfo.address}</span>` : ''}
              ${personalInfo.linkedin ? `<span>• ${personalInfo.linkedin}</span>` : ''}
              ${personalInfo.github ? `<span>• ${personalInfo.github}</span>` : ''}
            </div>
          </div>
          ${summary ? `<div class="section"><div class="section-title">> Professional Summary</div><div class="summary-text">${summary}</div></div>` : ''}
          ${experiences.length > 0 ? `<div class="section"><div class="section-title">> Work Experience</div>${experiencesHTML}</div>` : ''}
          ${educations.length > 0 ? `<div class="section"><div class="section-title">> Education</div>${educationsHTML}</div>` : ''}
          ${skills.length > 0 ? `<div class="section"><div class="section-title">> Skills</div><div class="skills-container">${skillsHTML}</div></div>` : ''}
          ${renderLanguagesHTML(false)}
          ${renderCertificationsHTML(false)}
          ${renderAwardsHTML()}
          ${renderWebsitesHTML(false)}
          ${renderReferencesHTML()}
          ${renderHobbiesHTML(false)}
          ${renderCustomSectionHTML(false)}
        </body>
        </html>
      `;
    }

    // 10. JONATHAN PATTERSON (Non-ATS)
    if (template === 'jonathan') {
      const skillsListHTML = skills.map(s => `
        <div style="margin-bottom: 6px; font-size: 11px; color: #334155; font-weight: bold; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid ${accentColor}; vertical-align: middle; margin-right: 8px; position: relative;">
            <span style="display: block; width: 4px; height: 4px; border-radius: 50%; background-color: ${accentColor}; position: absolute; top: 2px; left: 2px;"></span>
          </span>
          ${s}
        </div>
      `).join('');

      const langListHTML = languages.map(l => `
        <div style="margin-bottom: 6px; font-size: 11px; color: #334155; font-weight: bold; display: flex; align-items: center;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid ${accentColor}; vertical-align: middle; margin-right: 8px; position: relative;">
            <span style="display: block; width: 4px; height: 4px; border-radius: 50%; background-color: ${accentColor}; position: absolute; top: 2px; left: 2px;"></span>
          </span>
          ${l.name} <span style="font-weight: normal; color: #64748b; font-size: 9.5px; margin-left: 4px;">(${l.level})</span>
        </div>
      `).join('');

      const eduListHTML = educations.map(edu => `
        <div style="position: relative; padding-left: 14px; border-left: 1px solid #cbd5e1; margin-bottom: 14px;">
          <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; background-color: ${accentColor}; left: -4px; top: 4px;"></div>
          <div style="font-weight: bold; font-size: 9.5px; color: #1e293b;">${edu.startDate} - ${edu.endDate || 'Present'}</div>
          <div style="font-weight: bold; font-size: 10.5px; color: #334155; margin-top: 2px;">${edu.school}</div>
          <div style="font-size: 9.5px; color: #64748b; font-style: italic; margin-top: 1px;">${edu.degree} in ${edu.fieldOfStudy}</div>
        </div>
      `).join('');

      const expListHTML = experiences.map(exp => `
        <div style="position: relative; padding-left: 18px; border-left: 1.5px solid ${accentColor}; margin-bottom: 18px;">
          <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background-color: ${accentColor}; border: 1.5px solid white; left: -5px; top: 4px; box-shadow: 0 0 0 1px ${accentColor};"></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; color: #1e293b;">
            <span>${exp.jobTitle}</span>
            <span style="font-size: 10px; color: #64748b; font-weight: normal;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</span>
          </div>
          <div style="font-weight: bold; font-size: 10.5px; color: #64748b; margin-top: 2px; margin-bottom: 6px;">${exp.company} ${exp.location ? `• ${exp.location}` : ''}</div>
          <div style="font-size: 11px; color: #475569; text-align: justify; line-height: 1.5;">${exp.description}</div>
        </div>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 0; font-size: 11.5px; }
            .wrapper { display: table; width: 100%; min-height: 100vh; }
            .sidebar { display: table-cell; width: 35%; background-color: #f1f5f9; padding: 35px 20px; vertical-align: top; }
            .main { display: table-cell; width: 65%; padding: 35px 25px; vertical-align: top; background-color: #ffffff; }
            .profile-photo { width: 110px; height: 110px; border-radius: 50%; border: 4px solid ${accentColor}; margin-bottom: 25px; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: ${accentColor}; border-bottom: 1.5px solid ${accentColor}; padding-bottom: 4px; margin-top: 25px; margin-bottom: 12px; }
            .contact-item { margin-bottom: 8px; font-size: 10.5px; color: #475569; display: flex; align-items: center; }
            .contact-icon { color: ${accentColor}; margin-right: 8px; font-size: 12px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="wrapper">
            <div class="sidebar">
              <div style="text-align: center;">
                ${photoHTML ? photoHTML.replace('class="profile-photo"', `class="profile-photo" style="border-color: ${accentColor};"`) : ''}
              </div>
              <div class="section-title">Contact</div>
              <div style="margin-top: 8px;">
                ${personalInfo.phone ? `<div class="contact-item"><span class="contact-icon">📞</span>${personalInfo.phone}</div>` : ''}
                ${personalInfo.email ? `<div class="contact-item"><span class="contact-icon">✉</span>${personalInfo.email}</div>` : ''}
                ${personalInfo.address ? `<div class="contact-item"><span class="contact-icon">📍</span>${personalInfo.address}</div>` : ''}
                ${personalInfo.linkedin ? `<div class="contact-item"><span class="contact-icon">🌐</span>${personalInfo.linkedin}</div>` : ''}
              </div>
              ${skills.length > 0 ? `<div class="section-title">Skills</div><div style="margin-top: 8px;">${skillsListHTML}</div>` : ''}
              ${showLanguages && languages.length > 0 ? `<div class="section-title">Languages</div><div style="margin-top: 8px;">${langListHTML}</div>` : ''}
              ${educations.length > 0 ? `<div class="section-title">Education</div><div style="margin-top: 10px;">${eduListHTML}</div>` : ''}
            </div>
            <div class="main">
              <div style="margin-bottom: 25px;">
                <h1 style="font-size: 28px; font-weight: bold; text-transform: uppercase; color: ${accentColor}; margin: 0 0 4px 0; letter-spacing: 0.5px;">${personalInfo.fullName || 'Your Name'}</h1>
                <p style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">${personalInfo.jobTitle || 'Professional Title'}</p>
                <div style="width: 40px; height: 3px; background-color: ${accentColor}; margin-top: 12px;"></div>
              </div>
              ${summary ? `<div style="margin-bottom: 25px;"><div class="section-title" style="margin-top: 0;">Personal Profile</div><div style="text-align: justify; line-height: 1.6; color: #475569;">${summary}</div></div>` : ''}
              ${experiences.length > 0 ? `<div style="margin-bottom: 25px;"><div class="section-title">Work Experience</div><div style="margin-top: 15px;">${expListHTML}</div></div>` : ''}
              ${renderCertificationsHTML(false)}
              ${renderAwardsHTML()}
              ${renderReferencesHTML()}
              ${renderCustomSectionHTML(false)}
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 11. MARIANA SIGNATURE (Non-ATS)
    if (template === 'mariana') {
      const skillsListHTML = skills.map(s => `
        <div style="margin-bottom: 6px; font-size: 11px; color: rgba(255, 255, 255, 0.9);">
          • ${s}
        </div>
      `).join('');

      const langListHTML = languages.map(l => `
        <div style="margin-bottom: 6px; font-size: 11px; color: rgba(255, 255, 255, 0.9); display: flex; justify-content: space-between;">
          <span style="font-weight: bold; color: white;">${l.name}</span>
          <span style="color: rgba(255, 255, 255, 0.7); font-size: 10px;">${l.level}</span>
        </div>
      `).join('');

      const eduListHTML = educations.map(edu => `
        <div style="margin-bottom: 12px; color: rgba(255, 255, 255, 0.9); line-height: 1.4;">
          <div style="font-size: 9px; color: rgba(255, 255, 255, 0.6); font-weight: bold;">${edu.startDate} - ${edu.endDate || 'Present'}</div>
          <div style="font-weight: bold; color: white; font-size: 11px;">${edu.degree} in ${edu.fieldOfStudy}</div>
          <div style="font-size: 10px; color: rgba(255, 255, 255, 0.85);">${edu.school}</div>
        </div>
      `).join('');

      const expListHTML = experiences.map(exp => `
        <div style="position: relative; padding-left: 18px; border-left: 1px solid #cbd5e1; margin-bottom: 18px;">
          <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background-color: #ffffff; border: 1.5px solid #475569; left: -5px; top: 4px;"></div>
          <div style="font-size: 10px; color: #94a3b8; font-weight: bold; margin-bottom: 2px;">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
          <div style="font-weight: bold; font-size: 12px; color: #1e293b;">${exp.company} ${exp.location ? `• ${exp.location}` : ''}</div>
          <div style="font-weight: 800; font-size: 11px; color: #475569; text-transform: uppercase; margin-top: 2px; margin-bottom: 6px;">${exp.jobTitle}</div>
          <div style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: justify;">${exp.description}</div>
        </div>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 0; font-size: 11.5px; }
            .wrapper { display: table; width: 100%; min-height: 100vh; }
            .sidebar { display: table-cell; width: 35%; background-color: ${accentColor}; padding: 35px 20px; vertical-align: top; color: #f8fafc; }
            .main { display: table-cell; width: 65%; padding: 35px 25px; vertical-align: top; background-color: #ffffff; }
            .profile-photo { width: 110px; height: 110px; border-radius: 50%; border: 4px solid rgba(255, 255, 255, 0.2); margin-bottom: 25px; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .sidebar-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; border-bottom: 1px solid rgba(255, 255, 255, 0.25); padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; }
            .main-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1e293b; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; }
            .contact-item { margin-bottom: 10px; font-size: 10.5px; }
            .contact-label { font-weight: bold; color: white; display: block; margin-bottom: 2px; font-size: 8.5px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255, 255, 255, 0.7); }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="wrapper">
            <div class="sidebar">
              <div style="text-align: center;">
                ${photoHTML ? photoHTML.replace('class="profile-photo"', `class="profile-photo" style="border-color: rgba(255, 255, 255, 0.2);"`) : ''}
              </div>
              <div class="sidebar-title">Contact</div>
              <div style="margin-top: 8px;">
                ${personalInfo.phone ? `<div class="contact-item"><span class="contact-label">Phone</span>${personalInfo.phone}</div>` : ''}
                ${personalInfo.email ? `<div class="contact-item"><span class="contact-label">Email</span>${personalInfo.email}</div>` : ''}
                ${personalInfo.address ? `<div class="contact-item"><span class="contact-label">Address</span>${personalInfo.address}</div>` : ''}
              </div>
              ${educations.length > 0 ? `<div class="sidebar-title">Education</div><div style="margin-top: 10px;">${eduListHTML}</div>` : ''}
              ${skills.length > 0 ? `<div class="sidebar-title">Expertise</div><div style="margin-top: 8px;">${skillsListHTML}</div>` : ''}
              ${showLanguages && languages.length > 0 ? `<div class="sidebar-title">Language</div><div style="margin-top: 8px;">${langListHTML}</div>` : ''}
            </div>
            <div class="main">
              <div style="margin-bottom: 25px;">
                <h1 style="font-size: 32px; font-weight: 800; color: #1e293b; margin: 0 0 4px 0; letter-spacing: -0.5px;">${personalInfo.fullName || 'Your Name'}</h1>
                <p style="font-size: 14px; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0;">${personalInfo.jobTitle || 'Professional Title'}</p>
                ${summary ? `<div style="font-size: 11px; color: #475569; line-height: 1.6; text-align: justify;">${summary}</div>` : ''}
              </div>
              ${experiences.length > 0 ? `<div style="margin-bottom: 25px;"><div class="main-title" style="margin-top: 0;">Experience</div><div style="margin-top: 15px;">${expListHTML}</div></div>` : ''}
              ${renderCertificationsHTML(false)}
              ${renderAwardsHTML()}
              ${renderReferencesHTML()}
              ${renderCustomSectionHTML(false)}
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 12. RICHARD STERLING (Non-ATS)
    if (template === 'richard') {
      const getSplitName = (fullName: string) => {
        const trimmed = fullName.trim();
        if (!trimmed) return { first: 'YOUR', last: 'NAME' };
        const parts = trimmed.split(' ');
        if (parts.length === 1) return { first: parts[0], last: '' };
        return {
          first: parts[0],
          last: parts.slice(1).join(' ')
        };
      };
      const nameParts = getSplitName(personalInfo.fullName);

      const skillsListHTML = skills.map(s => `
        <div style="margin-bottom: 6px; font-size: 11px; color: rgba(255, 255, 255, 0.9);">
          • ${s}
        </div>
      `).join('');

      const langListHTML = languages.map(l => `
        <div style="margin-bottom: 6px; font-size: 11px; color: rgba(255, 255, 255, 0.9);">
          • <span style="font-weight: bold; color: white;">${l.name}</span> (${l.level})
        </div>
      `).join('');

      const eduListHTML = educations.map(edu => `
        <div style="position: relative; padding-left: 12px; border-left: 1px solid rgba(255, 255, 255, 0.2); margin-bottom: 12px; color: rgba(255, 255, 255, 0.9);">
          <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; background-color: #ffffff; left: -4.5px; top: 4px;"></div>
          <div style="font-size: 8.5px; color: rgba(255, 255, 255, 0.7); font-weight: bold;">${edu.startDate} - ${edu.endDate || 'Present'}</div>
          <div style="font-weight: bold; color: white; font-size: 10px; text-transform: uppercase; margin-top: 2px;">${edu.school}</div>
          <div style="font-size: 9px; color: rgba(255, 255, 255, 0.85); font-style: italic; margin-top: 1px;">${edu.degree} in ${edu.fieldOfStudy}</div>
        </div>
      `).join('');

      const expListHTML = experiences.map(exp => `
        <div style="position: relative; padding-left: 18px; border-left: 1px solid #e2e8f0; margin-bottom: 18px;">
          <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background-color: ${accentColor}; border: 1.5px solid white; left: -5px; top: 4px; box-shadow: 0 0 0 1px ${accentColor};"></div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
            <h3 style="font-weight: bold; font-size: 11.5px; color: #1e293b; text-transform: uppercase; margin: 0;">${exp.company}</h3>
            <span style="font-size: 9.5px; font-weight: bold; color: #94a3b8;">${exp.startDate} - ${exp.current ? 'PRESENT' : exp.endDate}</span>
          </div>
          <div style="font-size: 10.5px; font-weight: 600; color: #64748b; font-style: italic; margin-bottom: 6px;">${exp.jobTitle} ${exp.location ? `• ${exp.location}` : ''}</div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5; text-align: justify;">${exp.description}</div>
        </div>
      `).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 0; font-size: 11.5px; }
            .wrapper { display: table; width: 100%; min-height: 100vh; }
            .sidebar { display: table-cell; width: 35%; background-color: ${accentColor}; padding: 35px 20px; vertical-align: top; color: #f8fafc; }
            .main { display: table-cell; width: 65%; padding: 35px 25px; vertical-align: top; background-color: #ffffff; }
            .profile-photo { width: 110px; height: 110px; border-radius: 50%; border: 2px solid #ffffff; margin-bottom: 25px; object-fit: cover; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .sidebar-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; }
            .main-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 25px; margin-bottom: 15px; }
            .contact-item { margin-bottom: 8px; font-size: 10.5px; }
          </style>
          ${globalStylesOverride}
        </head>
        <body>
          <div class="wrapper">
            <div class="sidebar">
              <div style="text-align: center;">
                ${photoHTML ? photoHTML.replace('class="profile-photo"', `class="profile-photo" style="border-color: #ffffff; border-width: 2px;"`) : ''}
              </div>
              <div class="sidebar-title">Contact</div>
              <div style="margin-top: 8px;">
                ${personalInfo.phone ? `<div class="contact-item">📞 ${personalInfo.phone}</div>` : ''}
                ${personalInfo.email ? `<div class="contact-item">✉ ${personalInfo.email}</div>` : ''}
                ${personalInfo.address ? `<div class="contact-item">📍 ${personalInfo.address}</div>` : ''}
              </div>
              ${educations.length > 0 ? `<div class="sidebar-title">Education</div><div style="margin-top: 10px;">${eduListHTML}</div>` : ''}
              ${skills.length > 0 ? `<div class="sidebar-title">Skills</div><div style="margin-top: 8px;">${skillsListHTML}</div>` : ''}
              ${showLanguages && languages.length > 0 ? `<div class="sidebar-title">Languages</div><div style="margin-top: 8px;">${langListHTML}</div>` : ''}
            </div>
            <div class="main">
              <div style="margin-bottom: 25px; border-bottom: 1px solid #cbd5e1; padding-bottom: 15px;">
                <h1 style="font-size: 28px; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px;">
                  <span style="font-weight: 900; color: #1e293b;">${nameParts.first}</span>
                  <span style="font-weight: 300; color: #94a3b8;">${nameParts.last}</span>
                </h1>
                <p style="font-size: 11px; font-weight: 900; color: ${accentColor}; text-transform: uppercase; letter-spacing: 2.5px; margin: 0;">${personalInfo.jobTitle || 'Professional Title'}</p>
              </div>
              ${summary ? `<div style="margin-bottom: 25px;"><div class="main-title" style="margin-top: 0;">Profile</div><div style="text-align: justify; line-height: 1.6; color: #475569;">${summary}</div></div>` : ''}
              ${experiences.length > 0 ? `<div style="margin-bottom: 25px;"><div class="main-title">Work Experience</div><div style="margin-top: 15px;">${expListHTML}</div></div>` : ''}
              ${renderCertificationsHTML(false)}
              ${renderAwardsHTML()}
              ${renderReferencesHTML()}
              ${renderCustomSectionHTML(false)}
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // 13. MODERN SPLIT (Non-ATS)
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; font-size: 12px; }
          .wrapper { display: table; width: 100%; min-height: 100vh; }
          .split-left { display: table-cell; width: 38%; background-color: #1f2937; color: white; padding: 30px 20px; vertical-align: top; }
          .split-right { display: table-cell; width: 62%; padding: 30px 25px; vertical-align: top; }
          .profile-photo { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #9ca3af; margin-bottom: 20px; object-fit: cover; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
          .title { font-size: 12px; font-weight: 600; color: #d1d5db; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; }
          .split-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #4b5563; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; }
          .split-title-dark { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1f2937; border-bottom: 2px solid #1f2937; padding-bottom: 4px; margin-bottom: 12px; margin-top: 25px; }
          .contact-item { margin-bottom: 10px; font-size: 11px; color: #d1d5db; }
          .contact-label { font-weight: bold; color: white; display: block; margin-bottom: 2px; }
          .section { margin-bottom: 22px; }
          .summary-text { font-size: 11.5px; color: #4b5563; text-align: justify; }
          .item { margin-bottom: 14px; }
          .item-header { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: bold; color: #111827; }
          .item-date { font-size: 10.5px; color: #6b7280; font-weight: normal; }
          .item-sub { font-size: 11.5px; font-style: italic; color: #4b5563; margin-bottom: 4px; }
          .skill-tag { background-color: #4b5563; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; display: inline-block; margin: 3px 2px; }
        </style>
        ${globalStylesOverride}
      </head>
      <body>
        <div class="wrapper">
          <div class="split-left">
            ${photoHTML}
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
            <div class="split-title">Contact</div>
            ${personalInfo.email ? `<div class="contact-item"><span class="contact-label">Email</span>${personalInfo.email}</div>` : ''}
            ${personalInfo.phone ? `<div class="contact-item"><span class="contact-label">Phone</span>${personalInfo.phone}</div>` : ''}
            ${personalInfo.address ? `<div class="contact-item"><span class="contact-label">Address</span>${personalInfo.address}</div>` : ''}
            ${personalInfo.linkedin ? `<div class="contact-item"><span class="contact-label">LinkedIn</span>${personalInfo.linkedin}</div>` : ''}
            ${personalInfo.github ? `<div class="contact-item"><span class="contact-label">GitHub</span>${personalInfo.github}</div>` : ''}
            ${skills.length > 0 ? `<div class="split-title">Skills</div><div style="margin-top: 8px;">${skillsHTML}</div>` : ''}
            ${renderLanguagesHTML(true)}
            ${renderWebsitesHTML(true)}
            ${renderHobbiesHTML(true)}
          </div>
          <div class="split-right">
            ${summary ? `<div class="section"><div class="split-title-dark">Profile Summary</div><div class="summary-text">${summary}</div></div>` : ''}
            ${experiences.length > 0 ? `<div class="section"><div class="split-title-dark">Work Experience</div>${experiencesHTML}</div>` : ''}
            ${educations.length > 0 ? `<div class="section"><div class="split-title-dark">Education</div>${educationsHTML}</div>` : ''}
            ${renderCertificationsHTML(false)}
            ${renderAwardsHTML()}
            ${renderReferencesHTML()}
            ${renderCustomSectionHTML(false)}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // --- PDF Export Handler ---
  const handleDownload = async () => {
    try {
      const htmlContent = generateHTML();
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: 'public.item', mimeType: 'application/pdf' });
    } catch (error) {
      console.error(error);
      Alert.alert('Download Error', 'Could not generate PDF. Please try again.');
    }
  };

  // --- Live Preview Component Renderer (Adapts UI to 10 Templates) ---
  const renderLivePreview = () => {
    const photoPreview = (!isAtsTemplate && photoInfo) ? (
      <Image source={{ uri: photoInfo.uri }} style={styles.previewPhoto} />
    ) : null;

    const getFontFamily = () => {
      if (documentFont === 'Playfair' || documentFont === 'Merriweather' || documentFont === 'Lora' || documentFont === 'Times') {
        return Platform.OS === 'ios' ? 'Georgia' : 'serif';
      }
      if (documentFont === 'Fira Code') {
        return Platform.OS === 'ios' ? 'Courier' : 'monospace';
      }
      return Platform.OS === 'ios' ? 'System' : 'sans-serif';
    };
    const previewFont = getFontFamily();

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Helper: Contact Row Details
    const renderContactDetails = () => (
      <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-1">
        {personalInfo.email && <Text className="text-[10px] text-gray-500" style={{ fontFamily: previewFont }}>{personalInfo.email}</Text>}
        {personalInfo.phone && <Text className="text-[10px] text-gray-500" style={{ fontFamily: previewFont }}>• {personalInfo.phone}</Text>}
        {personalInfo.address && <Text className="text-[10px] text-gray-500" style={{ fontFamily: previewFont }}>• {personalInfo.address}</Text>}
        {personalInfo.linkedin && <Text className="text-[10px] text-gray-500" style={{ fontFamily: previewFont }}>• {personalInfo.linkedin}</Text>}
        {personalInfo.github && <Text className="text-[10px] text-gray-500" style={{ fontFamily: previewFont }}>• {personalInfo.github}</Text>}
      </View>
    );

    // Helper: Render Experience List
    const renderExperiencePreview = (color: string) => {
      if (experiences.length === 0) return null;
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color, fontFamily: previewFont }}>Work Experience</Text>
          {experiences.map((exp) => (
            <View key={exp.id} className="mb-4">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2" style={{ fontFamily: previewFont }}>{exp.jobTitle || 'Job Title'}</Text>
                <Text className="text-[10px] text-gray-400 font-medium" style={{ fontFamily: previewFont }}>{exp.startDate || ''} - {exp.current ? 'Present' : (exp.endDate || '')}</Text>
              </View>
              <Text className="text-[11px] font-semibold text-gray-500 italic mb-1" style={{ fontFamily: previewFont }}>
                {exp.company || 'Company'} {exp.location ? `• ${exp.location}` : ''}
              </Text>
              {exp.description ? <Text className="text-xs text-gray-600 leading-normal text-justify" style={{ fontFamily: previewFont }}>{exp.description}</Text> : null}
            </View>
          ))}
        </View>
      );
    };

    // Helper: Render Education List
    const renderEducationPreview = (color: string) => {
      if (educations.length === 0) return null;
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color, fontFamily: previewFont }}>Education</Text>
          {educations.map((edu) => (
            <View key={edu.id} className="mb-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2" style={{ fontFamily: previewFont }}>{edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                <Text className="text-[10px] text-gray-400 font-medium" style={{ fontFamily: previewFont }}>{edu.startDate || ''} - {edu.current ? 'Present' : (edu.endDate || '')}</Text>
              </View>
              <Text className="text-[11px] font-semibold text-gray-500 italic" style={{ fontFamily: previewFont }}>
                {edu.school || 'School'} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
              </Text>
            </View>
          ))}
        </View>
      );
    };

    // Helper: Render Skills tags
    const renderSkillsPreview = (color: string, bg: string, border: string) => {
      if (skills.length === 0) return null;
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color, fontFamily: previewFont }}>Skills</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <View key={index} className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: bg, borderColor: border }}>
                <Text className="text-[10px] font-semibold" style={{ color, fontFamily: previewFont }}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    };

    // Helper: Render Languages
    const renderLanguagesPreview = (color: string, bg: string, border: string, isSidebar = false) => {
      if (!showLanguages || languages.length === 0) return null;
      if (isSidebar) {
        return (
          <View className="mb-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-wider mb-2 text-white/70">Languages</Text>
            {languages.map((l) => (
              <View key={l.id} className="mb-2">
                <Text className="text-[11px] font-bold text-white">{l.name || 'Language'}</Text>
                {l.level ? <Text className="text-[9px] text-white/50">{l.level}</Text> : null}
              </View>
            ))}
          </View>
        );
      }
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color }}>Languages</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {languages.map((l) => (
              <View key={l.id} className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: bg, borderColor: border }}>
                <Text className="text-[10px] font-semibold" style={{ color }}>{l.name || 'Language'}{l.level ? `: ${l.level}` : ''}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    };

    // Helper: Render Certifications
    const renderCertificationsPreview = (color: string, isSidebar = false) => {
      if (!showCertifications || certifications.length === 0) return null;
      if (isSidebar) {
        return (
          <View className="mb-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-wider mb-2 text-white/70">Certifications</Text>
            {certifications.map((c) => (
              <View key={c.id} className="mb-2">
                <Text className="text-[11px] font-bold text-white">{c.name || 'Certificate'}</Text>
                <Text className="text-[9px] text-white/50">{c.issuer || ''} {c.date ? `• ${c.date}` : ''}</Text>
              </View>
            ))}
          </View>
        );
      }
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color }}>Certifications & Licenses</Text>
          {certifications.map((c) => (
            <View key={c.id} className="mb-2">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2">{c.name || 'Certificate'}</Text>
                <Text className="text-[10px] text-gray-400 font-medium">{c.date || ''}</Text>
              </View>
              {c.issuer ? <Text className="text-[11px] font-semibold text-gray-500 italic">{c.issuer}</Text> : null}
            </View>
          ))}
        </View>
      );
    };

    // Helper: Render Awards
    const renderAwardsPreview = (color: string) => {
      if (!showAwards || awards.length === 0) return null;
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color }}>Awards & Honors</Text>
          {awards.map((a) => (
            <View key={a.id} className="mb-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2">{a.title || 'Award'}</Text>
                <Text className="text-[10px] text-gray-400 font-medium">{a.date || ''}</Text>
              </View>
              <Text className="text-[11px] font-semibold text-gray-500 italic">{a.issuer || ''}</Text>
              {a.description ? <Text className="text-xs text-gray-600 leading-normal mt-0.5">{a.description}</Text> : null}
            </View>
          ))}
        </View>
      );
    };

    // Helper: Render Websites
    const renderWebsitesPreview = (color: string, isSidebar = false) => {
      if (!showWebsites || websites.length === 0) return null;
      if (isSidebar) {
        return (
          <View className="mb-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-wider mb-2 text-white/70">Links</Text>
            {websites.map((w) => (
              <View key={w.id} className="mb-2">
                <Text className="text-[11px] font-bold text-white">{w.label || 'Link'}</Text>
                <Text className="text-[10px] text-blue-300">{w.url}</Text>
              </View>
            ))}
          </View>
        );
      }
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color }}>Websites & Links</Text>
          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            {websites.map((w) => (
              <Text key={w.id} className="text-xs text-gray-700">
                <Text className="font-bold">{w.label || 'Link'}: </Text>
                <Text style={{ color }}>{w.url}</Text>
              </Text>
            ))}
          </View>
        </View>
      );
    };

    // Helper: Render References
    const renderReferencesPreview = (color: string) => {
      if (!showReferences || references.length === 0) return null;
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color }}>References</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {references.map((r) => (
              <View key={r.id} className="w-[48%]">
                <Text className="text-xs font-bold text-gray-800">{r.name || 'Reference'}</Text>
                <Text className="text-[10px] text-gray-500 font-medium">
                  {r.relationship || ''} {r.company ? `• ${r.company}` : ''}
                </Text>
                {r.email ? <Text className="text-[10px] text-gray-400">Email: {r.email}</Text> : null}
                {r.phone ? <Text className="text-[10px] text-gray-400">Phone: {r.phone}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      );
    };

    // Helper: Render Hobbies
    const renderHobbiesPreview = (color: string, bg: string, border: string, isSidebar = false) => {
      if (!showHobbies || hobbies.length === 0) return null;
      if (isSidebar) {
        return (
          <View className="mb-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-wider mb-2 text-white/70">Hobbies & Interests</Text>
            <View className="flex-row flex-wrap gap-1">
              {hobbies.map((h, i) => (
                <View key={i} className="px-2 py-0.5 rounded bg-white/10">
                  <Text className="text-[9px] font-semibold text-white">{h}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      }
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color }}>Hobbies & Interests</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {hobbies.map((h, i) => (
              <View key={i} className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: bg, borderColor: border }}>
                <Text className="text-[10px] font-semibold" style={{ color }}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    };

    // Helper: Render Custom Section
    const renderCustomSectionPreview = (color: string, isSidebar = false) => {
      if (!showCustomSection || customSectionItems.length === 0) return null;
      if (isSidebar) {
        return (
          <View className="mb-4">
            <Text className="text-[10px] font-extrabold uppercase tracking-wider mb-2 text-white/70">{customSectionTitle}</Text>
            {customSectionItems.map((item) => (
              <View key={item.id} className="mb-2">
                <Text className="text-[11px] font-bold text-white">{item.title || 'Item'}</Text>
                {item.subtitle ? <Text className="text-[9px] text-white/50">{item.subtitle}</Text> : null}
                {item.description ? <Text className="text-[9px] text-white/70 mt-0.5">{item.description}</Text> : null}
              </View>
            ))}
          </View>
        );
      }
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color }}>{customSectionTitle}</Text>
          {customSectionItems.map((item) => (
            <View key={item.id} className="mb-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2">{item.title || 'Item Title'}</Text>
                <Text className="text-[10px] text-gray-400 font-medium">{item.subtitle || ''}</Text>
              </View>
              {item.description ? <Text className="text-xs text-gray-600 leading-normal mt-0.5">{item.description}</Text> : null}
            </View>
          ))}
        </View>
      );
    };

    // 1. MODERN MINIMALIST (ATS)
    if (template === 'modern') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12" style={styles.previewShadow}>
          <View className="items-center mb-6">
            <Text className="text-3xl font-light text-gray-900 text-center mb-1 tracking-wide" style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
              {personalInfo.fullName || 'YOUR NAME'}
            </Text>
            <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">
              {personalInfo.jobTitle || 'PROFESSIONAL TITLE'}
            </Text>
            <View className="w-full border-t border-b border-gray-150 py-2 flex-row flex-wrap justify-center gap-x-3 gap-y-1">
              {personalInfo.email && <Text className="text-[10px] text-gray-600">{personalInfo.email}</Text>}
              {personalInfo.phone && <Text className="text-[10px] text-gray-600">• {personalInfo.phone}</Text>}
              {personalInfo.address && <Text className="text-[10px] text-gray-600">• {personalInfo.address}</Text>}
              {personalInfo.linkedin && <Text className="text-[10px] text-gray-600">• {personalInfo.linkedin}</Text>}
              {personalInfo.github && <Text className="text-[10px] text-gray-600">• {personalInfo.github}</Text>}
            </View>
          </View>
          {summary ? (
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center mb-2">Professional Summary</Text>
              <View className="w-6 h-[1px] bg-gray-400 mx-auto mb-3" />
              <Text className="text-xs text-gray-600 leading-relaxed text-center">{summary}</Text>
            </View>
          ) : null}
          {renderExperiencePreview('#111827')}
          {renderEducationPreview('#111827')}
          {renderSkillsPreview('#374151', '#f9fafb', '#e5e7eb')}
          {renderLanguagesPreview('#374151', '#f9fafb', '#e5e7eb')}
          {renderCertificationsPreview('#374151')}
          {renderAwardsPreview('#374151')}
          {renderWebsitesPreview('#3b82f6')}
          {renderReferencesPreview('#374151')}
          {renderHobbiesPreview('#374151', '#f9fafb', '#e5e7eb')}
          {renderCustomSectionPreview('#374151')}
        </View>
      );
    }

    // 2. CREATIVE SIDEBAR (Non-ATS)
    if (template === 'creative') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 flex-row overflow-hidden" style={styles.previewShadow}>
          <View className="w-[35%] bg-gray-50 border-r border-gray-100 p-4 pt-6">
            {photoPreview}
            <Text className="text-lg font-extrabold text-gray-900 leading-tight mb-1">{personalInfo.fullName || 'YOUR NAME'}</Text>
            <Text className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-6">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
            
            <Text className="text-[9px] font-extrabold text-gray-900 uppercase tracking-widest border-b-2 border-amber-500 pb-1 mb-2">Contact</Text>
            {personalInfo.email && <View className="mb-2"><Text className="text-[8px] font-bold text-gray-400 uppercase">Email</Text><Text className="text-[9px] text-gray-600 break-all">{personalInfo.email}</Text></View>}
            {personalInfo.phone && <View className="mb-2"><Text className="text-[8px] font-bold text-gray-400 uppercase">Phone</Text><Text className="text-[9px] text-gray-600">{personalInfo.phone}</Text></View>}
            {personalInfo.address && <View className="mb-2"><Text className="text-[8px] font-bold text-gray-400 uppercase">Address</Text><Text className="text-[9px] text-gray-600">{personalInfo.address}</Text></View>}
            {personalInfo.linkedin && <View className="mb-2"><Text className="text-[8px] font-bold text-gray-400 uppercase">LinkedIn</Text><Text className="text-[9px] text-gray-600 break-all">{personalInfo.linkedin}</Text></View>}
            {personalInfo.github && <View className="mb-2"><Text className="text-[8px] font-bold text-gray-400 uppercase">GitHub</Text><Text className="text-[9px] text-gray-600 break-all">{personalInfo.github}</Text></View>}
            
            {skills.length > 0 && (
              <View className="mt-4">
                <Text className="text-[9px] font-extrabold text-gray-900 uppercase tracking-widest border-b-2 border-amber-500 pb-1 mb-3">Skills</Text>
                <View className="flex-row flex-wrap gap-1">{skills.map((s, i) => (<View key={i} className="bg-gray-900 px-2 py-1 rounded"><Text className="text-white text-[8px] font-bold">{s}</Text></View>))}</View>
              </View>
            )}
            {renderLanguagesPreview('#111827', '#f3f4f6', '#e5e7eb', true)}
            {renderWebsitesPreview('#3b82f6', true)}
            {renderHobbiesPreview('#111827', '#f3f4f6', '#e5e7eb', true)}
          </View>
          <View className="w-[65%] p-4 pt-6 bg-white">
            {summary ? <View className="mb-5"><Text className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">Summary</Text><Text className="text-[11px] text-gray-600 leading-relaxed text-justify">{summary}</Text></View> : null}
            {renderExperiencePreview('#111827')}
            {renderEducationPreview('#111827')}
            {renderCertificationsPreview('#111827')}
            {renderAwardsPreview('#111827')}
            {renderReferencesPreview('#111827')}
            {renderCustomSectionPreview('#111827')}
          </View>
        </View>
      );
    }

    // 3. ELEGANT BANNER (Non-ATS)
    if (template === 'banner') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 overflow-hidden" style={styles.previewShadow}>
          <View className="bg-gray-900 p-5 flex-row items-center gap-4">
            {photoPreview}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">{personalInfo.fullName || 'YOUR NAME'}</Text>
              <Text className="text-blue-400 text-xs uppercase font-semibold">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {personalInfo.email && <Text className="text-[9px] text-gray-300">{personalInfo.email}</Text>}
                {personalInfo.phone && <Text className="text-[9px] text-gray-300">• {personalInfo.phone}</Text>}
                {personalInfo.github && <Text className="text-[9px] text-gray-300">• {personalInfo.github}</Text>}
              </View>
            </View>
          </View>
          <View className="p-6">
            {summary ? <View className="mb-4"><Text className="font-bold border-b border-gray-100 pb-1 text-xs">Summary</Text><Text className="text-xs text-gray-600 mt-2">{summary}</Text></View> : null}
            {renderExperiencePreview('#1f2937')}
            {renderEducationPreview('#1f2937')}
            {renderSkillsPreview('#1f2937', '#f3f4f6', '#e5e7eb')}
            {renderLanguagesPreview('#1f2937', '#f3f4f6', '#e5e7eb')}
            {renderCertificationsPreview('#1f2937')}
            {renderAwardsPreview('#1f2937')}
            {renderWebsitesPreview('#3b82f6')}
            {renderReferencesPreview('#1f2937')}
            {renderHobbiesPreview('#1f2937', '#f3f4f6', '#e5e7eb')}
            {renderCustomSectionPreview('#1f2937')}
          </View>
        </View>
      );
    }

    // 4. MODERN TIMELINE (ATS)
    if (template === 'timeline') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12" style={styles.previewShadow}>
          <Text className="text-2xl font-black text-gray-900">{personalInfo.fullName || 'YOUR NAME'}</Text>
          <Text className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
          <View className="border-l-2 border-emerald-500 pl-4 ml-1">
            {summary ? <View className="mb-5"><Text className="text-[10px] font-bold text-gray-900 uppercase">Summary</Text><Text className="text-xs text-gray-600 mt-1">{summary}</Text></View> : null}
            {renderExperiencePreview('#111827')}
            {renderEducationPreview('#111827')}
            {renderSkillsPreview('#065f46', '#ecfdf5', '#a7f3d0')}
            {renderLanguagesPreview('#111827', '#ecfdf5', '#a7f3d0')}
            {renderCertificationsPreview('#111827')}
            {renderAwardsPreview('#111827')}
            {renderWebsitesPreview('#3b82f6')}
            {renderReferencesPreview('#111827')}
            {renderHobbiesPreview('#111827', '#ecfdf5', '#a7f3d0')}
            {renderCustomSectionPreview('#111827')}
          </View>
        </View>
      );
    }

    // 5. EXECUTIVE PREMIUM (Non-ATS)
    if (template === 'executive') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 overflow-hidden" style={styles.previewShadow}>
          <View className="bg-[#1e1b4b] p-6 flex-row items-center justify-between border-b-4 border-amber-500">
            <View className="flex-1">
              <Text className="text-white text-xl font-bold font-serif">{personalInfo.fullName || 'YOUR NAME'}</Text>
              <Text className="text-amber-500 text-[10px] uppercase font-bold tracking-wider mt-1">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
              <View className="flex-row flex-wrap gap-2 mt-2">
                {personalInfo.email && <Text className="text-[9px] text-slate-300">{personalInfo.email}</Text>}
                {personalInfo.linkedin && <Text className="text-[9px] text-slate-300">• {personalInfo.linkedin}</Text>}
              </View>
            </View>
            {photoPreview}
          </View>
          <View className="p-5 flex-row gap-4">
            <View className="w-[65%]">
              {summary ? <View className="mb-4"><Text className="font-bold text-indigo-900 border-b border-gray-150 pb-1 text-xs">Summary</Text><Text className="text-xs text-gray-600 mt-2">{summary}</Text></View> : null}
              {renderExperiencePreview('#1e1b4b')}
              {renderAwardsPreview('#1e1b4b')}
              {renderReferencesPreview('#1e1b4b')}
              {renderCustomSectionPreview('#1e1b4b')}
            </View>
            <View className="w-[35%]">
              {renderEducationPreview('#1e1b4b')}
              {renderSkillsPreview('#1e1b4b', '#f3f4f6', '#e5e7eb')}
              {renderLanguagesPreview('#1e1b4b', '#f3f4f6', '#e5e7eb', true)}
              {renderWebsitesPreview('#3b82f6', true)}
              {renderCertificationsPreview('#1e1b4b', true)}
              {renderHobbiesPreview('#1e1b4b', '#f3f4f6', '#e5e7eb', true)}
            </View>
          </View>
        </View>
      );
    }

    // 6. CLEAN COMPACT (ATS)
    if (template === 'compact') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl p-5 min-h-[600px] mb-12" style={styles.previewShadow}>
          <View className="flex-row justify-between border-b-2 border-teal-600 pb-3 mb-4">
            <View>
              <Text className="text-lg font-bold text-teal-600">{personalInfo.fullName || 'YOUR NAME'}</Text>
              <Text className="text-[10px] text-gray-500 font-bold">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
            </View>
            <View className="items-end">
              {personalInfo.email && <Text className="text-[9px] text-gray-500">{personalInfo.email}</Text>}
              {personalInfo.phone && <Text className="text-[9px] text-gray-500">{personalInfo.phone}</Text>}
            </View>
          </View>
          {summary ? <View className="mb-3"><Text className="text-[9px] font-bold text-teal-600 uppercase">Summary</Text><Text className="text-xs text-gray-600 mt-1">{summary}</Text></View> : null}
          {renderExperiencePreview('#0d9488')}
          {renderEducationPreview('#0d9488')}
          {renderSkillsPreview('#115e59', '#f0fdf4', '#ccfbf1')}
          {renderLanguagesPreview('#115e59', '#f0fdf4', '#ccfbf1')}
          {renderCertificationsPreview('#115e59')}
          {renderAwardsPreview('#115e59')}
          {renderWebsitesPreview('#3b82f6')}
          {renderReferencesPreview('#115e59')}
          {renderHobbiesPreview('#115e59', '#f0fdf4', '#ccfbf1')}
          {renderCustomSectionPreview('#115e59')}
        </View>
      );
    }

    // 7. VIBRANT CRIMSON (Non-ATS)
    if (template === 'vibrant') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12 items-center" style={styles.previewShadow}>
          {photoPreview}
          <Text className="text-2xl font-bold text-red-600 mt-2">{personalInfo.fullName || 'YOUR NAME'}</Text>
          <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
          {renderContactDetails()}
          <View className="w-full mt-6 text-left">
            {summary ? <View className="mb-4"><Text className="bg-red-600 text-white text-xs px-3 py-1 rounded font-bold">Summary</Text><Text className="text-xs text-gray-600 mt-2">{summary}</Text></View> : null}
            {renderExperiencePreview('#dc2626')}
            {renderEducationPreview('#dc2626')}
            {renderSkillsPreview('#991b1b', '#fef2f2', '#fee2e2')}
            {renderLanguagesPreview('#dc2626', '#fef2f2', '#fee2e2')}
            {renderCertificationsPreview('#dc2626')}
            {renderAwardsPreview('#dc2626')}
            {renderWebsitesPreview('#3b82f6')}
            {renderReferencesPreview('#dc2626')}
            {renderHobbiesPreview('#dc2626', '#fef2f2', '#fee2e2')}
            {renderCustomSectionPreview('#dc2626')}
          </View>
        </View>
      );
    }

    // 8. DEVELOPER TERMINAL (ATS)
    if (template === 'tech') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12" style={styles.previewShadow}>
          <View className="border-l-4 border-emerald-600 pl-3 mb-5">
            <Text className="text-xl font-bold text-gray-900">{personalInfo.fullName || 'YOUR NAME'}</Text>
            <Text className="text-xs text-emerald-600 font-semibold">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
            {renderContactDetails()}
          </View>
          {summary ? <View className="mb-4 pl-3 border-l border-gray-200"><Text className="text-xs font-bold text-emerald-600">{'> SUMMARY'}</Text><Text className="text-xs text-gray-600 mt-1">{summary}</Text></View> : null}
          {renderExperiencePreview('#059669')}
          {renderEducationPreview('#059669')}
          {skills.length > 0 && <View className="mb-4 pl-3 border-l border-gray-200"><Text className="text-xs font-bold text-emerald-600">{'> SKILLS'}</Text><View className="flex-row flex-wrap gap-1 mt-2">{skills.map((s, i) => (<View key={i} className="bg-slate-900 px-2 py-0.5 rounded"><Text className="text-emerald-400 text-[9px] font-mono">{s}</Text></View>))}</View></View>}
          {showLanguages && languages.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{'> LANGUAGES'}</Text>
              <View className="flex-row flex-wrap gap-1 mt-2">
                {languages.map((l) => (
                  <View key={l.id} className="bg-slate-900 px-2 py-0.5 rounded">
                    <Text className="text-emerald-400 text-[9px] font-mono">{l.name}{l.level ? `: ${l.level}` : ''}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {showCertifications && certifications.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{'> CERTIFICATIONS'}</Text>
              {certifications.map((c) => (
                <View key={c.id} className="mt-1">
                  <Text className="text-[11px] text-gray-800 font-mono font-bold">{c.name}</Text>
                  {c.issuer ? <Text className="text-[10px] text-gray-500 font-mono">{c.issuer} {c.date ? `(${c.date})` : ''}</Text> : null}
                </View>
              ))}
            </View>
          )}
          {showAwards && awards.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{'> AWARDS'}</Text>
              {awards.map((a) => (
                <View key={a.id} className="mt-1">
                  <Text className="text-[11px] text-gray-800 font-mono font-bold">{a.title}</Text>
                  {a.issuer ? <Text className="text-[10px] text-gray-500 font-mono">{a.issuer} {a.date ? `(${a.date})` : ''}</Text> : null}
                  {a.description ? <Text className="text-[10px] text-gray-500 font-mono">{a.description}</Text> : null}
                </View>
              ))}
            </View>
          )}
          {showWebsites && websites.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{'> LINKS'}</Text>
              {websites.map((w) => (
                <Text key={w.id} className="text-[10px] text-gray-650 font-mono mt-1">
                  {w.label}: <Text className="text-emerald-600">{w.url}</Text>
                </Text>
              ))}
            </View>
          )}
          {showReferences && references.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{'> REFERENCES'}</Text>
              {references.map((r) => (
                <View key={r.id} className="mt-1">
                  <Text className="text-[11px] text-gray-800 font-mono font-bold">{r.name}</Text>
                  <Text className="text-[10px] text-gray-500 font-mono">{r.relationship} @ {r.company}</Text>
                </View>
              ))}
            </View>
          )}
          {showHobbies && hobbies.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{'> HOBBIES'}</Text>
              <View className="flex-row flex-wrap gap-1 mt-2">
                {hobbies.map((h, i) => (
                  <View key={i} className="bg-slate-900 px-2 py-0.5 rounded">
                    <Text className="text-emerald-400 text-[9px] font-mono">{h}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {showCustomSection && customSectionItems.length > 0 && (
            <View className="mb-4 pl-3 border-l border-gray-200">
              <Text className="text-xs font-bold text-emerald-600">{`> ${customSectionTitle.toUpperCase()}`}</Text>
              {customSectionItems.map((item) => (
                <View key={item.id} className="mt-1">
                  <Text className="text-[11px] text-gray-800 font-mono font-bold">{item.title}</Text>
                  {item.subtitle ? <Text className="text-[10px] text-gray-500 font-mono">{item.subtitle}</Text> : null}
                  {item.description ? <Text className="text-[10px] text-gray-600 font-mono mt-0.5">{item.description}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    // JONATHAN PATTERSON (Non-ATS)
    if (template === 'jonathan') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 flex-row overflow-hidden" style={styles.previewShadow}>
          {/* Left Sidebar */}
          <View className="w-[35%] bg-slate-100 p-4 pt-6">
            {/* Profile Image with outline */}
            <View className="items-center mb-6">
              {photoInfo ? (
                <View className="w-24 h-24 rounded-full overflow-hidden border-4 mx-auto shadow-md" style={{ borderColor: accentColor }}>
                  <Image source={{ uri: photoInfo.uri }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
                </View>
              ) : (
                <View className="w-24 h-24 rounded-full bg-slate-300 border-4 mx-auto shadow-md items-center justify-center" style={{ borderColor: accentColor }}>
                  <Text className="text-white text-xl font-bold">{personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : 'J'}</Text>
                </View>
              )}
            </View>

            {/* Contact */}
            <View className="mb-5">
              <Text className="text-[10px] font-black uppercase tracking-widest border-b pb-1 mb-2" style={{ color: accentColor, borderColor: accentColor }}>Contact</Text>
              <View className="space-y-1.5">
                {personalInfo.phone ? (
                  <View className="flex-row items-center">
                    <Text className="text-[10px] mr-1.5" style={{ color: accentColor }}>📞</Text>
                    <Text className="text-[9px] text-gray-650" style={{ fontFamily: previewFont }}>{personalInfo.phone}</Text>
                  </View>
                ) : null}
                {personalInfo.email ? (
                  <View className="flex-row items-center">
                    <Text className="text-[10px] mr-1.5" style={{ color: accentColor }}>✉</Text>
                    <Text className="text-[9px] text-gray-650 break-all flex-1" style={{ fontFamily: previewFont }}>{personalInfo.email}</Text>
                  </View>
                ) : null}
                {personalInfo.address ? (
                  <View className="flex-row items-center">
                    <Text className="text-[10px] mr-1.5" style={{ color: accentColor }}>📍</Text>
                    <Text className="text-[9px] text-gray-650" style={{ fontFamily: previewFont }}>{personalInfo.address}</Text>
                  </View>
                ) : null}
                {personalInfo.linkedin ? (
                  <View className="flex-row items-center">
                    <Text className="text-[10px] mr-1.5" style={{ color: accentColor }}>🌐</Text>
                    <Text className="text-[9px] text-gray-650 break-all flex-1" style={{ fontFamily: previewFont }}>{personalInfo.linkedin}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Skills */}
            {skills.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-black uppercase tracking-widest border-b pb-1 mb-2" style={{ color: accentColor, borderColor: accentColor }}>Skills</Text>
                {skills.map((s, i) => (
                  <View key={i} className="flex-row items-center mb-1.5">
                    <View className="w-2 h-2 rounded-full border items-center justify-center mr-1.5 mt-0.5" style={{ borderColor: accentColor }}>
                      <View className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
                    </View>
                    <Text className="text-[9px] text-gray-700 font-bold" style={{ fontFamily: previewFont }}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {showLanguages && languages.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-black uppercase tracking-widest border-b pb-1 mb-2" style={{ color: accentColor, borderColor: accentColor }}>Languages</Text>
                {languages.map((l) => (
                  <View key={l.id} className="flex-row items-center mb-1.5">
                    <View className="w-2 h-2 rounded-full border items-center justify-center mr-1.5 mt-0.5" style={{ borderColor: accentColor }}>
                      <View className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
                    </View>
                    <Text className="text-[9px] text-gray-700 font-bold" style={{ fontFamily: previewFont }}>{l.name} ({l.level})</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-black uppercase tracking-widest border-b pb-1 mb-2" style={{ color: accentColor, borderColor: accentColor }}>Education</Text>
                <View className="border-l border-gray-300 pl-2.5 ml-1 gap-3">
                  {educations.map((edu) => (
                    <View key={edu.id} className="relative">
                      <View className="absolute w-1.5 h-1.5 rounded-full -left-[14.5px] top-1" style={{ backgroundColor: accentColor }} />
                      <Text className="text-[8px] font-extrabold text-gray-800" style={{ fontFamily: previewFont }}>{edu.startDate} - {edu.endDate}</Text>
                      <Text className="text-[9px] font-bold text-gray-700 mt-0.5" style={{ fontFamily: previewFont }}>{edu.school}</Text>
                      <Text className="text-[8.5px] text-gray-500 italic mt-0.5" style={{ fontFamily: previewFont }}>{edu.degree} in {edu.fieldOfStudy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Main Column */}
          <View className="w-[65%] p-4 pt-6 bg-white">
            <View className="mb-5">
              <Text className="text-xl font-bold uppercase" style={{ color: accentColor, fontFamily: previewFont }}>
                {personalInfo.fullName || 'YOUR NAME'}
              </Text>
              {personalInfo.jobTitle ? (
                <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                  {personalInfo.jobTitle}
                </Text>
              ) : null}
              <View className="w-8 h-[2px] mt-2.5" style={{ backgroundColor: accentColor }} />
            </View>

            {summary ? (
              <View className="mb-5">
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-800 mb-1" style={{ color: accentColor }}>Profile</Text>
                <Text className="text-[10.5px] text-gray-650 leading-relaxed text-justify" style={{ fontFamily: previewFont }}>{summary}</Text>
              </View>
            ) : null}

            {/* Experience */}
            {experiences.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-black uppercase tracking-widest text-gray-800 mb-3" style={{ color: accentColor }}>Experience</Text>
                <View className="border-l border-gray-200 pl-3 ml-1.5 gap-3">
                  {experiences.map((exp) => (
                    <View key={exp.id} className="relative">
                      <View className="absolute w-2 h-2 rounded-full border border-white -left-[17.5px] top-1" style={{ backgroundColor: accentColor }} />
                      <View className="flex-row justify-between">
                        <Text className="text-[11px] font-bold text-gray-850" style={{ fontFamily: previewFont }}>{exp.jobTitle}</Text>
                        <Text className="text-[8.5px] text-gray-400 font-medium">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                      </View>
                      <Text className="text-[9.5px] font-semibold text-gray-500 italic mt-0.5">{exp.company} {exp.location ? `• ${exp.location}` : ''}</Text>
                      {exp.description ? <Text className="text-[10.5px] text-gray-600 mt-1 leading-normal" style={{ fontFamily: previewFont }}>{exp.description}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {renderCertificationsPreview(accentColor)}
            {renderAwardsPreview(accentColor)}
            {renderReferencesPreview(accentColor)}
            {renderCustomSectionPreview(accentColor)}
          </View>
        </View>
      );
    }

    // MARIANA SIGNATURE (Non-ATS)
    if (template === 'mariana') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 flex-row overflow-hidden" style={styles.previewShadow}>
          {/* Left Sidebar */}
          <View className="w-[35%] p-4 pt-6" style={{ backgroundColor: accentColor }}>
            {/* Profile Image */}
            <View className="items-center mb-6">
              {photoInfo ? (
                <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 mx-auto shadow-md">
                  <Image source={{ uri: photoInfo.uri }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
                </View>
              ) : (
                <View className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 mx-auto shadow-md items-center justify-center">
                  <Text className="text-white text-xl font-bold">{personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : 'M'}</Text>
                </View>
              )}
            </View>

            {/* Contact */}
            <View className="mb-5">
              <Text className="text-[10px] font-bold uppercase tracking-widest border-b border-white/25 pb-1 text-white">Contact</Text>
              <View className="space-y-2 mt-2">
                {personalInfo.phone ? (
                  <View>
                    <Text className="text-[8px] font-bold text-white/70 uppercase">Phone</Text>
                    <Text className="text-[9px] text-white" style={{ fontFamily: previewFont }}>{personalInfo.phone}</Text>
                  </View>
                ) : null}
                {personalInfo.email ? (
                  <View>
                    <Text className="text-[8px] font-bold text-white/70 uppercase">Email</Text>
                    <Text className="text-[9px] text-white break-all" style={{ fontFamily: previewFont }}>{personalInfo.email}</Text>
                  </View>
                ) : null}
                {personalInfo.address ? (
                  <View>
                    <Text className="text-[8px] font-bold text-white/70 uppercase">Address</Text>
                    <Text className="text-[9px] text-white" style={{ fontFamily: previewFont }}>{personalInfo.address}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Education */}
            {educations.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-widest border-b border-white/25 pb-1 text-white">Education</Text>
                <View className="space-y-2 mt-2">
                  {educations.map((edu) => (
                    <View key={edu.id}>
                      <Text className="text-[8px] text-white/60 font-semibold">{edu.startDate} - {edu.endDate}</Text>
                      <Text className="text-[9px] font-bold text-white" style={{ fontFamily: previewFont }}>{edu.degree} in {edu.fieldOfStudy}</Text>
                      <Text className="text-[8.5px] text-white/85" style={{ fontFamily: previewFont }}>{edu.school}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-widest border-b border-white/25 pb-1 text-white">Expertise</Text>
                <View className="space-y-1 mt-2">
                  {skills.map((s, i) => (
                    <Text key={i} className="text-[9px] text-white" style={{ fontFamily: previewFont }}>• {s}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {showLanguages && languages.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-widest border-b border-white/25 pb-1 text-white">Language</Text>
                <View className="space-y-1.5 mt-2">
                  {languages.map((l) => (
                    <View key={l.id} className="flex-row justify-between items-center">
                      <Text className="text-[9px] text-white font-bold" style={{ fontFamily: previewFont }}>{l.name}</Text>
                      <Text className="text-[8px] text-white/70" style={{ fontFamily: previewFont }}>{l.level}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Main Column */}
          <View className="w-[65%] p-4 pt-6 bg-white">
            <View className="mb-6">
              <Text className="text-2xl font-extrabold text-gray-900 leading-none" style={{ fontFamily: previewFont }}>
                {personalInfo.fullName || 'YOUR NAME'}
              </Text>
              {personalInfo.jobTitle ? (
                <Text className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mt-1">
                  {personalInfo.jobTitle}
                </Text>
              ) : null}
            </View>

            {summary ? (
              <View className="mb-5">
                <Text className="text-[10.5px] text-gray-655 leading-relaxed text-justify" style={{ fontFamily: previewFont }}>{summary}</Text>
              </View>
            ) : null}

            {/* Experience */}
            {experiences.length > 0 && (
              <View className="mb-5">
                <Text className="text-[11px] font-bold text-gray-800 tracking-wide uppercase border-b border-gray-200 pb-1 mb-3">Experience</Text>
                <View className="space-y-3.5">
                  {experiences.map((exp) => (
                    <View key={exp.id} className="relative pl-4 border-l border-gray-200">
                      <View className="absolute w-2 h-2 bg-white border border-gray-500 rounded-full -left-[4.5px] top-1" />
                      <Text className="text-[8px] font-semibold text-gray-400 mb-0.5">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                      <Text className="text-[10px] font-bold text-gray-800" style={{ fontFamily: previewFont }}>{exp.company} {exp.location ? `• ${exp.location}` : ''}</Text>
                      <Text className="text-[9.5px] font-extrabold text-gray-650 uppercase mt-0.5">{exp.jobTitle}</Text>
                      {exp.description ? <Text className="text-[10.5px] text-gray-600 mt-1 leading-normal" style={{ fontFamily: previewFont }}>{exp.description}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {renderCertificationsPreview('#1f2937')}
            {renderAwardsPreview('#1f2937')}
            {renderReferencesPreview('#1f2937')}
            {renderCustomSectionPreview('#1f2937')}
          </View>
        </View>
      );
    }

    // RICHARD STERLING (Non-ATS)
    if (template === 'richard') {
      const getSplitName = (fullName: string) => {
        const trimmed = fullName.trim();
        if (!trimmed) return { first: 'YOUR', last: 'NAME' };
        const parts = trimmed.split(' ');
        if (parts.length === 1) return { first: parts[0], last: '' };
        return {
          first: parts[0],
          last: parts.slice(1).join(' ')
        };
      };
      const nameParts = getSplitName(personalInfo.fullName);

      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 flex-row overflow-hidden" style={styles.previewShadow}>
          {/* Left Sidebar */}
          <View className="w-[35%] p-4 pt-6" style={{ backgroundColor: accentColor }}>
            {/* Profile Image with thin white border */}
            <View className="items-center mb-6">
              {photoInfo ? (
                <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-white mx-auto shadow-md">
                  <Image source={{ uri: photoInfo.uri }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
                </View>
              ) : (
                <View className="w-24 h-24 rounded-full bg-white/10 border-2 border-white mx-auto shadow-md items-center justify-center">
                  <Text className="text-white text-xl font-bold">{personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : 'R'}</Text>
                </View>
              )}
            </View>

            {/* Contact */}
            <View className="mb-5">
              <Text className="text-[10px] font-bold uppercase tracking-wider border-b border-white/20 pb-1.5 text-white">Contact</Text>
              <View className="space-y-2 mt-2">
                {personalInfo.phone ? <Text className="text-[9px] text-white" style={{ fontFamily: previewFont }}>📞 {personalInfo.phone}</Text> : null}
                {personalInfo.email ? <Text className="text-[9px] text-white break-all" style={{ fontFamily: previewFont }}>✉ {personalInfo.email}</Text> : null}
                {personalInfo.address ? <Text className="text-[9px] text-white" style={{ fontFamily: previewFont }}>📍 {personalInfo.address}</Text> : null}
              </View>
            </View>

            {/* Education */}
            {educations.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-wider border-b border-white/20 pb-1.5 text-white">Education</Text>
                <View className="space-y-3 mt-2 pl-2 border-l border-white/20">
                  {educations.map((edu) => (
                    <View key={edu.id} className="relative">
                      <View className="absolute w-1.5 h-1.5 rounded-full bg-white -left-[11.5px] top-1" />
                      <Text className="text-[8px] text-white/70 font-semibold">{edu.startDate} - {edu.endDate}</Text>
                      <Text className="text-[9px] font-bold text-white uppercase" style={{ fontFamily: previewFont }}>{edu.school}</Text>
                      <Text className="text-[8.5px] text-white/90 italic" style={{ fontFamily: previewFont }}>{edu.degree} in {edu.fieldOfStudy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-wider border-b border-white/20 pb-1.5 text-white">Skills</Text>
                <View className="space-y-1.5 mt-2">
                  {skills.map((s, i) => (
                    <Text key={i} className="text-[9px] text-white" style={{ fontFamily: previewFont }}>• {s}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {showLanguages && languages.length > 0 && (
              <View className="mb-5">
                <Text className="text-[10px] font-bold uppercase tracking-wider border-b border-white/20 pb-1.5 text-white">Languages</Text>
                <View className="space-y-1.5 mt-2">
                  {languages.map((l) => (
                    <Text key={l.id} className="text-[9px] text-white" style={{ fontFamily: previewFont }}>• {l.name} ({l.level})</Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Main Column */}
          <View className="w-[65%] p-4 pt-6 bg-white">
            <View className="mb-5 pb-2">
              <Text className="text-2xl uppercase leading-none">
                <Text className="font-extrabold text-gray-900" style={{ fontFamily: previewFont }}>{nameParts.first}</Text>{' '}
                <Text className="font-light text-gray-400" style={{ fontFamily: previewFont }}>{nameParts.last}</Text>
              </Text>
              {personalInfo.jobTitle ? (
                <Text className="text-[9px] font-extrabold uppercase tracking-[0.25em] mt-1" style={{ color: accentColor }}>
                  {personalInfo.jobTitle}
                </Text>
              ) : null}
              <View className="w-8 h-[2px] mt-2.5" style={{ backgroundColor: accentColor }} />
            </View>

            {summary ? (
              <View className="mb-5">
                <Text className="text-[9px] font-black tracking-widest uppercase text-gray-400 mb-1 border-b border-gray-100 pb-0.5">Profile</Text>
                <Text className="text-[10.5px] text-gray-650 leading-relaxed text-justify" style={{ fontFamily: previewFont }}>{summary}</Text>
              </View>
            ) : null}

            {/* Experience */}
            {experiences.length > 0 && (
              <View className="mb-5">
                <Text className="text-[9px] font-black tracking-widest uppercase text-gray-400 mb-3 border-b border-gray-100 pb-0.5">Work Experience</Text>
                <View className="space-y-4 pl-3.5 border-l border-gray-100">
                  {experiences.map((exp) => (
                    <View key={exp.id} className="relative">
                      <View className="absolute w-2 h-2 rounded-full border border-white -left-[19px] top-1" style={{ backgroundColor: accentColor }} />
                      <View className="flex-row justify-between">
                        <Text className="text-[10px] font-extrabold text-gray-800 uppercase" style={{ fontFamily: previewFont }}>{exp.company}</Text>
                        <Text className="text-[8.5px] font-semibold text-gray-400">{exp.startDate} - {exp.current ? 'PRESENT' : exp.endDate}</Text>
                      </View>
                      <Text className="text-[9.5px] font-semibold text-gray-500 italic mt-0.5">{exp.jobTitle} {exp.location ? `• ${exp.location}` : ''}</Text>
                      {exp.description ? <Text className="text-[10.5px] text-gray-600 mt-1 leading-normal" style={{ fontFamily: previewFont }}>{exp.description}</Text> : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {renderCertificationsPreview(accentColor)}
            {renderAwardsPreview(accentColor)}
            {renderReferencesPreview(accentColor)}
            {renderCustomSectionPreview(accentColor)}
          </View>
        </View>
      );
    }

    // 9. MODERN SPLIT (Non-ATS)
    if (template === 'split') {
      return (
        <View className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 flex-row overflow-hidden" style={styles.previewShadow}>
          <View className="w-[40%] bg-slate-800 p-4 pt-6">
            {photoPreview}
            <Text className="text-white text-lg font-bold">{personalInfo.fullName || 'YOUR NAME'}</Text>
            <Text className="text-gray-300 text-[9px] uppercase tracking-wider mb-4">{personalInfo.jobTitle || 'JOB TITLE'}</Text>
            
            <Text className="text-white text-[9px] font-bold border-b border-slate-700 pb-1 mb-2">CONTACT</Text>
            {personalInfo.email && <Text className="text-[8px] text-gray-300 mb-1">{personalInfo.email}</Text>}
            {personalInfo.phone && <Text className="text-[8px] text-gray-300 mb-1">{personalInfo.phone}</Text>}
            
            {skills.length > 0 && (
              <View className="mt-4">
                <Text className="text-white text-[9px] font-bold border-b border-slate-700 pb-1 mb-2">SKILLS</Text>
                <View className="flex-row flex-wrap gap-1">{skills.map((s, i) => (<View key={i} className="bg-slate-600 px-2 py-1 rounded"><Text className="text-white text-[8px] font-bold">{s}</Text></View>))}</View>
              </View>
            )}
            {renderLanguagesPreview('#38bdf8', '#475569', '#64748b', true)}
            {renderWebsitesPreview('#38bdf8', true)}
            {renderHobbiesPreview('#38bdf8', '#475569', '#64748b', true)}
          </View>
          <View className="w-[60%] p-4 pt-6 bg-white">
            {summary ? <View className="mb-4"><Text className="text-gray-900 font-bold border-b border-gray-150 pb-1 text-[10px]">SUMMARY</Text><Text className="text-[11px] text-gray-600 mt-2">{summary}</Text></View> : null}
            {renderExperiencePreview('#1f2937')}
            {renderEducationPreview('#1f2937')}
            {renderCertificationsPreview('#1f2937')}
            {renderAwardsPreview('#1f2937')}
            {renderReferencesPreview('#1f2937')}
            {renderCustomSectionPreview('#1f2937')}
          </View>
        </View>
      );
    }

    // 10. CLASSIC CORPORATE (ATS - Default)
    return (
      <View className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12" style={styles.previewShadow}>
        <View className="items-center mb-6">
          <Text className="text-2xl font-extrabold text-gray-900 text-center mb-1">{personalInfo.fullName || 'YOUR NAME'}</Text>
          <Text className="text-xs font-bold text-blue-600 uppercase tracking-widest text-center mb-3">{personalInfo.jobTitle || 'PROFESSIONAL TITLE'}</Text>
          {renderContactDetails()}
        </View>
        <View className="border-b border-gray-100 mb-5" />
        {summary ? (
          <View className="mb-5">
            <Text className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider mb-2">Professional Summary</Text>
            <Text className="text-xs text-gray-600 leading-relaxed text-justify">{summary}</Text>
            <View className="border-b border-gray-100 mt-4" />
          </View>
        ) : null}
        {renderExperiencePreview('#2563eb')}
        {renderEducationPreview('#2563eb')}
        {renderSkillsPreview(accentColor, hexToRgba(accentColor, 0.08), hexToRgba(accentColor, 0.2))}
        {renderLanguagesPreview(accentColor, hexToRgba(accentColor, 0.08), hexToRgba(accentColor, 0.2))}
        {renderCertificationsPreview(accentColor)}
        {renderAwardsPreview(accentColor)}
        {renderWebsitesPreview(accentColor)}
        {renderReferencesPreview(accentColor)}
        {renderHobbiesPreview(accentColor, hexToRgba(accentColor, 0.08), hexToRgba(accentColor, 0.2))}
        {renderCustomSectionPreview(accentColor)}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. Header Bar */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center border border-gray-200 rounded-full px-4 py-2 bg-white"
        >
          <Ionicons name="chevron-back" size={14} color="#4B5563" />
          <Text className="text-xs font-bold text-gray-500 ml-1">BACK</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleDownload} 
          className="flex-row items-center bg-[#2563EB] rounded-full px-5 py-2.5"
          style={{
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Ionicons name="download-outline" size={16} color="white" />
          <Text className="text-xs font-bold text-white ml-1.5">DOWNLOAD</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* 2. Switcher */}
        <View className="px-6 py-4 bg-white border-b border-gray-50">
          <View className="bg-gray-100 p-1 rounded-2xl flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => setActiveMode('edit')}
              className={activeMode === 'edit' ? "flex-1 py-3 items-center rounded-xl bg-white" : "flex-1 py-3 items-center rounded-xl"}
              style={activeMode === 'edit' ? styles.tabActiveShadow : undefined}
            >
              <Text className={activeMode === 'edit' ? "font-bold text-sm text-gray-900" : "font-bold text-sm text-gray-400"}>Edit Form</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setActiveMode('preview')}
              className={activeMode === 'preview' ? "flex-1 py-3 items-center rounded-xl bg-white" : "flex-1 py-3 items-center rounded-xl"}
              style={activeMode === 'preview' ? styles.tabActiveShadow : undefined}
            >
              <Text className={activeMode === 'preview' ? "font-bold text-sm text-gray-900" : "font-bold text-sm text-gray-400"}>Live Preview</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeMode === 'edit' ? (
          <View className="flex-1 bg-white">
            {/* 3. Horizontal Scrollable Tabs */}
            <View className="px-6 py-3 border-b border-gray-100 bg-white">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      className={isActive ? "py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-100" : "py-2.5 px-4 rounded-xl border border-transparent"}
                      style={isActive ? styles.tabHeaderShadow : undefined}
                    >
                      <Text className={isActive ? "text-xs font-bold tracking-wide text-blue-600" : "text-xs font-bold tracking-wide text-gray-400"}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. Form Panels */}
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
              
              {/* TAB: PERSONAL */}
              {activeTab === 'PERSONAL' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Personal Details</Text>
                  
                  {/* Photo upload picker (visible for non-ATS templates only) */}
                  {!isAtsTemplate && (
                    <View className="mb-6 bg-slate-50 border border-slate-100 rounded-3xl p-5 items-center">
                      <Text className="text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase">Profile Photo</Text>
                      <View className="flex-row items-center gap-5">
                        {photoInfo ? (
                          <Image 
                            source={{ uri: photoInfo.uri }} 
                            className="w-20 h-20 rounded-full border border-gray-250 bg-gray-200" 
                          />
                        ) : (
                          <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center border border-dashed border-gray-300">
                            <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                          </View>
                        )}
                        <View className="gap-2">
                          <TouchableOpacity 
                            onPress={pickImage}
                            className="bg-blue-600 px-4 py-2 rounded-xl"
                          >
                            <Text className="text-white text-xs font-bold">Upload Photo</Text>
                          </TouchableOpacity>
                          {photoInfo && (
                            <TouchableOpacity 
                              onPress={() => setPhotoInfo(null)}
                              className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl"
                            >
                              <Text className="text-red-600 text-xs font-bold">Remove</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">FULL NAME</Text>
                    <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" placeholder="e.g. John Doe" placeholderTextColor="#9CA3AF" value={personalInfo.fullName} onChangeText={t => setPersonalInfo({...personalInfo, fullName: t})} />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">JOB TITLE</Text>
                    <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" placeholder="e.g. Software Engineer" placeholderTextColor="#9CA3AF" value={personalInfo.jobTitle} onChangeText={t => setPersonalInfo({...personalInfo, jobTitle: t})} />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">EMAIL</Text>
                    <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" placeholder="john@example.com" placeholderTextColor="#9CA3AF" value={personalInfo.email} onChangeText={t => setPersonalInfo({...personalInfo, email: t})} keyboardType="email-address" autoCapitalize="none" />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">PHONE</Text>
                    <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" placeholder="+1 234 567 890" placeholderTextColor="#9CA3AF" value={personalInfo.phone} onChangeText={t => setPersonalInfo({...personalInfo, phone: t})} keyboardType="phone-pad" />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">ADDRESS</Text>
                    <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" placeholder="City, Country" placeholderTextColor="#9CA3AF" value={personalInfo.address} onChangeText={t => setPersonalInfo({...personalInfo, address: t})} />
                  </View>

                  <View className="flex-row justify-between gap-4">
                    <View className="flex-1 mb-4">
                      <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">LINKEDIN URL</Text>
                      <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium text-sm" placeholder="linkedin.com/in/johndoe" placeholderTextColor="#9CA3AF" value={personalInfo.linkedin} onChangeText={t => setPersonalInfo({...personalInfo, linkedin: t})} autoCapitalize="none" />
                    </View>
                    <View className="flex-1 mb-4">
                      <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">GITHUB URL</Text>
                      <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium text-sm" placeholder="github.com/johndoe" placeholderTextColor="#9CA3AF" value={personalInfo.github} onChangeText={t => setPersonalInfo({...personalInfo, github: t})} autoCapitalize="none" />
                    </View>
                  </View>

                  <View className="flex-row justify-end mt-8">
                    <TouchableOpacity onPress={() => setActiveTab('EXPERIENCE')} className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center" style={styles.nextShadow}>
                      <Text className="text-white font-bold text-sm">Next: Experience</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: EXPERIENCE */}
              {activeTab === 'EXPERIENCE' && (
                <View className="pb-10">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-extrabold text-gray-900">Experience</Text>
                    <TouchableOpacity 
                      onPress={addExperience} 
                      className="flex-row items-center bg-blue-50 border border-blue-100 rounded-full px-4 py-2"
                    >
                      <Ionicons name="add" size={16} color="#2563eb" />
                      <Text className="text-blue-600 font-bold text-xs ml-1">Add Experience</Text>
                    </TouchableOpacity>
                  </View>

                  {experiences.map((exp, index) => (
                    <View key={exp.id} className="mb-6 bg-white border border-gray-150 rounded-3xl p-5" style={styles.previewShadow}>
                      <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <Text className="font-extrabold text-gray-800">Experience {index + 1}</Text>
                        <TouchableOpacity onPress={() => removeExperience(exp.id)} className="p-1">
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      
                      <View className="space-y-4 gap-3">
                        <View className="flex-row gap-4">
                          <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Company</Text>
                            <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Google" placeholderTextColor="#9CA3AF" value={exp.company} onChangeText={t => updateExperience(exp.id, 'company', t)} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Position</Text>
                            <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Senior Developer" placeholderTextColor="#9CA3AF" value={exp.jobTitle} onChangeText={t => updateExperience(exp.id, 'jobTitle', t)} />
                          </View>
                        </View>

                        <View className="flex-row gap-4 items-end">
                          <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Start Date</Text>
                            <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Jan 2020" placeholderTextColor="#9CA3AF" value={exp.startDate} onChangeText={t => updateExperience(exp.id, 'startDate', t)} />
                          </View>
                          <View className="flex-1">
                            <TouchableOpacity 
                              onPress={() => updateExperience(exp.id, 'current', !exp.current)}
                              className="flex-row items-center mb-2"
                            >
                              <View className={`w-4 h-4 border border-gray-300 rounded mr-2 items-center justify-center ${exp.current ? 'bg-blue-600 border-blue-600' : 'bg-white'}`}>
                                {exp.current && <Ionicons name="checkmark" size={12} color="white" />}
                              </View>
                              <Text className="text-[10px] font-bold text-gray-500 uppercase">CURRENT</Text>
                            </TouchableOpacity>

                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">End Date</Text>
                            <TextInput 
                              className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" 
                              placeholder="e.g. Present" 
                              placeholderTextColor="#9CA3AF" 
                              value={exp.current ? 'Present' : exp.endDate} 
                              onChangeText={t => updateExperience(exp.id, 'endDate', t)} 
                              editable={!exp.current} 
                            />
                          </View>
                        </View>

                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Location</Text>
                          <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. New York, NY" placeholderTextColor="#9CA3AF" value={exp.location} onChangeText={t => updateExperience(exp.id, 'location', t)} />
                        </View>

                        <View>
                          <View className="flex-row justify-between items-center mb-1.5">
                            <Text className="text-[10px] font-bold text-gray-500 uppercase">Description (comma separated points)</Text>
                            <TouchableOpacity 
                              onPress={() => generateExperienceWithAI(exp.id)}
                              disabled={generatingExperienceId !== null}
                              className={`flex-row items-center px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 ${generatingExperienceId !== null ? 'opacity-60' : ''}`}
                            >
                              {generatingExperienceId === exp.id ? (
                                <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 4 }} />
                              ) : (
                                <Ionicons name="sparkles-outline" size={12} color="#2563EB" style={{ marginRight: 4 }} />
                              )}
                              <Text className="text-blue-600 font-bold text-[10px]">
                                {generatingExperienceId === exp.id ? 'Generating...' : 'AI Generate'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <TextInput 
                            className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium min-h-[100px]" 
                            placeholder="Led a team of 5 developers..., Implemented CI/CD pipelines..." 
                            placeholderTextColor="#9CA3AF"
                            value={exp.description} 
                            onChangeText={t => updateExperience(exp.id, 'description', t)} 
                            multiline 
                            textAlignVertical="top" 
                          />
                          <Text className="text-[9px] text-gray-400 mt-1 leading-normal">
                            For best results in preview, separate bullet points with commas or write one continuous paragraph depending on template.
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  {experiences.length === 0 && (
                    <TouchableOpacity onPress={addExperience} className="flex-row items-center justify-center py-8 bg-blue-50 rounded-2xl border border-blue-100 border-dashed mb-6">
                      <Ionicons name="add" size={20} color="#2563eb" />
                      <Text className="text-blue-600 font-bold ml-2">Add Experience Record</Text>
                    </TouchableOpacity>
                  )}

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('PERSONAL')} className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1">
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} /><Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('EDUCATION')} className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1" style={styles.nextShadow}>
                      <Text className="text-white font-bold text-sm">Next: Education</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: EDUCATION */}
              {activeTab === 'EDUCATION' && (
                <View className="pb-10">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-extrabold text-gray-900">Education</Text>
                    <TouchableOpacity 
                      onPress={addEducation} 
                      className="flex-row items-center bg-blue-50 border border-blue-100 rounded-full px-4 py-2"
                    >
                      <Ionicons name="add" size={16} color="#2563eb" />
                      <Text className="text-blue-600 font-bold text-xs ml-1">Add Education</Text>
                    </TouchableOpacity>
                  </View>

                  {educations.map((edu, index) => (
                    <View key={edu.id} className="mb-6 bg-white border border-gray-150 rounded-3xl p-5" style={styles.previewShadow}>
                      <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <Text className="font-extrabold text-gray-800">Education {index + 1}</Text>
                        <TouchableOpacity onPress={() => removeEducation(edu.id)} className="p-1">
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      <View className="space-y-4 gap-3">
                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Institution</Text>
                          <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Harvard University" placeholderTextColor="#9CA3AF" value={edu.school} onChangeText={t => updateEducation(edu.id, 'school', t)} />
                        </View>

                        <View className="flex-row gap-4">
                          <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Degree</Text>
                            <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Bachelor of Science" placeholderTextColor="#9CA3AF" value={edu.degree} onChangeText={t => updateEducation(edu.id, 'degree', t)} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Field of Study</Text>
                            <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Computer Science" placeholderTextColor="#9CA3AF" value={edu.fieldOfStudy} onChangeText={t => updateEducation(edu.id, 'fieldOfStudy', t)} />
                          </View>
                        </View>

                        <View className="flex-row gap-4 items-end">
                          <View className="flex-1">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Start Date</Text>
                            <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. Sep 2018" placeholderTextColor="#9CA3AF" value={edu.startDate} onChangeText={t => updateEducation(edu.id, 'startDate', t)} />
                          </View>
                          <View className="flex-1">
                            <TouchableOpacity 
                              onPress={() => updateEducation(edu.id, 'current', !edu.current)}
                              className="flex-row items-center mb-2"
                            >
                              <View className={`w-4 h-4 border border-gray-300 rounded mr-2 items-center justify-center ${edu.current ? 'bg-blue-600 border-blue-600' : 'bg-white'}`}>
                                {edu.current && <Ionicons name="checkmark" size={12} color="white" />}
                              </View>
                              <Text className="text-[10px] font-bold text-gray-500 uppercase">CURRENT</Text>
                            </TouchableOpacity>

                            <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">End Date</Text>
                            <TextInput 
                              className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" 
                              placeholder="e.g. May 2022" 
                              placeholderTextColor="#9CA3AF" 
                              value={edu.current ? 'Present' : edu.endDate} 
                              onChangeText={t => updateEducation(edu.id, 'endDate', t)} 
                              editable={!edu.current}
                            />
                          </View>
                        </View>

                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Score / GPA (Optional)</Text>
                          <TextInput className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3.5 text-gray-900 font-medium" placeholder="e.g. 3.8/4.0" placeholderTextColor="#9CA3AF" value={edu.gpa} onChangeText={t => updateEducation(edu.id, 'gpa', t)} />
                        </View>
                      </View>
                    </View>
                  ))}

                  {educations.length === 0 && (
                    <TouchableOpacity onPress={addEducation} className="flex-row items-center justify-center py-8 bg-blue-50 rounded-2xl border border-blue-100 border-dashed mb-6">
                      <Ionicons name="add" size={20} color="#2563eb" />
                      <Text className="text-blue-600 font-bold ml-2">Add Education Record</Text>
                    </TouchableOpacity>
                  )}

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('EXPERIENCE')} className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1">
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} /><Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('SKILLS')} className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1" style={styles.nextShadow}>
                      <Text className="text-white font-bold text-sm">Next: Skills</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: SKILLS */}
              {activeTab === 'SKILLS' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Skills</Text>
                  
                  <View className="mb-6">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide uppercase">Add a Skill</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="e.g. React.js (Press Enter to add)" 
                      placeholderTextColor="#9CA3AF"
                      value={newSkill} 
                      onChangeText={setNewSkill} 
                      onSubmitEditing={addSkill} 
                    />
                  </View>

                  {skills.length > 0 ? (
                    <View className="flex-row flex-wrap gap-2 mb-8">
                      {skills.map((skill, index) => (
                        <View key={index} className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full flex-row items-center">
                          <Text className="text-blue-800 font-bold text-xs mr-2">{skill}</Text>
                          <TouchableOpacity onPress={() => removeSkill(index)}><Ionicons name="close-circle" size={16} color="#1d4ed8" /></TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-gray-400 italic text-sm mb-8">No skills added yet.</Text>
                  )}

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('EDUCATION')} className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1">
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} /><Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('SUMMARY')} className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1" style={styles.nextShadow}>
                      <Text className="text-white font-bold text-sm">Next: Summary</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: SUMMARY */}
              {activeTab === 'SUMMARY' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Professional Summary</Text>
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-xs font-extrabold text-gray-500 tracking-wide uppercase flex-1 mr-2">
                        Write a short summary about your professional background and goals.
                      </Text>
                      <TouchableOpacity 
                        onPress={() => generateSummaryWithAI()}
                        disabled={isGeneratingSummary}
                        className={`flex-row items-center px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-100 ${isGeneratingSummary ? 'opacity-60' : ''}`}
                      >
                        {isGeneratingSummary ? (
                          <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 6 }} />
                        ) : (
                          <Ionicons name="sparkles-outline" size={14} color="#2563EB" style={{ marginRight: 6 }} />
                        )}
                        <Text className="text-blue-600 font-bold text-xs">
                          {isGeneratingSummary ? 'Generating...' : 'Generate with AI'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium min-h-[160px]" 
                      placeholder="Experienced software engineer with a passion for building scalable web applications..." 
                      placeholderTextColor="#9CA3AF"
                      value={summary} 
                      onChangeText={setSummary} 
                      multiline 
                      textAlignVertical="top" 
                    />
                  </View>
                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('SKILLS')} className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1">
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} /><Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('ADD')} className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1" style={styles.nextShadow}>
                      <Text className="text-white font-bold text-sm">Next: Additional Sections</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
 
              {/* TAB: ADD (Additional Sections) */}
              {activeTab === 'ADD' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-2">Additional Sections</Text>
                  <Text className="text-sm text-gray-500 mb-6">
                    Add certifications, languages, awards, or any extra details you want recruiters to see.
                  </Text>

                  {/* GRID OF TOGGLES */}
                  <View className="flex-row flex-wrap justify-between mb-6">
                    {/* CARD: Languages */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowLanguages(!showLanguages);
                        if (!showLanguages && languages.length === 0) {
                          setLanguages([{ id: Date.now().toString(), name: '', level: '' }]);
                        }
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showLanguages ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="globe-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>Languages</Text>
                      </View>
                      <Ionicons 
                        name={showLanguages ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showLanguages ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>

                    {/* CARD: Certifications */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowCertifications(!showCertifications);
                        if (!showCertifications && certifications.length === 0) {
                          setCertifications([{ id: Date.now().toString(), name: '', issuer: '', date: '' }]);
                        }
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showCertifications ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="ribbon-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>Certifications and licenses</Text>
                      </View>
                      <Ionicons 
                        name={showCertifications ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showCertifications ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>

                    {/* CARD: Awards */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowAwards(!showAwards);
                        if (!showAwards && awards.length === 0) {
                          setAwards([{ id: Date.now().toString(), title: '', issuer: '', date: '', description: '' }]);
                        }
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showAwards ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="trophy-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>Awards and honors</Text>
                      </View>
                      <Ionicons 
                        name={showAwards ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showAwards ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>

                    {/* CARD: Websites */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowWebsites(!showWebsites);
                        if (!showWebsites && websites.length === 0) {
                          setWebsites([{ id: Date.now().toString(), label: '', url: '' }]);
                        }
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showWebsites ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="link-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>Websites and social media</Text>
                      </View>
                      <Ionicons 
                        name={showWebsites ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showWebsites ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>

                    {/* CARD: References */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowReferences(!showReferences);
                        if (!showReferences && references.length === 0) {
                          setReferences([{ id: Date.now().toString(), name: '', relationship: '', company: '', email: '', phone: '' }]);
                        }
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showReferences ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="people-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>References</Text>
                      </View>
                      <Ionicons 
                        name={showReferences ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showReferences ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>

                    {/* CARD: Hobbies */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowHobbies(!showHobbies);
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showHobbies ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="game-controller-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>Hobbies and interests</Text>
                      </View>
                      <Ionicons 
                        name={showHobbies ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showHobbies ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>

                    {/* CARD: Custom Section */}
                    <TouchableOpacity 
                      onPress={() => {
                        setShowCustomSection(!showCustomSection);
                        if (!showCustomSection && customSectionItems.length === 0) {
                          setCustomSectionItems([{ id: Date.now().toString(), title: '', subtitle: '', description: '' }]);
                        }
                      }}
                      className={`w-[48%] border rounded-3xl p-4 mb-4 flex-row items-center justify-between bg-white ${showCustomSection ? 'border-blue-500' : 'border-gray-200'}`}
                      style={styles.previewShadow}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                          <Ionicons name="grid-outline" size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-xs font-bold text-gray-800 flex-1 pr-1" numberOfLines={2}>Custom section</Text>
                      </View>
                      <Ionicons 
                        name={showCustomSection ? "checkmark-circle" : "add"} 
                        size={18} 
                        color={showCustomSection ? "#3B82F6" : "#9CA3AF"} 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* ACTIVE FORMS SECTION */}
                  <View className="mt-4">
                    {/* LANGUAGES FORM */}
                    {showLanguages && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="globe-outline" size={20} color="#3B82F6" />
                            <Text className="text-base font-bold text-gray-800">Languages</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowLanguages(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {languages.map((lang, index) => (
                          <View key={lang.id} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-xs font-bold text-gray-500">Language #{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeLanguage(lang.id)}>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            <View className="flex-row gap-3">
                              <View className="flex-1">
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">LANGUAGE</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. French" 
                                  placeholderTextColor="#9CA3AF"
                                  value={lang.name} 
                                  onChangeText={t => updateLanguage(lang.id, 'name', t)} 
                                />
                              </View>
                              <View className="flex-1">
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">PROFICIENCY</Text>
                                <TextInput 
                                  className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Fluent / C1" 
                                  placeholderTextColor="#9CA3AF"
                                  value={lang.level} 
                                  onChangeText={t => updateLanguage(lang.id, 'level', t)} 
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                        <TouchableOpacity 
                          onPress={addLanguage}
                          className="py-3 bg-blue-50 border border-blue-100 rounded-2xl items-center justify-center flex-row"
                        >
                          <Ionicons name="add" size={16} color="#3B82F6" />
                          <Text className="text-blue-600 font-bold text-xs ml-1">Add Language</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* CERTIFICATIONS FORM */}
                    {showCertifications && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="ribbon-outline" size={20} color="#3B82F6" />
                            <Text className="text-base font-bold text-gray-800">Certifications and licenses</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowCertifications(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {certifications.map((cert, index) => (
                          <View key={cert.id} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-xs font-bold text-gray-500">Certification #{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeCertification(cert.id)}>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            <View className="space-y-3">
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">CERTIFICATE NAME</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. AWS Certified Solutions Architect" 
                                  placeholderTextColor="#9CA3AF"
                                  value={cert.name} 
                                  onChangeText={t => updateCertification(cert.id, 'name', t)} 
                                />
                              </View>
                              <View className="flex-row gap-3">
                                <View className="flex-[2]">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">ISSUER / ORGANIZATION</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="e.g. Amazon Web Services" 
                                    placeholderTextColor="#9CA3AF"
                                    value={cert.issuer} 
                                    onChangeText={t => updateCertification(cert.id, 'issuer', t)} 
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">YEAR</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="e.g. 2024" 
                                    placeholderTextColor="#9CA3AF"
                                    value={cert.date} 
                                    onChangeText={t => updateCertification(cert.id, 'date', t)} 
                                  />
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                        <TouchableOpacity 
                          onPress={addCertification}
                          className="py-3 bg-blue-50 border border-blue-100 rounded-2xl items-center justify-center flex-row"
                        >
                          <Ionicons name="add" size={16} color="#3B82F6" />
                          <Text className="text-blue-600 font-bold text-xs ml-1">Add Certification</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* AWARDS FORM */}
                    {showAwards && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="trophy-outline" size={20} color="#3B82F6" />
                            <Text className="text-base font-bold text-gray-800">Awards and honors</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowAwards(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {awards.map((aw, index) => (
                          <View key={aw.id} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-xs font-bold text-gray-500">Award #{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeAward(aw.id)}>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            <View className="space-y-3">
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">AWARD TITLE</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Employee of the Year" 
                                  placeholderTextColor="#9CA3AF"
                                  value={aw.title} 
                                  onChangeText={t => updateAward(aw.id, 'title', t)} 
                                />
                              </View>
                              <View className="flex-row gap-3">
                                <View className="flex-[2]">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">ISSUING ENTITY</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="e.g. Acme Corporation" 
                                    placeholderTextColor="#9CA3AF"
                                    value={aw.issuer} 
                                    onChangeText={t => updateAward(aw.id, 'issuer', t)} 
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">YEAR</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="e.g. 2023" 
                                    placeholderTextColor="#9CA3AF"
                                    value={aw.date} 
                                    onChangeText={t => updateAward(aw.id, 'date', t)} 
                                  />
                                </View>
                              </View>
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">DESCRIPTION / DETAILS</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Selected from over 200 staff..." 
                                  placeholderTextColor="#9CA3AF"
                                  value={aw.description} 
                                  onChangeText={t => updateAward(aw.id, 'description', t)} 
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                        <TouchableOpacity 
                          onPress={addAward}
                          className="py-3 bg-blue-50 border border-blue-100 rounded-2xl items-center justify-center flex-row"
                        >
                          <Ionicons name="add" size={16} color="#3B82F6" />
                          <Text className="text-blue-600 font-bold text-xs ml-1">Add Award</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* WEBSITES FORM */}
                    {showWebsites && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="link-outline" size={20} color="#3B82F6" />
                            <Text className="text-base font-bold text-gray-800">Websites and social media</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowWebsites(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {websites.map((web, index) => (
                          <View key={web.id} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-xs font-bold text-gray-500">Link #{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeWebsite(web.id)}>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            <View className="flex-row gap-3">
                              <View className="flex-1">
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">PLATFORM / LABEL</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Portfolio" 
                                  placeholderTextColor="#9CA3AF"
                                  value={web.label} 
                                  onChangeText={t => updateWebsite(web.id, 'label', t)} 
                                />
                              </View>
                              <View className="flex-[2]">
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">URL</Text>
                                <TextInput 
                                  className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. portfolio.com" 
                                  placeholderTextColor="#9CA3AF"
                                  value={web.url} 
                                  onChangeText={t => updateWebsite(web.id, 'url', t)} 
                                  autoCapitalize="none"
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                        <TouchableOpacity 
                          onPress={addWebsite}
                          className="py-3 bg-blue-50 border border-blue-100 rounded-2xl items-center justify-center flex-row"
                        >
                          <Ionicons name="add" size={16} color="#3B82F6" />
                          <Text className="text-blue-600 font-bold text-xs ml-1">Add Web Link</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* REFERENCES FORM */}
                    {showReferences && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="people-outline" size={20} color="#3B82F6" />
                            <Text className="text-base font-bold text-gray-800">References</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowReferences(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {references.map((ref, index) => (
                          <View key={ref.id} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-xs font-bold text-gray-500">Reference #{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeReference(ref.id)}>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            <View className="space-y-3">
                              <View className="flex-row gap-3">
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">FULL NAME</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="e.g. Jane Smith" 
                                    placeholderTextColor="#9CA3AF"
                                    value={ref.name} 
                                    onChangeText={t => updateReference(ref.id, 'name', t)} 
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">RELATIONSHIP</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="e.g. Manager" 
                                    placeholderTextColor="#9CA3AF"
                                    value={ref.relationship} 
                                    onChangeText={t => updateReference(ref.id, 'relationship', t)} 
                                  />
                                </View>
                              </View>
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">COMPANY</Text>
                                <TextInput 
                                  className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Google LLC" 
                                  placeholderTextColor="#9CA3AF"
                                  value={ref.company} 
                                  onChangeText={t => updateReference(ref.id, 'company', t)} 
                                />
                              </View>
                              <View className="flex-row gap-3">
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">EMAIL</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="janesmith@google.com" 
                                    placeholderTextColor="#9CA3AF"
                                    value={ref.email} 
                                    onChangeText={t => updateReference(ref.id, 'email', t)} 
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                  />
                                </View>
                                <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-gray-400 mb-1">PHONE</Text>
                                  <TextInput 
                                    className="bg-white border border-gray-255 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                    placeholder="+1 555 123 456" 
                                    placeholderTextColor="#9CA3AF"
                                    value={ref.phone} 
                                    onChangeText={t => updateReference(ref.id, 'phone', t)} 
                                    keyboardType="phone-pad"
                                  />
                                </View>
                              </View>
                            </View>
                          </View>
                        ))}
                        <TouchableOpacity 
                          onPress={addReference}
                          className="py-3 bg-blue-50 border border-blue-100 rounded-2xl items-center justify-center flex-row"
                        >
                          <Ionicons name="add" size={16} color="#3B82F6" />
                          <Text className="text-blue-600 font-bold text-xs ml-1">Add Reference</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* HOBBIES AND INTERESTS FORM */}
                    {showHobbies && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="game-controller-outline" size={20} color="#3B82F6" />
                            <Text className="text-base font-bold text-gray-800">Hobbies and interests</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowHobbies(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                          <Text className="text-xs font-bold text-gray-450 mb-2">ADD A HOBBY</Text>
                          <View className="flex-row gap-2">
                            <TextInput 
                              className="flex-1 bg-white border border-gray-250 rounded-2xl px-4 py-3 text-sm text-gray-900 font-medium" 
                              placeholder="e.g. Photography (Press Add)" 
                              placeholderTextColor="#9CA3AF"
                              value={newHobby} 
                              onChangeText={setNewHobby} 
                              onSubmitEditing={addHobby} 
                            />
                            <TouchableOpacity onPress={addHobby} className="bg-blue-600 px-5 py-3 rounded-2xl justify-center">
                              <Text className="text-white text-xs font-bold">Add</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {hobbies.length > 0 ? (
                          <View className="flex-row flex-wrap gap-2">
                            {hobbies.map((hobby, index) => (
                              <View key={index} className="bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full flex-row items-center">
                                <Text className="text-blue-800 font-bold text-xs mr-2">{hobby}</Text>
                                <TouchableOpacity onPress={() => removeHobby(index)}>
                                  <Ionicons name="close-circle" size={14} color="#1d4ed8" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text className="text-gray-400 italic text-xs">No hobbies added yet.</Text>
                        )}
                      </View>
                    )}

                    {/* CUSTOM SECTION FORM */}
                    {showCustomSection && (
                      <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white shadow-sm">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <View className="flex-row items-center gap-3">
                            <Ionicons name="grid-outline" size={20} color="#3B82F6" />
                            <TextInput 
                              className="text-base font-bold text-gray-800 border-b border-dashed border-gray-300 min-w-[150px] pb-0.5" 
                              value={customSectionTitle} 
                              onChangeText={setCustomSectionTitle} 
                              placeholder="Custom Section Title"
                            />
                          </View>
                          <TouchableOpacity onPress={() => setShowCustomSection(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                          </TouchableOpacity>
                        </View>

                        {customSectionItems.map((item, index) => (
                          <View key={item.id} className="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-xs font-bold text-gray-500">Item #{index + 1}</Text>
                              <TouchableOpacity onPress={() => removeCustomSectionItem(item.id)}>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                            
                            <View className="space-y-3 gap-2">
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">TITLE</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Project Name / Volunteer Role" 
                                  placeholderTextColor="#9CA3AF"
                                  value={item.title} 
                                  onChangeText={t => updateCustomSectionItem(item.id, 'title', t)} 
                                />
                              </View>
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">SUBTITLE / DATE</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Red Cross (2020 - 2022)" 
                                  placeholderTextColor="#9CA3AF"
                                  value={item.subtitle} 
                                  onChangeText={t => updateCustomSectionItem(item.id, 'subtitle', t)} 
                                />
                              </View>
                              <View>
                                <Text className="text-[10px] font-bold text-gray-400 mb-1">DESCRIPTION</Text>
                                <TextInput 
                                  className="bg-white border border-gray-250 rounded-xl px-3 py-2 text-sm text-gray-800" 
                                  placeholder="e.g. Key achievements and duties..." 
                                  placeholderTextColor="#9CA3AF"
                                  value={item.description} 
                                  onChangeText={t => updateCustomSectionItem(item.id, 'description', t)} 
                                  multiline
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                        <TouchableOpacity 
                          onPress={addCustomSectionItem}
                          className="py-3 bg-blue-50 border border-blue-100 rounded-2xl items-center justify-center flex-row"
                        >
                          <Ionicons name="add" size={16} color="#3B82F6" />
                          <Text className="text-blue-600 font-bold text-xs ml-1">Add Custom Item</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('SUMMARY')} className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1">
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} /><Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('LAYOUT')} className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1" style={styles.nextShadow}>
                      <Text className="text-white font-bold text-sm">Next: Layout Configuration</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: LAYOUT */}
              {activeTab === 'LAYOUT' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Layout Configuration</Text>

                  {/* ACCENT COLOR */}
                  <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white" style={styles.previewShadow}>
                    <View className="flex-row justify-between items-center mb-4">
                      <View className="flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
                          <Ionicons name="color-palette-outline" size={18} color="#EF4444" />
                        </View>
                        <Text className="text-base font-bold text-gray-800">Accent Theme Color</Text>
                      </View>
                      <View className="bg-gray-100 rounded-full px-3 py-1 flex-row items-center gap-1.5 border border-gray-200">
                        <View className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: accentColor }} />
                        <Text className="text-[10px] font-mono font-bold text-gray-500 uppercase">{accentColor}</Text>
                      </View>
                    </View>

                    <View className="flex-row flex-wrap gap-2.5 mb-2">
                      {[
                        '#00A3FF', // Blue
                        '#6366F1', // Indigo
                        '#10B981', // Teal
                        '#F43F5E', // Rose
                        '#F59E0B', // Orange
                        '#8B5CF6', // Purple
                        '#3B82F6', // Royal Blue
                        '#374151', // Slate
                        '#000000', // Black
                      ].map(color => {
                        const isSelected = accentColor === color && !showCustomColorInput;
                        return (
                          <TouchableOpacity
                            key={color}
                            onPress={() => {
                              setAccentColor(color);
                              setShowCustomColorInput(false);
                            }}
                            className="w-12 h-12 rounded-2xl items-center justify-center border border-gray-200"
                            style={{ backgroundColor: color }}
                          >
                            {isSelected && <Ionicons name="checkmark" size={18} color="white" />}
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        onPress={() => {
                          setShowCustomColorInput(true);
                          setAccentColor(customColorText);
                        }}
                        className={`px-4 py-3 rounded-2xl border items-center justify-center ${showCustomColorInput ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 bg-white'}`}
                      >
                        <Text className={`text-xs font-bold ${showCustomColorInput ? 'text-blue-600' : 'text-gray-500'}`}>CUSTOM</Text>
                      </TouchableOpacity>
                    </View>

                    {showCustomColorInput && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase">ENTER CUSTOM HEX COLOR</Text>
                        <View className="flex-row items-center gap-3">
                          <View className="w-10 h-10 rounded-xl border border-gray-200" style={{ backgroundColor: customColorText }} />
                          <TextInput
                            className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-3 py-3 text-sm text-gray-800 font-mono"
                            placeholder="#00A3FF"
                            placeholderTextColor="#9CA3AF"
                            value={customColorText}
                            onChangeText={t => {
                              setCustomColorText(t);
                              if (t.match(/^#[0-9A-Fa-f]{6}$/)) {
                                setAccentColor(t);
                              }
                            }}
                            maxLength={7}
                            autoCapitalize="none"
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* SPACING */}
                  <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white" style={styles.previewShadow}>
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                        <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
                      </View>
                      <Text className="text-base font-bold text-gray-800">Margins & Document Spacing</Text>
                    </View>

                    <View className="flex-row gap-3">
                      {[
                        { id: 'compact', label: 'Compact', desc: '0.4in margins', padding: 'p-1' },
                        { id: 'normal', label: 'Normal', desc: '0.6in margins', padding: 'p-2' },
                        { id: 'loose', label: 'Loose', desc: '0.8in margins', padding: 'p-3' }
                      ].map(opt => {
                        const isSelected = marginSize === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            onPress={() => setMarginSize(opt.id as any)}
                            className={`flex-1 p-4 rounded-2xl border items-center justify-center bg-white ${isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}
                            style={isSelected ? styles.tabActiveShadow : undefined}
                          >
                            {/* Inner Visual Representation of Margin */}
                            <View className="w-12 h-12 border border-gray-200 rounded-lg bg-gray-50 items-center justify-center mb-3">
                              <View className={`w-10 h-10 border border-dashed border-blue-300 rounded ${opt.padding} bg-white`} />
                            </View>
                            <Text className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{opt.label}</Text>
                            <Text className="text-[9px] text-gray-400 font-medium mt-0.5">{opt.desc}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* TYPOGRAPHY BASE SIZE */}
                  <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white" style={styles.previewShadow}>
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center">
                        <Ionicons name="options-outline" size={18} color="#6366F1" />
                      </View>
                      <Text className="text-base font-bold text-gray-800">Typography Base Size</Text>
                    </View>

                    <View className="flex-row gap-3">
                      {[
                        { id: 'small', label: 'Small', desc: '11px-12px text', sizeClass: 'text-xs' },
                        { id: 'medium', label: 'Medium', desc: '13px-14px text', sizeClass: 'text-sm' },
                        { id: 'large', label: 'Large', desc: '15px-16px text', sizeClass: 'text-base' }
                      ].map(opt => {
                        const isSelected = typographySize === opt.id;
                        return (
                          <TouchableOpacity
                            key={opt.id}
                            onPress={() => setTypographySize(opt.id as any)}
                            className={`flex-1 p-4 rounded-2xl border items-center justify-center bg-white ${isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}
                            style={isSelected ? styles.tabActiveShadow : undefined}
                          >
                            <View className="w-10 h-10 border border-gray-200 rounded-lg bg-gray-50 items-center justify-center mb-3">
                              <Text className={`font-black text-gray-400 ${opt.sizeClass}`}>A</Text>
                            </View>
                            <Text className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{opt.label}</Text>
                            <Text className="text-[9px] text-gray-400 font-medium mt-0.5">{opt.desc}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* DOCUMENT FONT */}
                  <View className="border border-gray-200 rounded-3xl p-5 mb-5 bg-white" style={styles.previewShadow}>
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="w-8 h-8 rounded-full bg-violet-50 items-center justify-center">
                        <Ionicons name="text-outline" size={18} color="#8B5CF6" />
                      </View>
                      <Text className="text-base font-bold text-gray-800">Document Font</Text>
                    </View>
 
                    <View className="flex-row flex-wrap gap-2 justify-between">
                      {[
                        { name: 'Inter', isSerif: false },
                        { name: 'Outfit', isSerif: false },
                        { name: 'Montserrat', isSerif: false },
                        { name: 'Roboto', isSerif: false },
                        { name: 'Playfair', isSerif: true },
                        { name: 'Merriweather', isSerif: true },
                        { name: 'Lora', isSerif: true },
                        { name: 'Times', isSerif: true },
                        { name: 'Fira Code', isMonospace: true }
                      ].map(font => {
                        const isSelected = documentFont === font.name;
                        return (
                          <TouchableOpacity
                            key={font.name}
                            onPress={() => setDocumentFont(font.name)}
                            className={`w-[31%] p-3 mb-2.5 rounded-2xl border items-center justify-center bg-white ${isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200'}`}
                            style={isSelected ? styles.tabActiveShadow : undefined}
                          >
                            <View className="w-10 h-10 border border-gray-200 rounded-lg bg-gray-50 items-center justify-center mb-2">
                              <Text className={`text-sm font-semibold text-gray-500 ${font.isSerif ? 'font-serif' : font.isMonospace ? 'font-mono' : ''}`}>Aa</Text>
                            </View>
                            <Text className={`text-[10px] font-bold text-center ${isSelected ? 'text-blue-600' : 'text-gray-700'}`} numberOfLines={1}>{font.name}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity onPress={() => setActiveTab('ADD')} className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1">
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} /><Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveMode('preview')} className="bg-[#10B981] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1" style={styles.previewModeShadow}>
                      <Text className="text-white font-bold text-sm">Preview Resume</Text>
                      <Ionicons name="eye-outline" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        ) : (
          /* Live Preview Mode */
          <ScrollView className="flex-1 bg-gray-100 p-6" showsVerticalScrollIndicator={false}>
            {renderLivePreview()}
          </ScrollView>
        )}
      {/* GEMINI API KEY INPUT MODAL */}
      <Modal
        visible={showApiKeyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-100 shadow-xl">
            <View className="flex-row items-center gap-2.5 mb-4">
              <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center">
                <Ionicons name="key-outline" size={18} color="#2563EB" />
              </View>
              <Text className="text-base font-bold text-gray-900">Enter Gemini API Key</Text>
            </View>

            <Text className="text-xs text-gray-500 mb-4 leading-normal">
              A Google Gemini API Key is required to generate summaries. You can get a free API Key from the Google AI Studio website.
            </Text>

            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-mono mb-4 w-full"
              placeholder="AIzaSy..."
              placeholderTextColor="#A3A3A3"
              value={customApiKey}
              onChangeText={setCustomApiKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowApiKeyModal(false);
                  setPendingAIAction(null);
                }}
                className="flex-1 py-3 border border-gray-200 rounded-2xl items-center bg-white"
              >
                <Text className="text-gray-500 font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (customApiKey.trim()) {
                    setShowApiKeyModal(false);
                    const apiKey = customApiKey.trim();
                    if (pendingAIAction?.type === 'experience' && pendingAIAction.expId) {
                      generateExperienceWithAI(pendingAIAction.expId, apiKey);
                    } else {
                      generateSummaryWithAI(apiKey);
                    }
                    setPendingAIAction(null);
                  } else {
                    Alert.alert('Key Required', 'Please enter a valid Gemini API key.');
                  }
                }}
                className="flex-1 py-3 bg-[#2563EB] rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-sm">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  previewShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  previewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  tabActiveShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabHeaderShadow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  nextShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  previewModeShadow: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
