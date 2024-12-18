import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import firebase from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const auth = firebase.auth();

export default function NewUser(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepassword, setShowRepassword] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const onHandleSignup = () => {
    if (!validateEmail(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    if (email !== '' && password !== '' && repassword !== '' && password === repassword) {
      auth.createUserWithEmailAndPassword(email, password).then(() => {
        const currentId = auth.currentUser.uid;
        console.log("currentId from login ", currentId);
        props.navigation.navigate("Home", { currentId: currentId });
        Toast.show({
          type: 'success',
          text1: 'Signup Successful',
          text2: 'Welcome!',
        });
      }).catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: error.message,
        });
      });
    } else if (password !== repassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      });
    } else {
      Toast.show({
        type: 'info',
        text1: 'Missing Fields',
        text2: 'Please fill all the fields',
      });
    }
  };

  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']} // Gradient background
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20
          }}
        >
          <Text style={styles.title}>Sign Up</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus={true}
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              textContentType="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showRepassword}
              textContentType="password"
              value={repassword}
              onChangeText={(text) => setRepassword(text)}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity onPress={() => setShowRepassword(!showRepassword)}>
              <Ionicons name={showRepassword ? "eye-off" : "eye"} size={24} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={onHandleSignup}>
            <Ionicons name="person-add" size={24} color="white" />
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
            <Text style={{ color: 'gray', fontWeight: '600', fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => props.navigation.navigate("Auth")}>
              <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}> Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 30,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
});