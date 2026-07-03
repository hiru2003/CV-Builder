import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Corporate',
    description: 'Navy header highlights, structured ATS-friendly layout. Best for finance, tech, and corporate roles.',
    color: '#1E3A8A',
    icon: 'briefcase-outline',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean serif typography, spacious margins, subtle gray lines. Ideal for startup, writing, and academic CVs.',
    color: '#374151',
    icon: 'sparkles-outline',
  },
  {
    id: 'creative',
    name: 'Creative Sidebar',
    description: 'Bold double-column template with a highlighted sidebar and dark skill tags. Ideal for designer, media, and marketing fields.',
    color: '#D97706',
    icon: 'color-palette-outline',
  },
] as const;

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');
  const router = useRouter();

  useEffect(() => {
    // 1. Dynamic Greeting based on current clock time
    const updateGreeting = () => {
      const hours = new Date().getHours();
      if (hours < 12) {
        setGreeting('Good Morning');
      } else if (hours < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };
    updateGreeting();

    // 2. Fetch User Data from Firebase Session
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setUserName(user.displayName || user.email?.split('@')[0] || 'User');

      try {
        await user.reload();
        const updatedUser = auth.currentUser;
        if (updatedUser?.displayName) {
          setUserName(updatedUser.displayName);
        }
      } catch (error) {
        console.log("Background profile reload skipped", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Header (Premium Custom Design) */}
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center bg-white">
          <View className="flex-row items-center">
            <View 
              className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
              style={{
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-white text-xl font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View className="ml-4">
              <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{greeting},</Text>
              <Text className="text-2xl font-extrabold text-gray-900">{userName}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleLogout}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Quick Insights Row (Dashboard statistics) */}
        <View className="px-6 py-4 flex-row justify-between gap-3">
          <View className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-row items-center">
            <Ionicons name="document-text" size={24} color="#2563eb" />
            <View className="ml-3">
              <Text className="text-[10px] font-bold text-blue-500 uppercase">Documents</Text>
              <Text className="text-lg font-bold text-gray-800">1 Draft</Text>
            </View>
          </View>

          <View className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex-row items-center">
            <Ionicons name="sparkles" size={24} color="#d97706" />
            <View className="ml-3">
              <Text className="text-[10px] font-bold text-amber-500 uppercase">Templates</Text>
              <Text className="text-lg font-bold text-gray-800">3 Premium</Text>
            </View>
          </View>
        </View>

        {/* Template Selection Slider (Horizontal list) */}
        <View className="py-4">
          <View className="px-6 flex-row justify-between items-center mb-4">
            <Text className="text-xl font-extrabold text-gray-900">Choose a Template</Text>
            <Text className="text-xs font-bold text-blue-600">Slide to view</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {TEMPLATES.map((tmpl) => (
              <View 
                key={tmpl.id}
                className="w-72 bg-[#F9FAFB] border border-[#E5E7EB] rounded-3xl p-5 mb-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                {/* Decorative Icon Header */}
                <View className="flex-row items-center mb-4">
                  <View 
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: tmpl.color + '1A' }} // 10% opacity color
                  >
                    <Ionicons name={tmpl.icon} size={20} color={tmpl.color} />
                  </View>
                  <Text className="text-base font-extrabold text-gray-900 ml-3" style={{ color: tmpl.color }}>
                    {tmpl.name}
                  </Text>
                </View>

                <Text className="text-gray-500 text-xs leading-relaxed min-h-[50px] mb-5">
                  {tmpl.description}
                </Text>

                <TouchableOpacity 
                  onPress={() => router.push({ pathname: '/cv/create', params: { template: tmpl.id } })}
                  className="w-full bg-blue-600 py-3 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: tmpl.color,
                    shadowColor: tmpl.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    elevation: 3,
                  }}
                >
                  <Text className="text-white font-bold text-sm">Use Template</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Tools</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-white w-[48%] py-5 rounded-2xl items-center justify-center border border-gray-100" style={styles.cardShadow}>
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="document-text-outline" size={24} color="#9333ea" />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Cover Letters</Text>
              <Text className="text-gray-400 text-[10px] mt-1">1 template available</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white w-[48%] py-5 rounded-2xl items-center justify-center border border-gray-100" style={styles.cardShadow}>
              <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="bulb-outline" size={24} color="#10b981" />
              </View>
              <Text className="text-gray-800 font-bold text-sm">Writing Guide</Text>
              <Text className="text-gray-400 text-[10px] mt-1">Increase ATS score</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Draft Section */}
        <View className="px-6 py-4 mb-12">
          <Text className="text-xl font-bold text-gray-900 mb-4">Recent Document</Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/cv/create')}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex-row justify-between items-center"
            style={styles.cardShadow}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center">
                <Ionicons name="file-tray-full-outline" size={24} color="#4B5563" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-900 font-bold text-base">Untitled Resume Draft</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Updated just now • Classic template</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  }
});
