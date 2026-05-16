import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // INSTANT LOAD: Immediately show whatever name we have
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');

      // BACKGROUND UPDATE: Silently fetch the latest profile data
      try {
        await user.reload();
        const updatedUser = auth.currentUser;
        if (updatedUser && updatedUser.displayName) {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Modern Header */}
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-sm">
              <Text className="text-white text-xl font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View className="ml-4">
              <Text className="text-gray-500 text-sm font-medium uppercase tracking-wider">Good Morning,</Text>
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

        {/* Hero Action Card */}
        <View className="px-6 py-4">
          <View className="bg-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-500/30 overflow-hidden relative">
            <View className="absolute -right-4 -top-10 opacity-20">
              <Ionicons name="document-text" size={150} color="#ffffff" />
            </View>
            <View className="pr-10">
              <Text className="text-white text-2xl font-extrabold mb-2">Build Your Dream Resume</Text>
              <Text className="text-blue-100 text-base mb-6 leading-6">
                Create a professional ATS-friendly CV in minutes and land your next job.
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/cv/create')}
                className="bg-white px-6 py-3 rounded-full self-start shadow-sm flex-row items-center"
              >
                <Ionicons name="add" size={20} color="#2563eb" />
                <Text className="text-blue-600 font-bold ml-1">Create New CV</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            {/* Action 1 */}
            <TouchableOpacity className="bg-white w-[30%] aspect-square rounded-2xl items-center justify-center shadow-sm border border-gray-100">
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="color-palette" size={24} color="#9333ea" />
              </View>
              <Text className="text-gray-700 font-semibold text-xs">Templates</Text>
            </TouchableOpacity>
            
            {/* Action 2 */}
            <TouchableOpacity className="bg-white w-[30%] aspect-square rounded-2xl items-center justify-center shadow-sm border border-gray-100">
              <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="mail" size={24} color="#10b981" />
              </View>
              <Text className="text-gray-700 font-semibold text-xs text-center">Cover Letters</Text>
            </TouchableOpacity>

            {/* Action 3 */}
            <TouchableOpacity className="bg-white w-[30%] aspect-square rounded-2xl items-center justify-center shadow-sm border border-gray-100">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="bulb" size={24} color="#f97316" />
              </View>
              <Text className="text-gray-700 font-semibold text-xs">Tips & Guide</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Documents Section */}
        <View className="px-6 py-4 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Recent Documents</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Empty State */}
          <View className="bg-white rounded-2xl p-8 items-center justify-center shadow-sm border border-gray-100 border-dashed">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-3">
              <Ionicons name="folder-open-outline" size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-800 font-bold text-lg mb-1">No resumes yet</Text>
            <Text className="text-gray-500 text-center text-sm">
              Tap the 'Create New CV' button above to start your first document.
            </Text>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
