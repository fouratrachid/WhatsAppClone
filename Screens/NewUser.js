import { StatusBar } from 'expo-status-bar';
import { Button, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import React, { useState } from 'react';
import firebase from '../config';

const auth = firebase.auth();

export default function NewUser(props) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  return (
    <ImageBackground
      source={require("../assets/photo1.jpeg")}
      style={styles.container}>
      <View style={{
        backgroundColor: "#0005",
        height: 300,
        width: '98%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
      }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: 'yellow',
          }}>
          Bienvenue
        </Text>
        <TextInput
          onChangeText={(txt) => setEmail(txt)}
          keyboardType='email-address'
          placeholder='email@gmail.com'
          style={styles.textInputStyle}></TextInput>
        <TextInput
          onChangeText={(txt) => setPwd(txt)}
          placeholder='password'
          secureTextEntry={true}
          style={styles.textInputStyle}></TextInput>

        <TextInput
          onChangeText={(txt) => setConfirmPwd(txt)}
          placeholder='Confirm password'
          secureTextEntry={true}
          style={styles.textInputStyle}></TextInput>

        <View>
          <View style={{ flexDirection: 'row', gap: 15, }}>
            <Button title='submit'
              onPress={() => {
                if (pwd === confirmPwd) {
                  auth.createUserWithEmailAndPassword(email, pwd).then(() => {
                    props.navigation.navigate("Home"); // Ensure "Home" is correctly referenced
                  }).catch((error) => {
                    alert(error.message);
                  });
                } else {
                  alert("Passwords do not match");
                }
              }}
            ></Button>
            <Button
              onPress={() => {
                props.navigation.goBack();
              }}
              title='Back'
            ></Button>
          </View>
        </View>

      </View>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputStyle: {
    height: 50,
    width: '90%',
    backgroundColor: 'white',
    marginBottom: 10,
  }
});