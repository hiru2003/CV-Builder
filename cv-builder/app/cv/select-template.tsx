import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  'All Styles',
  'Classic',
  'Creative',
  'Minimalist',
  'Modern',
] as const;

type CategoryType = typeof CATEGORIES[number];

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Corporate',
    description: 'Clean structured design with navy headers. Best for traditional corporate and business fields.',
    color: '#1E3A8A',
    category: 'Classic',
    atsApproved: true,
    tag: 'FREE',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Sophisticated serif fonts and light gray dividing borders. Ideal for academia, writing, and tech.',
    color: '#374151',
    category: 'Minimalist',
    atsApproved: true,
    tag: 'FREE',
  },
  {
    id: 'creative',
    name: 'Creative Sidebar',
    description: 'Vibrant sidebar layout emphasizing personal contact badges and skills lists. Perfect for creative, media, and marketing specialists.',
    color: '#D97706',
    category: 'Creative',
    atsApproved: false,
    tag: 'FREE',
  },
  {
    id: 'banner',
    name: 'Elegant Banner',
    description: 'Features a solid dark header banner containing a circular photo, with contact details aligned horizontally.',
    color: '#1F2937',
    category: 'Modern',
    atsApproved: false,
    tag: 'PREMIUM',
  },
  {
    id: 'timeline',
    name: 'Modern Timeline',
    description: 'Timeline-style left accent stripe running down the body. Clean timeline bullet points start each section.',
    color: '#10B981',
    category: 'Modern',
    atsApproved: true,
    tag: 'FREE',
  },
  {
    id: 'executive',
    name: 'Executive Premium',
    description: 'A prestigious template with a gold-bordered profile photo and navy header banner, designed for leadership roles.',
    color: '#7E22CE',
    category: 'Classic',
    atsApproved: false,
    tag: 'PREMIUM',
  },
  {
    id: 'compact',
    name: 'Clean Compact',
    description: 'Tight single-column layout with compact spacing, perfect for fits-on-one-page resume demands.',
    color: '#0D9488',
    category: 'Minimalist',
    atsApproved: true,
    tag: 'FREE',
  },
  {
    id: 'vibrant',
    name: 'Vibrant Crimson',
    description: 'Bold crimson borders and a prominent circular avatar header, for candidates wanting to stand out.',
    color: '#DC2626',
    category: 'Creative',
    atsApproved: false,
    tag: 'FREE',
  },
  {
    id: 'tech',
    name: 'Developer Terminal',
    description: 'Code-style monospace elements with a sleek modern green left accent stripe. Designed for programmers.',
    color: '#059669',
    category: 'Modern',
    atsApproved: true,
    tag: 'FREE',
  },
  {
    id: 'split',
    name: 'Modern Split',
    description: 'A clean 40/60 vertical split panel. The left side carries profile details and skills, while the right displays history.',
    color: '#4B5563',
    category: 'Creative',
    atsApproved: false,
    tag: 'PREMIUM',
  },
] as const;

