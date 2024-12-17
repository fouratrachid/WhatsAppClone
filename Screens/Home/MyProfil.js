import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons'; // New icon library
import firebase from '../../config';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://btcgepwqrhodfzpqnuup.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2dlcHdxcmhvZGZ6cHFudXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5Mjg1NjgsImV4cCI6MjA0ODUwNDU2OH0.JQMk-biUKTkGzn2ElhKKFSK9tn8x0ufYPlfKQFMZpLo";


export const supabase = createClient(supabaseUrl, supabaseKey);
const database = firebase.database();
const auth = firebase.auth();
const ref_tableProfils = database.ref('TableauProfils');

export default function MyProfil(props) {
  const [nom, setNom] = useState();
  const [pseudo, setPseudo] = useState();
  const [telephone, setTelephone] = useState();
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [uriImage, setUriImage] = useState("");
  const userId = firebase.auth().currentUser.uid; // Get the authenticated user's ID
  const navigation = useNavigation();



  // Fetch user data on mount
  useEffect(() => {
    const userProfileRef = ref_tableProfils.child(`unprofil-${userId}`);
    userProfileRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNom(data.nom || "");
        setPseudo(data.pseudo || "");
        setTelephone(data.telephone || "");
        if (data.uriImage) {
          setUriImage(data.uriImage);
          setIsDefaultImage(false);
          console.log("taswira from firebase", data.uriImage);
        }
      }
    });

    return () => userProfileRef.off(); // Cleanup listener on unmount
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      console.log("storrgae", supabase.storage);

      console.log("HANI HNE");

      uploadImageToSupabase(imageUri);
      console.log("image uploaded");
    }
  };

  // Function to upload image to Supabase Storage
  const uploadImageToSupabase = async (imageUri) => {
    const fileName = `profile-${Date.now()}-${auth.currentUser.uid}.jpg`; // Unique file name for the user

    try {
      // Read the file as a base64 encoded string
      const base64File = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer
      const fileData = decode(base64File);
      console.log("HANI HNE");
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profileimage')
        .upload(fileName, fileData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading image:', error.message);
        Alert.alert('Upload Error', error.message);
      } else {
        const imageUrl = data?.path
          ? supabase.storage.from('profileimage').getPublicUrl(data.path).data.publicUrl
          : null;

        if (imageUrl) {
          // Update Firebase Realtime Database with the image URL

          setUriImage(imageUrl);
          await database.ref(`TableauProfils/unprofil-${auth.currentUser.uid}`).update({
            uriImage: uriImage,
          }); // Update the state with the uploaded image URL
          console.log("taswiraE", uriImage);
        }
      }
    } catch (error) {
      console.error('Error in uploadProfilePicture:', error);
      Alert.alert('Upload Error', error.message);
    }
  };

  const saveProfile = () => {
    if (!nom || !pseudo || !telephone) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const userProfileRef = ref_tableProfils.child(`unprofil-${userId}`);
    userProfileRef
      .update({
        currentId: userId,
        nom: nom,
        pseudo: pseudo,
        telephone: telephone,
        uriImage: uriImage,
      })
      .then(() => Alert.alert("Success", "Profile updated successfully!"))
      .catch((error) => Alert.alert("Error", error.message));
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
          <Text style={styles.title}>My Profile</Text>

          <View style={styles.profileImageContainer}>
            <Image
              source={
                isDefaultImage
                  ? require("../../assets/profil.png")
                  : { uri: uriImage }
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.cameraIconContainer}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={24} color="#6A11CB" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Full Name"
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="at" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              value={pseudo}
              onChangeText={setPseudo}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call" size={24} color="white" style={styles.inputIcon} />
            <TextInput
              value={telephone}
              onChangeText={setTelephone}
              placeholder="Phone Number"
              placeholderTextColor="rgba(255,255,255,0.7)"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={saveProfile}
          >
            <Ionicons name="save" size={24} color="white" />
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonContainer, styles.logoutButton]}
            onPress={() => {
              database.ref(`TableauProfils/unprofil-${userId}`).update({
                connected: false,
              }).then(() => {
                firebase.auth().signOut();
                navigation.replace("Auth");
              }).catch((error) => {
                Alert.alert("Error", error.message);
              });
            }}
          >
            <Ionicons name="log-out" size={24} color="white" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = {
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 30,
    letterSpacing: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  logoutButton: {
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
};