import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. INSTANT LOAD: Immediately show whatever name we have and turn off the loading text!
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      setLoading(false);

      // 2. BACKGROUND UPDATE: Silently fetch the latest profile data from the server
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
      // Our routing listener in _layout.tsx will automatically detect this
      // and redirect the user back to the login screen!
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-6">
      {/* Header Section */}
      <View className="flex-row justify-between items-center mb-8 mt-4">
        <View>
          <Text className="text-gray-500 text-base mb-1">Welcome back,</Text>
          <View className="flex-row items-center">
            {loading ? (
              <ActivityIndicator size="small" color="#2563eb" className="mr-2" />
            ) : null}
            <Text className="text-3xl font-bold text-gray-900">
              {loading ? 'Loading...' : `${userName} 👋`}
            </Text>
          </View>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-100 px-4 py-2 rounded-full"
        >
          <Text className="text-red-600 font-semibold">Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 justify-center items-center">
        <View className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">📄</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
            CV Builder Dashboard
          </Text>
          <Text className="text-gray-500 text-center leading-6 text-base">
            Your CV creation journey starts here. 
            We'll add features to build your resume soon!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
