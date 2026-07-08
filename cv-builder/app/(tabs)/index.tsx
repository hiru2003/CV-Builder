import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      // 1. Set initial quick fallback from authentication details
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      
      // 2. Fetch official full name from Firestore document
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data()?.fullName) {
          setUserName(userDoc.data().fullName);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch user document from Firestore:', e);
      }

      // 3. Fallback: Reload authentication profile
      try {
        await user.reload();
        const updatedUser = auth.currentUser;
        if (updatedUser?.displayName) {
          setUserName(updatedUser.displayName);
        }
      } catch {
        // Silent reload skip
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const navigateToCreate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/cv/select-template');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50/50" edges={['top']}>
      {/* Personalized Floating Header Card */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm shadow-slate-100/50">
        <View className="flex-row items-center">
          <View 
            className="w-11 h-11 bg-blue-500 rounded-2xl items-center justify-center shadow-md shadow-blue-500/20"
            style={styles.avatarShadow}
          >
            <Text className="text-white text-base font-black">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-widest leading-none">Welcome Back</Text>
            <Text className="text-base font-black text-gray-800 mt-1 leading-none">{userName || 'User'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="w-9 h-9 bg-red-50/60 rounded-xl items-center justify-center border border-red-100/40"
        >
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 28 }}
      >
        <View className="items-center">
          
          {/* Live Pulsing Badge Tag */}
          <View className="bg-emerald-50/80 border border-emerald-100/60 rounded-full px-4.5 py-1.5 flex-row items-center mb-6 shadow-sm shadow-emerald-500/5">
            <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" style={styles.pulseDot} />
            <Text className="text-emerald-800 text-[11px] font-bold">
              <Text className="text-emerald-950 font-black">49,398</Text> resumes created today
            </Text>
          </View>

          {/* Headline */}
          <Text className="text-[30px] font-black text-[#1e293b] text-center tracking-tight leading-[38px] mb-3">
            Create your CV with an{'\n'}
            <Text className="text-[#2563EB]">AI-powered CV maker</Text>
          </Text>

          {/* Subheading */}
          <Text className="text-gray-400 text-center text-xs leading-relaxed max-w-[290px] mb-8">
            The first step to a better job? A better CV. Build and download recruiter-approved layouts instantly.
          </Text>

          {/* CTA Action Buttons */}
          <View className="w-full max-w-[280px] space-y-3.5 gap-3.5 mb-10">
            <TouchableOpacity 
              onPress={navigateToCreate}
              className="w-full bg-[#2563EB] rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-blue-500/25"
              style={styles.mainCtaShadow}
            >
              <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Create My CV Now</Text>
              <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={navigateToCreate}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 items-center justify-center"
              style={styles.pillShadow}
            >
              <Text className="text-gray-700 font-extrabold text-sm uppercase tracking-wider">View Templates</Text>
            </TouchableOpacity>
          </View>

          {/* Double Stats Cards Section */}
          <View className="w-full flex-row justify-between gap-4 mb-10">
            <View className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shadow-slate-100/50">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-black text-emerald-600">48%</Text>
                <Ionicons name="trending-up" size={16} color="#10b981" style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">
                more likely to get hired
              </Text>
            </View>

            <View className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm shadow-slate-100/50">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-black text-blue-600">12%</Text>
                <Ionicons name="cash-outline" size={16} color="#2563eb" style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider leading-tight">
                better pay in next role
              </Text>
            </View>
          </View>

          {/* 3-Step Guide Section */}
          <View className="w-full text-left bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm shadow-slate-100/50 mb-4">
            <Text className="text-lg font-black text-slate-800 text-center mb-8">
              Create your CV in{'\n'}
              <Text className="text-[#2563EB]">3 simple steps</Text>
            </Text>

            <View className="space-y-6 gap-6 pl-2 relative border-l border-gray-150 ml-3.5">
              {/* Step 1 */}
              <View className="relative pl-6">
                <View className="absolute w-8 h-8 rounded-full bg-blue-500 items-center justify-center -left-[23px] top-0 shadow-md shadow-blue-500/15">
                  <Text className="text-white font-extrabold text-[10px]">01</Text>
                </View>
                <Text className="text-slate-850 font-extrabold text-[15px] mb-1">Choose a style template</Text>
                <Text className="text-gray-400 text-xs leading-relaxed">
                  Select one of our recruiter-approved templates, designed specifically to pass through ATS filters and win interviews.
                </Text>
              </View>

              {/* Step 2 */}
              <View className="relative pl-6">
                <View className="absolute w-8 h-8 rounded-full bg-amber-500 items-center justify-center -left-[23px] top-0 shadow-md shadow-amber-500/15">
                  <Text className="text-white font-extrabold text-[10px]">02</Text>
                </View>
                <Text className="text-slate-850 font-extrabold text-[15px] mb-1">Customize each CV section</Text>
                <Text className="text-gray-400 text-xs leading-relaxed">
                  Add details about your experience, education, and skills. Customize accent colors, margins, and section orders.
                </Text>
              </View>

              {/* Step 3 */}
              <View className="relative pl-6">
                <View className="absolute w-8 h-8 rounded-full bg-emerald-500 items-center justify-center -left-[23px] top-0 shadow-md shadow-emerald-500/15">
                  <Text className="text-white font-extrabold text-[10px]">03</Text>
                </View>
                <Text className="text-slate-850 font-extrabold text-[15px] mb-1">Download in seconds</Text>
                <Text className="text-gray-400 text-xs leading-relaxed">
                  Export your completed CV as a high-fidelity PDF document immediately and start applying for dream career opportunities.
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  pillShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  pulseDot: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  mainCtaShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
});
