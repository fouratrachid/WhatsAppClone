import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import firebase from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const backImage = require("../assets/backImage.png");
const auth = firebase.auth();

export default function NewUser(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');

  const onHandleSignup = () => {
    if (email !== '' && password !== '' && repassword !== '' && password === repassword) {
      auth.createUserWithEmailAndPassword(email, password).then(() => {
        const currentId = auth.currentUser.uid;
        console.log("currentId from login ", currentId);
        props.navigation.navigate("Home", { currentId: currentId });
      }).catch((error) => {
        alert(error.message);
      });
    } else if (password !== repassword) {
      alert("Passwords do not match");
    } else {
      alert("Please fill all the fields");
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
              secureTextEntry={true}
              textContentType="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              textContentType="password"
              value={repassword}
              onChangeText={(text) => setRepassword(text)}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
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

