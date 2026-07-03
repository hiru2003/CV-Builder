import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// --- Type Definitions ---
type PersonalInfo = { fullName: string; jobTitle: string; email: string; phone: string; address: string; linkedin: string; };
type Experience = { id: string; jobTitle: string; company: string; startDate: string; endDate: string; description: string; };
type Education = { id: string; degree: string; school: string; startDate: string; endDate: string; };

const TABS = ['PERSONAL', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY'] as const;
type TabType = typeof TABS[number];

export default function CreateCVScreen() {
  const router = useRouter();
  const { template = 'classic' } = useLocalSearchParams<{ template?: string }>();
  
  // --- Mode & Navigation State ---
  const [activeMode, setActiveMode] = useState<'edit' | 'preview'>('edit');
  const [activeTab, setActiveTab] = useState<TabType>('PERSONAL');
  
  // --- Form Data State ---
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: '', jobTitle: '', email: '', phone: '', address: '', linkedin: '' });
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // --- Handlers for Experience ---
  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now().toString(), jobTitle: '', company: '', startDate: '', endDate: '', description: '' }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  // --- Handlers for Education ---
  const addEducation = () => {
    setEducations([...educations, { id: Date.now().toString(), degree: '', school: '', startDate: '', endDate: '' }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
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

  // --- HTML Template Generation for PDF (Supports 3 Layout Styles) ---
  const generateHTML = () => {
    // Shared HTML sub-elements
    const experiencesHTML = experiences.map(exp => `
      <div class="item">
        <div class="item-header">
          <span class="item-title">${exp.jobTitle || 'Job Title'}</span>
          <span class="item-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</span>
        </div>
        <div class="item-sub">${exp.company || 'Company'}</div>
        <div class="item-desc">${exp.description ? exp.description.replace(/\n/g, '<br/>') : ''}</div>
      </div>
    `).join('');

    const educationsHTML = educations.map(edu => `
      <div class="item">
        <div class="item-header">
          <span class="item-title">${edu.degree || 'Degree/Certificate'}</span>
          <span class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</span>
        </div>
        <div class="item-sub">${edu.school || 'School/University'}</div>
      </div>
    `).join('');

    const skillsHTML = skills.map(skill => {
      if (template === 'creative') {
        return `<span class="skill-tag skill-tag-dark">${skill}</span>`;
      }
      return `<span class="skill-tag">${skill}</span>`;
    }).join('');

    // --- Option 1: Modern Minimalist Layout ---
    if (template === 'modern') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Georgia, serif;
              color: #1f2937;
              margin: 40px;
              line-height: 1.6;
              font-size: 13.5px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .name {
              font-size: 30px;
              font-weight: normal;
              margin-bottom: 6px;
              color: #111827;
              letter-spacing: 0.5px;
            }
            .title {
              font-size: 14px;
              font-weight: normal;
              color: #6b7280;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .contact {
              font-size: 11px;
              color: #4b5563;
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 14px;
              border-top: 1px solid #e5e7eb;
              border-bottom: 1px solid #e5e7eb;
              padding: 6px 0;
            }
            .section {
              margin-bottom: 24px;
            }
            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #111827;
              padding-bottom: 3px;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
              text-align: center;
            }
            .section-title::after {
              content: '';
              display: block;
              width: 30px;
              height: 1px;
              background-color: #374151;
              margin: 4px auto 0 auto;
            }
            .summary-text {
              font-size: 12px;
              color: #4b5563;
              text-align: center;
            }
            .item {
              margin-bottom: 14px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-size: 13px;
              font-weight: bold;
              color: #111827;
            }
            .item-title {
              font-weight: bold;
            }
            .item-date {
              font-size: 11.5px;
              color: #6b7280;
              font-weight: normal;
            }
            .item-sub {
              font-size: 12px;
              font-style: italic;
              color: #4b5563;
              margin-bottom: 4px;
            }
            .item-desc {
              font-size: 11.5px;
              color: #4b5563;
              text-align: justify;
            }
            .skills-container {
              text-align: center;
            }
            .skill-tag {
              border: 1px solid #e5e7eb;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 11px;
              display: inline-block;
              margin: 3px;
              color: #374151;
            }
          </style>
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
            </div>
          </div>
          
          ${summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="summary-text">${summary}</div>
          </div>
          ` : ''}
          
          ${experiences.length > 0 ? `
          <div class="section">
            <div class="section-title">Work Experience</div>
            ${experiencesHTML}
          </div>
          ` : ''}
          
          ${educations.length > 0 ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${educationsHTML}
          </div>
          ` : ''}
          
          ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-container">
              ${skillsHTML}
            </div>
          </div>
          ` : ''}
        </body>
        </html>
      `;
    }

    // --- Option 2: Creative Sidebar Layout ---
    if (template === 'creative') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              color: #1f2937;
              margin: 0;
              padding: 0;
              font-size: 12px;
            }
            .wrapper {
              display: table;
              width: 100%;
              min-height: 100vh;
            }
            .sidebar {
              display: table-cell;
              width: 32%;
              background-color: #f3f4f6;
              padding: 30px 20px;
              vertical-align: top;
              border-right: 1px solid #e5e7eb;
            }
            .main-content {
              display: table-cell;
              width: 68%;
              padding: 30px 25px;
              vertical-align: top;
            }
            .name {
              font-size: 24px;
              font-weight: 800;
              color: #111827;
              line-height: 1.2;
              margin-bottom: 6px;
            }
            .title {
              font-size: 13px;
              font-weight: 700;
              color: #d97706;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 25px;
            }
            .sidebar-title {
              font-size: 11px;
              font-weight: bold;
              text-transform: uppercase;
              color: #111827;
              letter-spacing: 1px;
              border-bottom: 2px solid #d97706;
              padding-bottom: 4px;
              margin-bottom: 12px;
              margin-top: 25px;
            }
            .sidebar-title:first-of-type {
              margin-top: 0;
            }
            .contact-item {
              margin-bottom: 10px;
              font-size: 11px;
              color: #4b5563;
              word-break: break-all;
            }
            .contact-label {
              font-weight: bold;
              color: #111827;
              display: block;
              margin-bottom: 2px;
            }
            .section {
              margin-bottom: 22px;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              color: #111827;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 4px;
              margin-bottom: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .summary-text {
              font-size: 11.5px;
              color: #4b5563;
              text-align: justify;
              line-height: 1.5;
            }
            .item {
              margin-bottom: 14px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-size: 12.5px;
              font-weight: bold;
              color: #111827;
            }
            .item-date {
              font-size: 10.5px;
              color: #6b7280;
              font-weight: normal;
            }
            .item-sub {
              font-size: 11.5px;
              font-style: italic;
              color: #d97706;
              margin-bottom: 4px;
            }
            .item-desc {
              font-size: 11px;
              color: #4b5563;
              text-align: justify;
            }
            .skill-tag-dark {
              background-color: #111827;
              color: #ffffff;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 500;
              display: inline-block;
              margin: 3px 2px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="sidebar">
              <div class="name">${personalInfo.fullName || 'Your Name'}</div>
              <div class="title">${personalInfo.jobTitle || 'Professional Title'}</div>
              
              <div class="sidebar-title">Contact</div>
              ${personalInfo.email ? `<div class="contact-item"><span class="contact-label">Email</span>${personalInfo.email}</div>` : ''}
              ${personalInfo.phone ? `<div class="contact-item"><span class="contact-label">Phone</span>${personalInfo.phone}</div>` : ''}
              ${personalInfo.address ? `<div class="contact-item"><span class="contact-label">Address</span>${personalInfo.address}</div>` : ''}
              ${personalInfo.linkedin ? `<div class="contact-item"><span class="contact-label">LinkedIn</span>${personalInfo.linkedin}</div>` : ''}
              
              ${skills.length > 0 ? `
              <div class="sidebar-title">Skills</div>
              <div style="margin-top: 8px;">
                ${skillsHTML}
              </div>
              ` : ''}
            </div>
            
            <div class="main-content">
              ${summary ? `
              <div class="section">
                <div class="section-title">Profile Summary</div>
                <div class="summary-text">${summary}</div>
              </div>
              ` : ''}
              
              ${experiences.length > 0 ? `
              <div class="section">
                <div class="section-title">Work Experience</div>
                ${experiencesHTML}
              </div>
              ` : ''}
              
              ${educations.length > 0 ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${educationsHTML}
              </div>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // --- Option 3: Classic Corporate Layout (Default) ---
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 40px;
            line-height: 1.5;
            font-size: 13px;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
          }
          .name {
            font-size: 26px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #1e3a8a;
          }
          .title {
            font-size: 15px;
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
          }
          .contact {
            font-size: 11px;
            color: #6b7280;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
          }
          .section {
            margin-bottom: 22px;
          }
          .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 4px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .summary-text {
            font-size: 11.5px;
            color: #4b5563;
            text-align: justify;
          }
          .item {
            margin-bottom: 12px;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-size: 12.5px;
            font-weight: bold;
            color: #111827;
          }
          .item-title {
            font-weight: bold;
          }
          .item-date {
            font-size: 11px;
            color: #6b7280;
            font-weight: normal;
          }
          .item-sub {
            font-size: 11.5px;
            font-style: italic;
            color: #4b5563;
            margin-bottom: 4px;
          }
          .item-desc {
            font-size: 11px;
            color: #4b5563;
            text-align: justify;
          }
          .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .skill-tag {
            background-color: #eff6ff;
            color: #1e40af;
            padding: 3px 8px;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            font-size: 10.5px;
            font-weight: 500;
            display: inline-block;
            margin: 2px;
          }
        </style>
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
          </div>
        </div>
        
        ${summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="summary-text">${summary}</div>
        </div>
        ` : ''}
        
        ${experiences.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${experiencesHTML}
        </div>
        ` : ''}
        
        ${educations.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${educationsHTML}
        </div>
        ` : ''}
        
        ${skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-container">
            ${skillsHTML}
          </div>
        </div>
        ` : ''}
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

  // --- Live Preview Component Renderer (Adapts UI to Selected Template) ---
  const renderLivePreview = () => {
    // --- Render Option 1: Modern Minimalist Layout ---
    if (template === 'modern') {
      return (
        <View 
          className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
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
            </View>
          </View>

          {summary ? (
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center mb-2">Professional Summary</Text>
              <View className="w-6 h-[1px] bg-gray-400 mx-auto mb-3" />
              <Text className="text-xs text-gray-600 leading-relaxed text-center">{summary}</Text>
            </View>
          ) : null}

          {experiences.length > 0 ? (
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center mb-2">Work Experience</Text>
              <View className="w-6 h-[1px] bg-gray-400 mx-auto mb-3" />
              {experiences.map((exp) => (
                <View key={exp.id} className="mb-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-gray-900">{exp.jobTitle || 'Job Title'}</Text>
                    <Text className="text-[10px] text-gray-400 font-medium">{exp.startDate || ''} - {exp.endDate || 'Present'}</Text>
                  </View>
                  <Text className="text-[11px] font-medium text-gray-500 italic mb-1">{exp.company || 'Company'}</Text>
                  {exp.description ? (
                    <Text className="text-xs text-gray-600 leading-normal text-justify">{exp.description}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {educations.length > 0 ? (
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center mb-2">Education</Text>
              <View className="w-6 h-[1px] bg-gray-400 mx-auto mb-3" />
              {educations.map((edu) => (
                <View key={edu.id} className="mb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-gray-900">{edu.degree || 'Degree/Certificate'}</Text>
                    <Text className="text-[10px] text-gray-400 font-medium">{edu.startDate || ''} - {edu.endDate || ''}</Text>
                  </View>
                  <Text className="text-[11px] font-medium text-gray-500 italic">{edu.school || 'School/University'}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {skills.length > 0 ? (
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-900 uppercase tracking-widest text-center mb-2">Skills</Text>
              <View className="w-6 h-[1px] bg-gray-400 mx-auto mb-3" />
              <View className="flex-row flex-wrap justify-center gap-1.5">
                {skills.map((skill, index) => (
                  <View key={index} className="border border-gray-200 px-3 py-1 rounded-md">
                    <Text className="text-gray-700 text-[10px] font-medium">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      );
    }

    // --- Render Option 2: Creative Sidebar Layout ---
    if (template === 'creative') {
      return (
        <View 
          className="bg-white border border-gray-200 rounded-3xl min-h-[600px] mb-12 flex-row overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Left Sidebar */}
          <View className="w-[35%] bg-gray-50 border-r border-gray-100 p-4 pt-6">
            <Text className="text-lg font-extrabold text-gray-900 leading-tight mb-1">
              {personalInfo.fullName || 'YOUR NAME'}
            </Text>
            <Text className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-6">
              {personalInfo.jobTitle || 'JOB TITLE'}
            </Text>

            <Text className="text-[9px] font-extrabold text-gray-900 uppercase tracking-widest border-b-2 border-amber-500 pb-1 mb-2">Contact</Text>
            {personalInfo.email ? (
              <View className="mb-2">
                <Text className="text-[8px] font-bold text-gray-400 uppercase">Email</Text>
                <Text className="text-[9px] text-gray-600 font-medium break-all">{personalInfo.email}</Text>
              </View>
            ) : null}
            {personalInfo.phone ? (
              <View className="mb-2">
                <Text className="text-[8px] font-bold text-gray-400 uppercase">Phone</Text>
                <Text className="text-[9px] text-gray-600 font-medium">{personalInfo.phone}</Text>
              </View>
            ) : null}
            {personalInfo.address ? (
              <View className="mb-2">
                <Text className="text-[8px] font-bold text-gray-400 uppercase">Address</Text>
                <Text className="text-[9px] text-gray-600 font-medium">{personalInfo.address}</Text>
              </View>
            ) : null}
            {personalInfo.linkedin ? (
              <View className="mb-4">
                <Text className="text-[8px] font-bold text-gray-400 uppercase">LinkedIn</Text>
                <Text className="text-[9px] text-gray-600 font-medium break-all">{personalInfo.linkedin}</Text>
              </View>
            ) : null}

            {skills.length > 0 ? (
              <View className="mt-4">
                <Text className="text-[9px] font-extrabold text-gray-900 uppercase tracking-widest border-b-2 border-amber-500 pb-1 mb-3">Skills</Text>
                <View className="flex-row flex-wrap gap-1">
                  {skills.map((skill, index) => (
                    <View key={index} className="bg-gray-900 px-2 py-1 rounded">
                      <Text className="text-white text-[8px] font-bold">{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {/* Right Main Content */}
          <View className="w-[65%] p-4 pt-6 bg-white">
            {summary ? (
              <View className="mb-5">
                <Text className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">Profile Summary</Text>
                <Text className="text-[11px] text-gray-600 leading-relaxed text-justify">{summary}</Text>
              </View>
            ) : null}

            {experiences.length > 0 ? (
              <View className="mb-5">
                <Text className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Work Experience</Text>
                {experiences.map((exp) => (
                  <View key={exp.id} className="mb-3">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-[11px] font-bold text-gray-800 flex-1 pr-2">{exp.jobTitle || 'Job Title'}</Text>
                      <Text className="text-[9px] text-gray-400 font-medium">{exp.startDate || ''} - {exp.endDate || ''}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-amber-600 italic mb-1">{exp.company || 'Company'}</Text>
                    {exp.description ? (
                      <Text className="text-[10px] text-gray-600 leading-normal text-justify">{exp.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {educations.length > 0 ? (
              <View className="mb-5">
                <Text className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Education</Text>
                {educations.map((edu) => (
                  <View key={edu.id} className="mb-3">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-[11px] font-bold text-gray-800 flex-1 pr-2">{edu.degree || 'Degree/Certificate'}</Text>
                      <Text className="text-[9px] text-gray-400 font-medium">{edu.startDate || ''} - {edu.endDate || ''}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-amber-600 italic">{edu.school || 'School/University'}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      );
    }

    // --- Render Option 3: Classic Corporate Layout (Default) ---
    return (
      <View 
        className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[600px] mb-12"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="items-center mb-6">
          <Text className="text-2xl font-extrabold text-gray-900 text-center mb-1">
            {personalInfo.fullName || 'YOUR NAME'}
          </Text>
          <Text className="text-xs font-bold text-blue-600 uppercase tracking-widest text-center mb-3">
            {personalInfo.jobTitle || 'PROFESSIONAL TITLE'}
          </Text>
          
          <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-1">
            {personalInfo.email && <Text className="text-[10px] text-gray-500">{personalInfo.email}</Text>}
            {personalInfo.phone && <Text className="text-[10px] text-gray-500">• {personalInfo.phone}</Text>}
            {personalInfo.address && <Text className="text-[10px] text-gray-500">• {personalInfo.address}</Text>}
            {personalInfo.linkedin && <Text className="text-[10px] text-gray-500">• {personalInfo.linkedin}</Text>}
          </View>
        </View>

        <View className="border-b border-gray-100 mb-5" />

        {summary ? (
          <View className="mb-5">
            <Text className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider mb-2">Professional Summary</Text>
            <Text className="text-xs text-gray-600 leading-relaxed text-justify">{summary}</Text>
            <View className="border-b border-gray-100 mt-4" />
          </View>
        ) : null}

        {experiences.length > 0 ? (
          <View className="mb-5">
            <Text className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider mb-3">Work Experience</Text>
            {experiences.map((exp) => (
              <View key={exp.id} className="mb-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-gray-800">{exp.jobTitle || 'Job Title'}</Text>
                  <Text className="text-[10px] text-gray-400 font-medium">{exp.startDate || ''} - {exp.endDate || 'Present'}</Text>
                </View>
                <Text className="text-[11px] font-semibold text-gray-500 italic mb-1">{exp.company || 'Company'}</Text>
                {exp.description ? (
                  <Text className="text-xs text-gray-600 leading-normal text-justify">{exp.description}</Text>
                ) : null}
              </View>
            ))}
            <View className="border-b border-gray-100 mt-2" />
          </View>
        ) : null}

        {educations.length > 0 ? (
          <View className="mb-5">
            <Text className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider mb-3">Education</Text>
            {educations.map((edu) => (
              <View key={edu.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-gray-800">{edu.degree || 'Degree/Certificate'}</Text>
                  <Text className="text-[10px] text-gray-400 font-medium">{edu.startDate || ''} - {edu.endDate || ''}</Text>
                </View>
                <Text className="text-[11px] font-semibold text-gray-500 italic">{edu.school || 'School/University'}</Text>
              </View>
            ))}
            <View className="border-b border-gray-100 mt-2" />
          </View>
        ) : null}

        {skills.length > 0 ? (
          <View className="mb-5">
            <Text className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider mb-2">Skills</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <View key={index} className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                  <Text className="text-blue-700 text-[10px] font-semibold">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
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
        {/* 2. Edit Form vs Live Preview Switcher */}
        <View className="px-6 py-4 bg-white border-b border-gray-50">
          <View className="bg-gray-100 p-1 rounded-2xl flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => setActiveMode('edit')}
              className={activeMode === 'edit' ? "flex-1 py-3 items-center rounded-xl bg-white" : "flex-1 py-3 items-center rounded-xl"}
              style={activeMode === 'edit' ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              } : undefined}
            >
              <Text className={activeMode === 'edit' ? "font-bold text-sm text-gray-900" : "font-bold text-sm text-gray-400"}>Edit Form</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setActiveMode('preview')}
              className={activeMode === 'preview' ? "flex-1 py-3 items-center rounded-xl bg-white" : "flex-1 py-3 items-center rounded-xl"}
              style={activeMode === 'preview' ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              } : undefined}
            >
              <Text className={activeMode === 'preview' ? "font-bold text-sm text-gray-900" : "font-bold text-sm text-gray-400"}>Live Preview</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeMode === 'edit' ? (
          <View className="flex-1 bg-white">
            {/* 3. Horizontal Tab Bar for Editor */}
            <View className="px-6 py-3 border-b border-gray-100 bg-white">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      className={isActive ? "py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-100" : "py-2.5 px-4 rounded-xl border border-transparent"}
                      style={isActive ? {
                        shadowColor: '#2563EB',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      } : undefined}
                    >
                      <Text className={isActive ? "text-xs font-bold tracking-wide text-blue-600" : "text-xs font-bold tracking-wide text-gray-400"}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 4. Form Tabs Scroll Content */}
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
              
              {/* TAB: PERSONAL */}
              {activeTab === 'PERSONAL' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Personal Details</Text>
                  
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">FULL NAME</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="e.g. John Doe" 
                      placeholderTextColor="#9CA3AF"
                      value={personalInfo.fullName} 
                      onChangeText={t => setPersonalInfo({...personalInfo, fullName: t})} 
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">JOB TITLE</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="e.g. Software Engineer" 
                      placeholderTextColor="#9CA3AF"
                      value={personalInfo.jobTitle} 
                      onChangeText={t => setPersonalInfo({...personalInfo, jobTitle: t})} 
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">EMAIL</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="john@example.com" 
                      placeholderTextColor="#9CA3AF"
                      value={personalInfo.email} 
                      onChangeText={t => setPersonalInfo({...personalInfo, email: t})} 
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">PHONE</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="+1 234 567 890" 
                      placeholderTextColor="#9CA3AF"
                      value={personalInfo.phone} 
                      onChangeText={t => setPersonalInfo({...personalInfo, phone: t})} 
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">ADDRESS</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="City, Country" 
                      placeholderTextColor="#9CA3AF"
                      value={personalInfo.address} 
                      onChangeText={t => setPersonalInfo({...personalInfo, address: t})} 
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">LINKEDIN URL</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="https://linkedin.com/in/username" 
                      placeholderTextColor="#9CA3AF"
                      value={personalInfo.linkedin} 
                      onChangeText={t => setPersonalInfo({...personalInfo, linkedin: t})} 
                      autoCapitalize="none"
                    />
                  </View>

                  <View className="flex-row justify-end mt-8">
                    <TouchableOpacity 
                      onPress={() => setActiveTab('EXPERIENCE')} 
                      className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center"
                      style={{
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
                      <Text className="text-white font-bold text-sm">Next: Experience</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: EXPERIENCE */}
              {activeTab === 'EXPERIENCE' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Work Experience</Text>
                  
                  {experiences.map((exp, index) => (
                    <View key={exp.id} className="mb-6 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="font-bold text-gray-700">Experience {index + 1}</Text>
                        <TouchableOpacity onPress={() => removeExperience(exp.id)} className="p-1">
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      
                      <View className="space-y-4">
                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1">JOB TITLE</Text>
                          <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="e.g. Senior Developer" value={exp.jobTitle} onChangeText={t => updateExperience(exp.id, 'jobTitle', t)} />
                        </View>
                        
                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1">COMPANY</Text>
                          <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="e.g. Acme Corp" value={exp.company} onChangeText={t => updateExperience(exp.id, 'company', t)} />
                        </View>

                        <View className="flex-row justify-between">
                          <View className="w-[48%]">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1">START DATE</Text>
                            <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="MM/YYYY" value={exp.startDate} onChangeText={t => updateExperience(exp.id, 'startDate', t)} />
                          </View>
                          <View className="w-[48%]">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1">END DATE</Text>
                            <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="MM/YYYY or Present" value={exp.endDate} onChangeText={t => updateExperience(exp.id, 'endDate', t)} />
                          </View>
                        </View>

                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1">DESCRIPTION</Text>
                          <TextInput 
                            className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900 min-h-[100px]" 
                            placeholder="Describe achievements..." 
                            value={exp.description} 
                            onChangeText={t => updateExperience(exp.id, 'description', t)} 
                            multiline 
                            textAlignVertical="top" 
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity 
                    onPress={addExperience} 
                    className="flex-row items-center justify-center py-4 bg-blue-50 rounded-2xl border border-blue-100 border-dashed"
                  >
                    <Ionicons name="add" size={20} color="#2563eb" />
                    <Text className="text-blue-600 font-bold ml-2">Add Experience</Text>
                  </TouchableOpacity>

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity 
                      onPress={() => setActiveTab('PERSONAL')} 
                      className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1"
                    >
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} />
                      <Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setActiveTab('EDUCATION')} 
                      className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1"
                      style={{
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
                      <Text className="text-white font-bold text-sm">Next: Education</Text>
                      <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB: EDUCATION */}
              {activeTab === 'EDUCATION' && (
                <View className="pb-10">
                  <Text className="text-3xl font-extrabold text-gray-900 mb-6">Education</Text>
                  
                  {educations.map((edu, index) => (
                    <View key={edu.id} className="mb-6 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="font-bold text-gray-700">Education {index + 1}</Text>
                        <TouchableOpacity onPress={() => removeEducation(edu.id)} className="p-1">
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      <View className="space-y-4">
                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1">DEGREE / CERTIFICATE</Text>
                          <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="e.g. B.S. Computer Science" value={edu.degree} onChangeText={t => updateEducation(edu.id, 'degree', t)} />
                        </View>
                        
                        <View>
                          <Text className="text-[10px] font-bold text-gray-500 mb-1">SCHOOL / UNIVERSITY</Text>
                          <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="e.g. Stanford University" value={edu.school} onChangeText={t => updateEducation(edu.id, 'school', t)} />
                        </View>

                        <View className="flex-row justify-between">
                          <View className="w-[48%]">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1">START DATE</Text>
                            <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="YYYY" value={edu.startDate} onChangeText={t => updateEducation(edu.id, 'startDate', t)} />
                          </View>
                          <View className="w-[48%]">
                            <Text className="text-[10px] font-bold text-gray-500 mb-1">END DATE</Text>
                            <TextInput className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-3 text-gray-900" placeholder="YYYY" value={edu.endDate} onChangeText={t => updateEducation(edu.id, 'endDate', t)} />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity 
                    onPress={addEducation} 
                    className="flex-row items-center justify-center py-4 bg-blue-50 rounded-2xl border border-blue-100 border-dashed"
                  >
                    <Ionicons name="add" size={20} color="#2563eb" />
                    <Text className="text-blue-600 font-bold ml-2">Add Education</Text>
                  </TouchableOpacity>

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity 
                      onPress={() => setActiveTab('EXPERIENCE')} 
                      className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1"
                    >
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} />
                      <Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setActiveTab('SKILLS')} 
                      className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1"
                      style={{
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
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
                  
                  {skills.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-6">
                      {skills.map((skill, index) => (
                        <View key={index} className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-full flex-row items-center">
                          <Text className="text-blue-800 font-bold text-xs mr-2">{skill}</Text>
                          <TouchableOpacity onPress={() => removeSkill(index)}>
                            <Ionicons name="close-circle" size={16} color="#1d4ed8" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <View className="flex-row items-center space-x-3 gap-3">
                    <TextInput 
                      className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium" 
                      placeholder="Add a skill (e.g. JavaScript)" 
                      value={newSkill} 
                      onChangeText={setNewSkill}
                      onSubmitEditing={addSkill}
                    />
                    <TouchableOpacity 
                      onPress={addSkill} 
                      className="bg-[#2563EB] w-14 h-14 rounded-2xl items-center justify-center"
                      style={{
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
                      <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity 
                      onPress={() => setActiveTab('EDUCATION')} 
                      className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1"
                    >
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} />
                      <Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setActiveTab('SUMMARY')} 
                      className="bg-[#2563EB] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1"
                      style={{
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
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
                    <Text className="text-xs font-bold text-gray-500 mb-2 tracking-wide">SUMMARY</Text>
                    <TextInput 
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-4 text-gray-900 font-medium min-h-[160px]" 
                      placeholder="Write a short summary highlighting achievements..." 
                      placeholderTextColor="#9CA3AF"
                      value={summary} 
                      onChangeText={setSummary} 
                      multiline 
                      textAlignVertical="top" 
                    />
                  </View>

                  <View className="flex-row justify-between mt-8 gap-4">
                    <TouchableOpacity 
                      onPress={() => setActiveTab('SKILLS')} 
                      className="border border-gray-200 px-6 py-4 rounded-2xl flex-row items-center justify-center bg-white flex-1"
                    >
                      <Ionicons name="arrow-back" size={16} color="#4B5563" style={{ marginRight: 6 }} />
                      <Text className="text-gray-600 font-bold text-sm">Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => setActiveMode('preview')} 
                      className="bg-[#10B981] px-6 py-4 rounded-2xl flex-row items-center justify-center flex-1"
                      style={{
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                      }}
                    >
                      <Text className="text-white font-bold text-sm">Preview Resume</Text>
                      <Ionicons name="eye-outline" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        ) : (
          /* Live Preview Sheet Mode */
          <ScrollView className="flex-1 bg-gray-100 p-6" showsVerticalScrollIndicator={false}>
            {renderLivePreview()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
