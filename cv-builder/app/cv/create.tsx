import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- Type Definitions ---
type PersonalInfo = { fullName: string; jobTitle: string; email: string; phone: string; address: string; linkedin: string; };
type Experience = { id: string; jobTitle: string; company: string; startDate: string; endDate: string; description: string; };
type Education = { id: string; degree: string; school: string; startDate: string; endDate: string; };

export default function CreateCVScreen() {
  const router = useRouter();
  
  // --- State Management ---
  const [expandedSection, setExpandedSection] = useState<string>('personal');
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: '', jobTitle: '', email: '', phone: '', address: '', linkedin: '' });
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // --- Handlers ---
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const addExperience = () => {
    setExperiences([...experiences, { id: Date.now().toString(), jobTitle: '', company: '', startDate: '', endDate: '', description: '' }]);
    setExpandedSection('experience');
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducations([...educations, { id: Date.now().toString(), degree: '', school: '', startDate: '', endDate: '' }]);
    setExpandedSection('education');
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Here we would save to Firestore, but for now we just log and alert
    console.log({ personalInfo, summary, experiences, educations, skills });
    alert("CV Data Saved!");
    router.back();
  };

  // --- UI Components ---
  const SectionHeader = ({ title, sectionKey, icon }: { title: string, sectionKey: string, icon: any }) => (
    <TouchableOpacity 
      className={`flex-row justify-between items-center p-4 bg-white border-b ${expandedSection === sectionKey ? 'border-gray-100' : 'border-transparent'}`}
      onPress={() => toggleSection(sectionKey)}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color="#2563eb" />
        </View>
        <Text className="text-lg font-bold text-gray-800">{title}</Text>
      </View>
      <Ionicons name={expandedSection === sectionKey ? "chevron-up" : "chevron-down"} size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        
        {/* Sticky Header */}
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="close" size={28} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Create Resume</Text>
          <TouchableOpacity onPress={handleSave} className="bg-blue-600 px-5 py-2 rounded-full">
            <Text className="text-white font-bold">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          
          {/* PERSONAL INFO SECTION */}
          <View className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
            <SectionHeader title="Personal Details" sectionKey="personal" icon="person" />
            {expandedSection === 'personal' && (
              <View className="p-4 space-y-4">
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Full Name" value={personalInfo.fullName} onChangeText={t => setPersonalInfo({...personalInfo, fullName: t})} />
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Job Title (e.g. Software Engineer)" value={personalInfo.jobTitle} onChangeText={t => setPersonalInfo({...personalInfo, jobTitle: t})} />
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Email" value={personalInfo.email} onChangeText={t => setPersonalInfo({...personalInfo, email: t})} keyboardType="email-address" />
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Phone" value={personalInfo.phone} onChangeText={t => setPersonalInfo({...personalInfo, phone: t})} keyboardType="phone-pad" />
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Location (City, Country)" value={personalInfo.address} onChangeText={t => setPersonalInfo({...personalInfo, address: t})} />
                <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="LinkedIn URL" value={personalInfo.linkedin} onChangeText={t => setPersonalInfo({...personalInfo, linkedin: t})} autoCapitalize="none" />
              </View>
            )}
          </View>

          {/* PROFESSIONAL SUMMARY */}
          <View className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
            <SectionHeader title="Professional Summary" sectionKey="summary" icon="document-text" />
            {expandedSection === 'summary' && (
              <View className="p-4">
                <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[120px]" 
                  placeholder="Write a short professional summary highlighting your key achievements and goals..." 
                  value={summary} 
                  onChangeText={setSummary} 
                  multiline 
                  textAlignVertical="top" 
                />
              </View>
            )}
          </View>

          {/* WORK EXPERIENCE */}
          <View className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
            <SectionHeader title="Work Experience" sectionKey="experience" icon="briefcase" />
            {expandedSection === 'experience' && (
              <View className="p-4">
                {experiences.map((exp, index) => (
                  <View key={exp.id} className="mb-6 border-b border-gray-100 pb-4">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-bold text-gray-700">Experience {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeExperience(exp.id)} className="p-1">
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <View className="space-y-3">
                      <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Job Title" value={exp.jobTitle} onChangeText={t => updateExperience(exp.id, 'jobTitle', t)} />
                      <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Company / Employer" value={exp.company} onChangeText={t => updateExperience(exp.id, 'company', t)} />
                      <View className="flex-row justify-between">
                        <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3 w-[48%]" placeholder="Start (MM/YYYY)" value={exp.startDate} onChangeText={t => updateExperience(exp.id, 'startDate', t)} />
                        <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3 w-[48%]" placeholder="End (MM/YYYY)" value={exp.endDate} onChangeText={t => updateExperience(exp.id, 'endDate', t)} />
                      </View>
                      <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[100px]" placeholder="Describe your responsibilities and achievements..." value={exp.description} onChangeText={t => updateExperience(exp.id, 'description', t)} multiline textAlignVertical="top" />
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={addExperience} className="flex-row items-center justify-center py-4 bg-blue-50 rounded-xl border border-blue-100 border-dashed">
                  <Ionicons name="add" size={20} color="#2563eb" />
                  <Text className="text-blue-600 font-bold ml-2">Add Experience</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* EDUCATION */}
          <View className="bg-white rounded-2xl mb-4 overflow-hidden border border-gray-100 shadow-sm">
            <SectionHeader title="Education" sectionKey="education" icon="school" />
            {expandedSection === 'education' && (
              <View className="p-4">
                {educations.map((edu, index) => (
                  <View key={edu.id} className="mb-6 border-b border-gray-100 pb-4">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-bold text-gray-700">Education {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeEducation(edu.id)} className="p-1">
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <View className="space-y-3">
                      <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Degree / Certificate" value={edu.degree} onChangeText={t => updateEducation(edu.id, 'degree', t)} />
                      <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="School / University" value={edu.school} onChangeText={t => updateEducation(edu.id, 'school', t)} />
                      <View className="flex-row justify-between">
                        <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3 w-[48%]" placeholder="Start (YYYY)" value={edu.startDate} onChangeText={t => updateEducation(edu.id, 'startDate', t)} />
                        <TextInput className="bg-gray-50 border border-gray-200 rounded-xl p-3 w-[48%]" placeholder="End (YYYY)" value={edu.endDate} onChangeText={t => updateEducation(edu.id, 'endDate', t)} />
                      </View>
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={addEducation} className="flex-row items-center justify-center py-4 bg-blue-50 rounded-xl border border-blue-100 border-dashed">
                  <Ionicons name="add" size={20} color="#2563eb" />
                  <Text className="text-blue-600 font-bold ml-2">Add Education</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SKILLS */}
          <View className="bg-white rounded-2xl mb-12 overflow-hidden border border-gray-100 shadow-sm">
            <SectionHeader title="Skills" sectionKey="skills" icon="star" />
            {expandedSection === 'skills' && (
              <View className="p-4">
                {skills.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {skills.map((skill, index) => (
                      <View key={index} className="bg-blue-100 px-3 py-2 rounded-full flex-row items-center">
                        <Text className="text-blue-800 font-medium mr-2">{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill(index)}>
                          <Ionicons name="close-circle" size={18} color="#1e3a8a" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <View className="flex-row items-center space-x-3">
                  <TextInput 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4" 
                    placeholder="E.g. JavaScript, Project Management" 
                    value={newSkill} 
                    onChangeText={setNewSkill}
                    onSubmitEditing={addSkill}
                  />
                  <TouchableOpacity onPress={addSkill} className="bg-blue-600 w-14 h-14 rounded-xl items-center justify-center shadow-sm">
                    <Ionicons name="add" size={28} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
