import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Personalized Header Row */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-white border-b border-gray-50">
        <View className="flex-row items-center">
          <View 
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
            style={styles.avatarShadow}
          >
            <Text className="text-white text-base font-bold">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View className="ml-3">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Welcome back,</Text>
            <Text className="text-base font-extrabold text-gray-800">{userName || 'User'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="w-9 h-9 bg-gray-50 rounded-full items-center justify-center border border-gray-150"
        >
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 bg-white" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
      >
        <View className="items-center">
          
          {/* Live Pulsing Badge */}
          <View className="bg-slate-50 border border-slate-200/80 rounded-full px-4 py-1.5 flex-row items-center mb-8">
            <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" style={styles.pulseDot} />
            <Text className="text-slate-600 text-xs font-bold">
              <Text className="text-slate-900 font-extrabold">49,398</Text> resumes created today
            </Text>
          </View>

          {/* Headline */}
          <Text className="text-[34px] font-black text-[#1e293b] text-center tracking-tight leading-[42px] mb-4">
            Create your CV with an{'\n'}
            <Text className="text-[#00aaff]">AI-powered CV maker</Text>
          </Text>

          {/* Subheading */}
          <Text className="text-gray-400 text-center text-sm leading-relaxed max-w-[320px] mb-10">
            The first step to a better job? A better CV. Only 2% of CVs win interviews, and yours will be one of them. Build it now!
          </Text>

          {/* CTA Action Buttons */}
          <View className="w-full max-w-[280px] space-y-4 gap-4 mb-14">
            <TouchableOpacity 
              onPress={() => router.push('/cv/select-template')}
              className="w-full bg-[#0095ff] rounded-2xl py-4 flex-row items-center justify-center"
              style={{
                shadowColor: '#0095ff',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-white font-bold text-base">Create My CV Now</Text>
              <Ionicons name="arrow-forward" size={18} color="white" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/cv/select-template')}
              className="w-full bg-white border border-gray-250 rounded-2xl py-4 items-center justify-center"
              style={styles.pillShadow}
            >
              <Text className="text-[#1e293b] font-bold text-base">View Templates</Text>
            </TouchableOpacity>
          </View>

          {/* Double Stats Grid Section */}
          <View className="w-full flex-row justify-between gap-4 mb-14 border-t border-b border-gray-100 py-6">
            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-black text-[#10b981]">48%</Text>
                <Ionicons name="trending-up" size={18} color="#10b981" style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-gray-400 text-[11px] font-semibold text-center leading-tight">
                more likely to get hired
              </Text>
            </View>

            <View className="w-[1px] bg-gray-200 h-10 self-center" />

            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-black text-[#f59e0b]">12%</Text>
                <Ionicons name="trending-up" size={18} color="#f59e0b" style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-gray-400 text-[11px] font-semibold text-center leading-tight">
                better pay in next role
              </Text>
            </View>
          </View>

          {/* 3-Step Guide Section */}
          <View className="w-full text-left">
            <Text className="text-xl font-extrabold text-slate-800 text-center mb-8">
              Create your job-winning CV in{'\n'}
              <Text className="text-[#00aaff]">3 simple steps</Text>
            </Text>

            <View className="space-y-6 gap-6">
              {/* Step 1 */}
              <View className="flex-row items-start bg-slate-50 border border-slate-100 rounded-3xl p-5">
                <View className="w-10 h-10 bg-blue-100 rounded-2xl items-center justify-center shrink-0">
                  <Ionicons name="folder-open-outline" size={20} color="#2563eb" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-400 text-[9px] font-bold tracking-widest uppercase">STEP 1</Text>
                  <Text className="text-slate-800 font-extrabold text-base mt-0.5 mb-1.5">Choose a stylish template</Text>
                  <Text className="text-slate-550 text-xs leading-relaxed">
                    Select one of the recruiter-approved CV templates designed specifically to always make it past the screening stage.
                  </Text>
                </View>
              </View>

              {/* Step 2 */}
              <View className="flex-row items-start bg-slate-50 border border-slate-100 rounded-3xl p-5">
                <View className="w-10 h-10 bg-amber-100 rounded-2xl items-center justify-center shrink-0">
                  <Ionicons name="create-outline" size={20} color="#d97706" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-400 text-[9px] font-bold tracking-widest uppercase">STEP 2</Text>
                  <Text className="text-slate-800 font-extrabold text-base mt-0.5 mb-1.5">Customize each CV section</Text>
                  <Text className="text-slate-550 text-xs leading-relaxed">
                    {"Add details about your experience, education, and skills with one click. Need more sections? We've got plenty."}
                  </Text>
                </View>
              </View>

              {/* Step 3 */}
              <View className="flex-row items-start bg-slate-50 border border-slate-100 rounded-3xl p-5">
                <View className="w-10 h-10 bg-emerald-100 rounded-2xl items-center justify-center shrink-0">
                  <Ionicons name="cloud-download-outline" size={20} color="#059669" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-gray-400 text-[9px] font-bold tracking-widest uppercase">STEP 3</Text>
                  <Text className="text-slate-800 font-extrabold text-base mt-0.5 mb-1.5">Download your CV in seconds</Text>
                  <Text className="text-slate-550 text-xs leading-relaxed">
                    {"You've saved hours on CV creation—now use that extra time to prepare for your interview."}
                  </Text>
                </View>
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
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  pillShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  pulseDot: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
});
