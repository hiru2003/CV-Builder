import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';

// --- Type Definitions ---
type PersonalInfo = { fullName: string; jobTitle: string; email: string; phone: string; address: string; linkedin: string; github: string; };
type Experience = { id: string; jobTitle: string; company: string; startDate: string; endDate: string; description: string; location: string; current: boolean; };
type Education = { id: string; degree: string; school: string; startDate: string; endDate: string; fieldOfStudy: string; current: boolean; gpa: string; };

const TABS = ['PERSONAL', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY'] as const;
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

  // --- HTML Template Generation (Supports 10 Visually Distinct Formats) ---
  const generateHTML = () => {
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
            </div>
            <div class="main-content">
              ${summary ? `<div class="section"><div class="section-title">Profile Summary</div><div class="summary-text">${summary}</div></div>` : ''}
              ${experiences.length > 0 ? `<div class="section"><div class="section-title">Work Experience</div>${experiencesHTML}</div>` : ''}
              ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
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
            </div>
            <div class="side-col">
              ${educations.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationsHTML}</div>` : ''}
              ${skills.length > 0 ? `<div class="section"><div class="section-title">Core Skills</div><div style="margin-top: 8px;">${skillsHTML}</div></div>` : ''}
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
        </body>
        </html>
      `;
    }

    // 10. MODERN SPLIT (Non-ATS)
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
          </div>
          <div class="split-right">
            ${summary ? `<div class="section"><div class="split-title-dark">Profile Summary</div><div class="summary-text">${summary}</div></div>` : ''}
            ${experiences.length > 0 ? `<div class="section"><div class="split-title-dark">Work Experience</div>${experiencesHTML}</div>` : ''}
            ${educations.length > 0 ? `<div class="section"><div class="split-title-dark">Education</div>${educationsHTML}</div>` : ''}
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

    // Helper: Contact Row Details
    const renderContactDetails = () => (
      <View className="flex-row flex-wrap justify-center gap-x-2 gap-y-1">
        {personalInfo.email && <Text className="text-[10px] text-gray-500">{personalInfo.email}</Text>}
        {personalInfo.phone && <Text className="text-[10px] text-gray-500">• {personalInfo.phone}</Text>}
        {personalInfo.address && <Text className="text-[10px] text-gray-500">• {personalInfo.address}</Text>}
        {personalInfo.linkedin && <Text className="text-[10px] text-gray-500">• {personalInfo.linkedin}</Text>}
        {personalInfo.github && <Text className="text-[10px] text-gray-500">• {personalInfo.github}</Text>}
      </View>
    );

    // Helper: Render Experience List
    const renderExperiencePreview = (color: string) => {
      if (experiences.length === 0) return null;
      return (
        <View className="mb-5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color }}>Work Experience</Text>
          {experiences.map((exp) => (
            <View key={exp.id} className="mb-4">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2">{exp.jobTitle || 'Job Title'}</Text>
                <Text className="text-[10px] text-gray-400 font-medium">{exp.startDate || ''} - {exp.current ? 'Present' : (exp.endDate || '')}</Text>
              </View>
              <Text className="text-[11px] font-semibold text-gray-500 italic mb-1">
                {exp.company || 'Company'} {exp.location ? `• ${exp.location}` : ''}
              </Text>
              {exp.description ? <Text className="text-xs text-gray-600 leading-normal text-justify">{exp.description}</Text> : null}
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
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color }}>Education</Text>
          {educations.map((edu) => (
            <View key={edu.id} className="mb-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-bold text-gray-800 flex-1 pr-2">{edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</Text>
                <Text className="text-[10px] text-gray-400 font-medium">{edu.startDate || ''} - {edu.current ? 'Present' : (edu.endDate || '')}</Text>
              </View>
              <Text className="text-[11px] font-semibold text-gray-500 italic">
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
          <Text className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color }}>Skills</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <View key={index} className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: bg, borderColor: border }}>
                <Text className="text-[10px] font-semibold" style={{ color }}>{skill}</Text>
              </View>
            ))}
          </View>
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
          </View>
          <View className="w-[65%] p-4 pt-6 bg-white">
            {summary ? <View className="mb-5"><Text className="text-[10px] font-extrabold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">Summary</Text><Text className="text-[11px] text-gray-600 leading-relaxed text-justify">{summary}</Text></View> : null}
            {renderExperiencePreview('#111827')}
            {renderEducationPreview('#111827')}
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
            </View>
            <View className="w-[35%]">
              {renderEducationPreview('#1e1b4b')}
              {renderSkillsPreview('#1e1b4b', '#f3f4f6', '#e5e7eb')}
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
          </View>
          <View className="w-[60%] p-4 pt-6 bg-white">
            {summary ? <View className="mb-4"><Text className="text-gray-900 font-bold border-b border-gray-150 pb-1 text-[10px]">SUMMARY</Text><Text className="text-[11px] text-gray-600 mt-2">{summary}</Text></View> : null}
            {renderExperiencePreview('#1f2937')}
            {renderEducationPreview('#1f2937')}
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
        {renderSkillsPreview('#1e40af', '#eff6ff', '#dbeafe')}
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
                          <Text className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Description (comma separated points)</Text>
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
                    <Text className="text-xs font-extrabold text-gray-500 mb-3 tracking-wide uppercase">
                      Write a short summary about your professional background and goals.
                    </Text>
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