export default function SelectTemplateScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All Styles');

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (activeCategory === 'All Styles') return true;
    if (activeCategory === 'Modern') return tmpl.category === 'Modern';
    return tmpl.category === activeCategory;
  });

  // --- Render realistic miniature CV layouts matching their exact styles ---
  const renderMiniatureResume = (id: string, themeColor: string) => {
    
    // 1. CLASSIC CORPORATE (ATS)
    if (id === 'classic') {
      return (
        <View className="p-3 items-center">
          <Text className="text-[11px] font-bold text-gray-900 mb-0.5">ALEX MORGAN</Text>
          <Text className="text-[6px] font-bold uppercase tracking-widest" style={{ color: themeColor }}>SENIOR SOFTWARE ENGINEER</Text>
          <Text className="text-[5px] text-gray-400 mt-1 mb-2">alex.morgan@email.com  •  (555) 019-2834  •  San Francisco, CA</Text>
          
          <View className="w-full border-b border-gray-200 my-1" />
          
          <View className="w-full mb-2">
            <Text className="text-[6px] font-extrabold text-blue-600 uppercase tracking-wider mb-1">Professional Summary</Text>
            <Text className="text-[5.5px] text-gray-500 leading-normal text-justify">
              Innovative Senior Software Engineer with 8+ years of experience designing and deploying scalable cloud applications. Proven track record in optimizing backend latency.
            </Text>
          </View>

          <View className="w-full mb-1">
            <Text className="text-[6px] font-extrabold text-blue-600 uppercase tracking-wider mb-1">Work Experience</Text>
            <View className="flex-row justify-between mb-0.5">
              <Text className="text-[5.5px] font-bold text-gray-700">Senior Software Engineer — TechCorp Inc.</Text>
              <Text className="text-[5px] text-gray-400">2022 - Present</Text>
            </View>
            <Text className="text-[5px] text-gray-500">• Replatformed core API service to Go/gRPC, boosting speed by 35%.</Text>
          </View>
        </View>
      );
    }

    // 2. MODERN MINIMALIST (ATS)
    if (id === 'modern') {
      return (
        <View className="p-3 items-center">
          <Text className="text-[12px] text-gray-900 mb-0.5" style={{ fontFamily: 'serif' }}>ALEX MORGAN</Text>
          <Text className="text-[6px] text-gray-400 uppercase tracking-widest">SENIOR SOFTWARE ENGINEER</Text>
          <View className="w-full border-t border-b border-gray-150 py-1 my-2 flex-row justify-center gap-1.5">
            <Text className="text-[4.5px] text-gray-500">alex.morgan@email.com</Text>
            <Text className="text-[4.5px] text-gray-500">•</Text>
            <Text className="text-[4.5px] text-gray-500">San Francisco, CA</Text>
          </View>

          <View className="w-full mb-2 items-center">
            <Text className="text-[6px] font-bold text-gray-900 uppercase tracking-wider mb-1">Summary</Text>
            <Text className="text-[5.5px] text-gray-500 text-center leading-normal">
              Innovative Senior Software Engineer with 8+ years of experience designing and deploying scalable cloud applications.
            </Text>
          </View>

          <View className="w-full">
            <Text className="text-[6px] font-bold text-gray-900 uppercase tracking-wider text-center mb-1">Experience</Text>
            <View className="flex-row justify-between items-center mb-0.5">
              <Text className="text-[5.5px] font-bold text-gray-700">TechCorp Inc. — Senior Engineer</Text>
              <Text className="text-[5px] text-gray-400">2022 - Present</Text>
            </View>
            <Text className="text-[5.5px] text-gray-500 text-center">Optimized backend microservices layout and database architecture.</Text>
          </View>
        </View>
      );
    }

    // 3. CREATIVE SIDEBAR (Non-ATS)
    if (id === 'creative') {
      return (
        <View className="flex-row flex-1">
          <View className="w-[35%] bg-gray-50 p-2 border-r border-gray-150 items-center pt-3">
            <View className="w-7 h-7 bg-gray-200 rounded-full mb-2 border border-gray-300 items-center justify-center">
              <Ionicons name="person" size={10} color="#9CA3AF" />
            </View>
            <Text className="text-[7.5px] font-extrabold text-gray-900 text-center leading-tight">ALEX MORGAN</Text>
            <Text className="text-[4.5px] font-bold text-amber-600 uppercase tracking-widest text-center mt-0.5">SOFTWARE ENG</Text>
            
            <View className="w-full border-b border-gray-200 my-1.5" />
            <Text className="text-[4px] text-gray-500 mb-0.5">alex.morgan@email.com</Text>
            <Text className="text-[4px] text-gray-500">San Francisco, CA</Text>
            
            <View className="flex-row flex-wrap gap-0.5 mt-2 justify-center">
              <View className="bg-gray-900 px-1 py-0.2 rounded"><Text className="text-white text-[3.8px] font-bold">React</Text></View>
              <View className="bg-gray-900 px-1 py-0.2 rounded"><Text className="text-white text-[3.8px] font-bold">Node</Text></View>
            </View>
          </View>
          <View className="w-[65%] p-2 pt-3 bg-white">
            <Text className="text-[6px] font-extrabold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-0.5 mb-1.5">Profile Summary</Text>
            <Text className="text-[5px] text-gray-500 leading-normal mb-2.5">
              Innovative Developer with 8+ years of experience leading teams and building scalable cloud-native web systems.
            </Text>

            <Text className="text-[6px] font-extrabold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-0.5 mb-1">Experience</Text>
            <Text className="text-[5.5px] font-bold text-gray-800">Senior Developer — TechCorp</Text>
            <Text className="text-[4.5px] text-gray-400">2022 - Present</Text>
          </View>
        </View>
      );
    }

    // 4. ELEGANT BANNER (Non-ATS)
    if (id === 'banner') {
      return (
        <View className="flex-1">
          <View className="bg-gray-800 p-2.5 flex-row items-center gap-2">
            <View className="w-6 h-6 bg-gray-600 rounded-full border border-white items-center justify-center">
              <Ionicons name="person" size={8} color="white" />
            </View>
            <View>
              <Text className="text-white text-[9px] font-bold">ALEX MORGAN</Text>
              <Text className="text-blue-400 text-[5px] uppercase font-bold">SENIOR SOFTWARE ENGINEER</Text>
            </View>
          </View>
          <View className="p-2.5">
            <Text className="text-[6px] font-bold border-b border-gray-150 pb-0.5 mb-1">Summary</Text>
            <Text className="text-[5.5px] text-gray-500 leading-normal mb-2">
              8+ years of experience building secure, scalable cloud-native backend infrastructures.
            </Text>
            <Text className="text-[6px] font-bold border-b border-gray-150 pb-0.5 mb-1">Experience</Text>
            <Text className="text-[5.5px] font-bold text-gray-700">Lead Tech Architect — TechCorp</Text>
          </View>
        </View>
      );
    }

    // 5. Modern TIMELINE (ATS)
    if (id === 'timeline') {
      return (
        <View className="p-3">
          <Text className="text-[12px] font-black text-gray-900">ALEX MORGAN</Text>
          <Text className="text-[5.5px] font-bold text-emerald-600 uppercase tracking-wider mb-2">SENIOR SOFTWARE ENGINEER</Text>
          <View className="border-l border-emerald-500 pl-2 ml-0.5 gap-2">
            <View>
              <Text className="text-[5px] font-bold text-gray-900 uppercase">Summary</Text>
              <Text className="text-[5px] text-gray-500 mt-0.5">8+ years of experience deploying microservices pipelines.</Text>
            </View>
            <View>
              <Text className="text-[5px] font-bold text-gray-900 uppercase">Experience</Text>
              <Text className="text-[5px] text-gray-500 mt-0.5">TechCorp Inc. • Senior DevOps Engineer</Text>
            </View>
          </View>
        </View>
      );
    }

    // 6. EXECUTIVE PREMIUM (Non-ATS)
    if (id === 'executive') {
      return (
        <View className="flex-1">
          <View className="bg-indigo-950 p-3 flex-row items-center justify-between border-b-2 border-amber-500">
            <View>
              <Text className="text-white text-[9.5px] font-bold">ALEX MORGAN</Text>
              <Text className="text-amber-500 text-[5px] uppercase font-bold tracking-wider mt-0.5">CHIEF TECHNOLOGY OFFICER</Text>
            </View>
            <View className="w-6 h-6 bg-gray-700 rounded-md border border-amber-500 items-center justify-center">
              <Ionicons name="person" size={8} color="white" />
            </View>
          </View>
          <View className="p-2.5 flex-row gap-2">
            <View className="w-[60%]">
              <Text className="text-[5.5px] font-bold text-indigo-900 border-b border-gray-150 pb-0.5">Summary</Text>
              <Text className="text-[4.8px] text-gray-500 mt-1">High-impact technology leader managing DevOps operations.</Text>
            </View>
            <View className="w-[40%]">
              <Text className="text-[5.5px] font-bold text-indigo-900 border-b border-gray-150 pb-0.5">Core Skills</Text>
              <View className="bg-indigo-950 px-1 py-0.2 rounded mt-1 self-start"><Text className="text-white text-[3.8px] font-bold">AWS</Text></View>
            </View>
          </View>
        </View>
      );
    }

    // 7. CLEAN COMPACT (ATS)
    if (id === 'compact') {
      return (
        <View className="p-2.5">
          <View className="flex-row justify-between border-b border-teal-600 pb-1 mb-2">
            <View>
              <Text className="text-[10px] font-bold text-teal-600">ALEX MORGAN</Text>
              <Text className="text-[5px] text-gray-500 font-bold uppercase">SENIOR SOFTWARE ENGINEER</Text>
            </View>
          </View>
          <View className="mb-2">
            <Text className="text-[5px] font-bold text-teal-600 uppercase">Summary</Text>
            <Text className="text-[4.8px] text-gray-650 mt-0.5">Innovative Senior Software Engineer with 8+ years of cloud experience.</Text>
          </View>
          <View>
            <Text className="text-[5px] font-bold text-teal-600 uppercase">Experience</Text>
            <Text className="text-[4.8px] text-gray-650 mt-0.5">TechCorp Inc. — Senior DevOps Lead</Text>
          </View>
        </View>
      );
    }

    // 8. VIBRANT CRIMSON (Non-ATS)
    if (id === 'vibrant') {
      return (
        <View className="p-3 items-center">
          <View className="w-6 h-6 bg-gray-100 rounded-full border border-red-500 items-center justify-center mb-1">
            <Ionicons name="person" size={8} color="#ef4444" />
          </View>
          <Text className="text-[10px] font-bold text-red-600">ALEX MORGAN</Text>
          <Text className="text-[5px] font-bold text-gray-400 uppercase tracking-widest">SENIOR DEVELOPER</Text>
          <View className="w-full mt-2">
            <Text className="bg-red-600 text-white text-[5px] px-1 py-0.2 rounded font-bold text-center">Professional Summary</Text>
            <Text className="text-[4.8px] text-gray-500 mt-1 text-center">8+ years of frontend expertise building solid React apps.</Text>
          </View>
        </View>
      );
    }

    // 9. DEVELOPER TERMINAL (ATS)
    if (id === 'tech') {
      return (
        <View className="p-3">
          <View className="border-l-2 border-emerald-600 pl-2 mb-2">
            <Text className="text-[10px] font-bold text-gray-900">ALEX MORGAN</Text>
            <Text className="text-[5px] text-emerald-600 font-semibold">SENIOR DEV</Text>
          </View>
          <View className="mb-1.5 pl-2 border-l border-gray-150">
            <Text className="text-[5px] font-bold text-emerald-600">{"> SUMMARY"}</Text>
            <Text className="text-[4.8px] text-gray-500 mt-0.5">8+ years of Kubernetes cluster orchestration systems.</Text>
          </View>
        </View>
      );
    }

    // 10. MODERN SPLIT (Non-ATS)
    if (id === 'split') {
      return (
        <View className="flex-row flex-1">
          <View className="w-[40%] bg-slate-800 p-2 items-center pt-3">
            <View className="w-6 h-6 bg-slate-600 rounded-full mb-1.5 items-center justify-center">
              <Ionicons name="person" size={8} color="white" />
            </View>
            <Text className="text-white text-[8px] font-bold text-center">ALEX MORGAN</Text>
            <Text className="text-gray-400 text-[4px] uppercase tracking-wider text-center mt-0.5">TECH CONSULTANT</Text>
          </View>
          <View className="w-[60%] p-2 pt-3 bg-white">
            <Text className="text-gray-900 font-bold border-b border-gray-150 pb-0.5 text-[5.5px]">SUMMARY</Text>
            <Text className="text-[5px] text-gray-500 mt-1 leading-normal">
              Senior consultant advising tech startups on scalability.
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Back Header */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-50">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="flex-row items-center"
        >
          <Ionicons name="chevron-back" size={16} color="#4B5563" />
          <Text className="text-sm font-bold text-gray-500 ml-1">BACK</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 bg-white" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 30 }}
      >
        {/* Title Block */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-extrabold text-gray-900 text-center tracking-tight leading-tight mb-3">
            Select a <Text className="text-[#3B82F6]">Resume Template</Text>
          </Text>
          <Text className="text-gray-400 text-center text-sm leading-relaxed max-w-[300px]">
            Choose from our recruiter-approved templates, optimized to pass through ATS filters and win interviews.
          </Text>
        </View>

        {/* Quick edit later button */}
        <View className="items-center mb-8">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/cv/create', params: { template: 'classic' } })}
            className="bg-white border border-gray-200 rounded-full px-6 py-3.5 flex-row items-center justify-center"
            style={styles.pillShadow}
          >
            <Text className="text-[#1E293B] font-bold text-xs uppercase tracking-wider">Choose later & start editing</Text>
            <Ionicons name="arrow-forward" size={14} color="#1E293B" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* Categories selector grid */}
        <View className="bg-gray-50/80 border border-gray-100 p-3 rounded-3xl flex-row flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={isActive ? "bg-white border border-gray-100 px-4 py-2.5 rounded-xl" : "px-4 py-2.5"}
                style={isActive ? styles.tabShadow : undefined}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Templates list cards */}
        <View className="space-y-6 gap-6">
          {filteredTemplates.map((tmpl) => (
            <TouchableOpacity 
              key={tmpl.id} 
              onPress={() => router.push({ pathname: '/cv/create', params: { template: tmpl.id } })}
              className="bg-white border border-gray-100 rounded-[28px] p-5"
              style={styles.cardShadow}
              activeOpacity={0.9}
            >
              {/* Mockup Preview Sheet Container */}
              <View 
                className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-4 mb-4 relative min-h-[175px] justify-center overflow-hidden"
              >
                {/* ATS Approved / Photo Layout Badge */}
                <View 
                  className="absolute top-2 left-2 rounded-full px-2.5 py-0.5 z-10"
                  style={{ backgroundColor: tmpl.atsApproved ? '#1E293B' : '#3B82F6' }}
                >
                  <Text className="text-white text-[8px] font-bold uppercase tracking-wider">
                    {tmpl.atsApproved ? 'ATS APPROVED' : 'PHOTO LAYOUT'}
                  </Text>
                </View>

                {/* Render style-matching complete mini resume */}
                <View className="bg-white border border-gray-200/60 rounded-xl min-h-[140px] shadow-sm overflow-hidden items-stretch">
                  {renderMiniatureResume(tmpl.id, tmpl.color)}
                </View>
              </View>

              {/* Template Meta (Matching Vercel screen details layout) */}
              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-lg font-extrabold text-[#1E293B]">{tmpl.name}</Text>
                <View className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                  <Text className="text-blue-600 text-[10px] font-extrabold uppercase">{tmpl.tag}</Text>
                </View>
              </View>
              <Text className="text-gray-450 text-xs leading-normal mt-1">{tmpl.description}</Text>
            </TouchableOpacity>
          ))}

          {filteredTemplates.length === 0 && (
            <View className="items-center py-8">
              <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm font-semibold mt-2">No templates found in this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pillShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tabShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});
