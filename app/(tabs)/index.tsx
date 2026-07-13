import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
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
      
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      
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
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const navigateToCreate = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    router.push('/cv/select-template');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>{userName || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.heroBadge}>AI-POWERED CV BUILDER</Text>
          <Text style={styles.heroTitle}>Create your resume with our AI Assistant</Text>
          <Text style={styles.heroSubtitle}>
            Build recruiter-approved CV layouts and write description details automatically in minutes.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={navigateToCreate} activeOpacity={0.8}>
            <Text style={styles.ctaButtonText}>Create My CV</Text>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Why build with us?</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="trending-up" size={18} color="#10B981" />
            </View>
            <Text style={styles.statValue}>+48%</Text>
            <Text style={styles.statLabel}>Hired Probability</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="cash-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>+12%</Text>
            <Text style={styles.statLabel}>Salary Increase</Text>
          </View>
        </View>

        {/* 3-Step Guide */}
        <Text style={styles.sectionTitle}>Get started in 3 steps</Text>
        <View style={styles.stepsCard}>
          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stepNumberText}>01</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Choose a template</Text>
              <Text style={styles.stepDesc}>Select from our recruiter-approved resume styles optimized for ATS screening.</Text>
            </View>
          </View>

          {/* Divider Line */}
          <View style={styles.verticalLine} />

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.stepNumberText}>02</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI Generation</Text>
              <Text style={styles.stepDesc}>Write compelling summaries and work experiences dynamically using Gemini AI.</Text>
            </View>
          </View>

          {/* Divider Line */}
          <View style={styles.verticalLine} />

          {/* Step 3 */}
          <View style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: '#10B981' }]}>
              <Text style={styles.stepNumberText}>03</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Export PDF</Text>
              <Text style={styles.stepDesc}>Download a high-fidelity PDF instantly and share it with employers directly.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userMeta: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  heroBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  stepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 14,
    marginVertical: 4,
  },
});
