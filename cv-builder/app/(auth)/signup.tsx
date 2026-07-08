import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      try {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: fullName,
          email: email.toLowerCase(),
          createdAt: new Date(),
        });
      } catch (firestoreError) {
        console.warn("Firestore save failed (likely permissions), but user was created:", firestoreError);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
      
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = 'An error occurred during signup.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50/50"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and Header Block */}
        <View className="items-center mb-8 mt-4">
          <View className="w-16 h-16 bg-blue-500 rounded-3xl items-center justify-center mb-5 rotate-6 shadow-lg shadow-blue-500/30">
            <Ionicons name="person-add-outline" size={32} color="white" />
          </View>
          <Text className="text-3xl font-black text-gray-900 tracking-tight text-center">Create Account</Text>
          <Text className="text-gray-400 text-sm font-medium mt-1 text-center">Sign up to get started on your resume</Text>
        </View>

        {/* Form Card */}
        <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl shadow-slate-100 mb-8">
          <View className="space-y-4 gap-4">
            {/* Full Name Input */}
            <View>
              <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-2">Full Name</Text>
              <View 
                className={`flex-row items-center bg-gray-50/80 border rounded-2xl px-4 py-3.5 ${
                  isNameFocused ? 'border-blue-500 bg-white' : 'border-gray-150'
                }`}
                style={isNameFocused ? styles.inputShadow : undefined}
              >
                <Ionicons name="person-outline" size={18} color={isNameFocused ? '#2563EB' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-gray-900 font-medium text-sm py-0.5"
                  placeholder="John Doe"
                  placeholderTextColor="#A3A3A3"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-2">Email Address</Text>
              <View 
                className={`flex-row items-center bg-gray-50/80 border rounded-2xl px-4 py-3.5 ${
                  isEmailFocused ? 'border-blue-500 bg-white' : 'border-gray-150'
                }`}
                style={isEmailFocused ? styles.inputShadow : undefined}
              >
                <Ionicons name="mail-outline" size={18} color={isEmailFocused ? '#2563EB' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-gray-900 font-medium text-sm py-0.5"
                  placeholder="name@example.com"
                  placeholderTextColor="#A3A3A3"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-2">Password</Text>
              <View 
                className={`flex-row items-center bg-gray-50/80 border rounded-2xl px-4 py-3.5 ${
                  isPasswordFocused ? 'border-blue-500 bg-white' : 'border-gray-150'
                }`}
                style={isPasswordFocused ? styles.inputShadow : undefined}
              >
                <Ionicons name="lock-closed-outline" size={18} color={isPasswordFocused ? '#2563EB' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-gray-900 font-medium text-sm py-0.5"
                  placeholder="Min 6 characters"
                  placeholderTextColor="#A3A3A3"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={18} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-2">Confirm Password</Text>
              <View 
                className={`flex-row items-center bg-gray-50/80 border rounded-2xl px-4 py-3.5 ${
                  isConfirmPasswordFocused ? 'border-blue-500 bg-white' : 'border-gray-150'
                }`}
                style={isConfirmPasswordFocused ? styles.inputShadow : undefined}
              >
                <Ionicons name="lock-closed-outline" size={18} color={isConfirmPasswordFocused ? '#2563EB' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                  className="flex-1 text-gray-900 font-medium text-sm py-0.5"
                  placeholder="Re-enter password"
                  placeholderTextColor="#A3A3A3"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={18} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity 
              className={`w-full bg-[#2563EB] rounded-2xl py-4.5 items-center justify-center flex-row ${
                loading ? 'opacity-80' : ''
              }`}
              onPress={handleSignup}
              disabled={loading}
              style={styles.buttonShadow}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Create Account</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation to Login */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-400 font-semibold text-xs">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-extrabold text-xs">Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonShadow: {
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
});
