import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signInWithEmailAndPassword(auth, email, password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)'); 
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = 'An error occurred during login.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      Alert.alert('Login Failed', errorMessage);
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
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-blue-500 rounded-3xl items-center justify-center mb-5 rotate-6 shadow-lg shadow-blue-500/30">
            <Ionicons name="document-text-outline" size={32} color="white" />
          </View>
          <Text className="text-3xl font-black text-gray-900 tracking-tight text-center">Welcome Back</Text>
          <Text className="text-gray-400 text-sm font-medium mt-1 text-center">Sign in to your AI CV Builder account</Text>
        </View>

        {/* Form Card */}
        <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl shadow-slate-100 mb-8">
          <View className="space-y-5 gap-5">
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
                  placeholder="••••••••"
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

            {/* Login Button */}
            <TouchableOpacity 
              className={`w-full bg-[#2563EB] rounded-2xl py-4.5 items-center justify-center flex-row ${
                loading ? 'opacity-80' : ''
              }`}
              onPress={handleLogin}
              disabled={loading}
              style={styles.buttonShadow}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text className="text-white font-extrabold text-sm uppercase tracking-wider">Login to Account</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation to Signup */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-400 font-semibold text-xs">Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-extrabold text-xs">Sign Up</Text>
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
