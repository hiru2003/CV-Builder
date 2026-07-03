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
    color: '#2563EB',
    mockName: 'ALEX MORGAN',
    mockRole: 'SENIOR SOFTWARE ENGINEER',
    category: 'Classic',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Sophisticated serif fonts and light gray dividing borders. Ideal for academia, writing, and tech.',
    color: '#374151',
    mockName: 'SOPHIA CHEN',
    mockRole: 'PRODUCT DESIGNER',
    category: 'Minimalist',
  },
  {
    id: 'creative',
    name: 'Creative Sidebar',
    description: 'Vibrant sidebar layout emphasizing personal contact badges and skills lists. Perfect for creative, media, and marketing specialists.',
    color: '#D97706',
    mockName: 'LIAM JOHNSON',
    mockRole: 'MARKETING DIRECTOR',
    category: 'Creative',
  },
] as const;

export default function SelectTemplateScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All Styles');

  const filteredTemplates = TEMPLATES.filter((tmpl) => {
    if (activeCategory === 'All Styles') return true;
    if (activeCategory === 'Modern') return tmpl.id === 'modern'; // Match Modern category to Minimalist
    return tmpl.category === activeCategory;
  });

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
            <View 
              key={tmpl.id} 
              className="bg-white border border-gray-100 rounded-[28px] p-5"
              style={styles.cardShadow}
            >
              {/* Mockup Preview Sheet */}
              <View 
                className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 relative min-h-[140px] justify-center overflow-hidden"
              >
                {/* ATS Approved Badge */}
                <View className="absolute top-2 left-2 bg-[#1E293B] rounded-full px-2 py-0.5 z-10">
                  <Text className="text-white text-[8px] font-bold uppercase tracking-wider">ATS APPROVED</Text>
                </View>

                {/* Mock Header Content */}
                <View className="items-center mt-3">
                  <Text className="text-sm font-extrabold text-gray-900 tracking-wide">{tmpl.mockName}</Text>
                  <Text className="text-[9px] font-bold tracking-widest uppercase mt-0.5" style={{ color: tmpl.color }}>
                    {tmpl.mockRole}
                  </Text>
                  
                  {/* Mock contact detail lines */}
                  <View className="flex-row justify-center gap-2 mt-2">
                    <View className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                    <View className="w-12 h-1.5 bg-gray-100 rounded" />
                    <View className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                    <View className="w-16 h-1.5 bg-gray-100 rounded" />
                  </View>

                  {/* Mock content lines */}
                  <View className="w-full mt-4 gap-1.5 items-center">
                    <View className="w-[85%] h-1.5 bg-gray-100 rounded-full" />
                    <View className="w-[75%] h-1.5 bg-gray-100 rounded-full" />
                    <View className="w-[80%] h-1.5 bg-gray-100 rounded-full" />
                  </View>
                </View>
              </View>

              {/* Template Meta */}
              <Text className="text-lg font-extrabold text-gray-900 mb-1">{tmpl.name}</Text>
              <Text className="text-gray-500 text-xs leading-normal mb-5">{tmpl.description}</Text>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/cv/create', params: { template: tmpl.id } })}
                className="w-full py-4 rounded-2xl items-center justify-center"
                style={{
                  backgroundColor: tmpl.color,
                  shadowColor: tmpl.color,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-bold text-sm">Use Template</Text>
              </TouchableOpacity>
            </View>
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
