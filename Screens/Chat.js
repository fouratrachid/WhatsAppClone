
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from '../config';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

const supabaseUrl = "https://btcgepwqrhodfzpqnuup.supabase.co";
const supabaseKey = "JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0Y2dlcHdxcmhvZGZ6cHFudXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5Mjg1NjgsImV4cCI6MjA0ODUwNDU2OH0.JQMk-biUKTkGzn2ElhKKFSK9tn8x0ufYPlfKQFMZpLo";

export const supabase = createClient(supabaseUrl, supabaseKey);

const reflesdiscussions = firebase.database().ref("discussions");

const Chat = (props) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [reactions, setReactions] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const [typingTimeout, setTypingTimeout] = useState(null);
  const profile = props.route.params.item;
  const userId = firebase.auth().currentUser.uid;
  const iddisc = userId > profile.currentId ? userId + profile.currentId : profile.currentId + userId;
  const ref_unediscussion = reflesdiscussions.child(iddisc);
  const database = firebase.database();

  const [recipientName, setRecipientName] = useState("");

  // Listen for typing status changes
  useEffect(() => {
    const typingRef = ref_unediscussion.child('typing');
    const onTypingChange = typingRef.on('value', (snapshot) => {
      const typingData = snapshot.val();
      if (typingData) {
        const isTyping = typingData[profile.currentId] || false;
        setIsRecipientTyping(isTyping);
        if (isTyping) {
          setRecipientName(profile.nom); // Set the recipient's name
        }
      } else {
        setIsRecipientTyping(false);
        setRecipientName(""); // Clear the recipient's name
      }
    });

    return () => typingRef.off('value', onTypingChange);
  }, [profile.currentId]);

  // Fetch messages in real-time from Firebase
  useEffect(() => {
    const fetchMessages = () => {
      ref_unediscussion.on("value", (snapshot) => {
        const fetchedMessages = []; fetch
        snapshot.forEach((child) => {
          if (child.key !== "typing" && child.key !== "reactions") {
            fetchedMessages.push(child.val());
          }
        });
        setMessages(fetchedMessages.reverse());
        setFilteredMessages(fetchedMessages);
      });
    };

    fetchMessages();

    return () => ref_unediscussion.off();
  }, []);

  // Update typing status in Firebase
  const handleInputChange = (text) => {
    setInputText(text);
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set typing status to true
    ref_unediscussion.child('typing').child(userId).set(true);

    // Set a timeout to reset typing status
    setTypingTimeout(
      setTimeout(() => {
        ref_unediscussion.child('typing').child(userId).remove();
      }, 1000) // Adjust delay as needed
    );
  };

  // Send a new message to Firebase
  const sendMessage = (messageContent, type = 'text') => {
    if (messageContent.trim() === "") return;
    const newMessage = {
      id: Date.now().toString(),
      text: messageContent,
      sender: userId,
      date: new Date().toISOString(),
      receiver: profile.currentId,
      type: type,
    };

    const key = ref_unediscussion.push().key;
    const ref_unediscussion_key = ref_unediscussion.child(key);
    ref_unediscussion_key.set(newMessage);
    setInputText("");
  };

  // Send location message
  const sendLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const locationMessage = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
    sendMessage(locationMessage, 'location');
  };

  // Pick an image and send it
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
      uploadImageToSupabase(imageUri);
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToSupabase = async (imageUri) => {
    const fileName = `chat-${userId}-${Date.now()}.jpg`; // Unique file name for the user

    try {
      // Read the file as a base64 encoded string
      const base64File = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer
      const fileData = decode(base64File);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
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
          ? supabase.storage.from('images').getPublicUrl(data.path).data.publicUrl
          : null;

        if (imageUrl) {
          console.log("Image URL:", imageUrl); // Log the image URL
          // Send the image URL as a message
          sendMessage(imageUrl, 'image');
        }
      }
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      Alert.alert('Upload Error', error.message);
    }
  };

  // Pick a file and send it
  const pickFile = async () => {
    try {
      // Pick a document
      const data1 = await DocumentPicker.getDocumentAsync({});
      console.log("Result:", data1);

      // If selection was canceled
      if (data1.canceled) {
        console.log("File selection was canceled.");
        return;
      }
      console.log("File Details:", data1);
      const fileUri = data1.uri;
      const fileName = data1.name;
      const fileType = data1.mimeType;
      console.log("File Details:", fileUri, fileName, fileType);
      const response = await fetch(fileUri);
      console.log("Response:", response);

      const base64 = await response.blob()
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));

      const base64String = base64.split(',')[1];

      const arrayBuffer = decode(base64String);
      const filename = `${fileType}-${userId}-${Date.now()}`;
      console.log("File Name:", filename);

      const { data, error } = await supabase.storage
        .from('files')
        .upload(filename, arrayBuffer, {
          contentType: fileType,
        });
      console.log("Data:", data);
      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('files')
        .getPublicUrl(filename);

      const filePath = publicUrl.publicUrl

      if (publicUrl) {
        const filePath = publicUrl.publicUrl
        console.log("File Path:", filePath);
        console.log("File URL:", publicUrl);
        // Send the file URL as a message
        sendMessage(filePath, 'file');
      } else {
        console.error("Failed to retrieve public URL.");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      Alert.alert("Error", "An unexpected error occurred during file upload.");
    }
  };

  // Filter messages based on search query
  const filterMessages = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter((message) =>
        message.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  };

  // Handle adding a reaction to a message
  const addReaction = (messageId, reaction) => {
    // Save reaction to Firebase
    ref_unediscussion.child('reactions').child(messageId).set(reaction);

    // Update local state
    setReactions((prevReactions) => ({
      ...prevReactions,
      [messageId]: reaction,
    }));
    setShowReactionPicker(false);
  };
  useEffect(() => {
    const fetchReactions = () => {
      ref_unediscussion.child('reactions').on('value', (snapshot) => {
        const fetchedReactions = snapshot.val() || {};
        setReactions(fetchedReactions);
      });
    };

    fetchReactions();

    return () => ref_unediscussion.child('reactions').off();
  }, []);

  // Render a single message
  const renderMessage = ({ item }) => {
    const isMe = item.sender === userId;
    const formattedDate = new Date(item.date).toLocaleString('en-GB', {
      weekday: 'short', // Short day name (e.g., Mon, Tue)
      hour: '2-digit', // 2-digit hour
      minute: '2-digit', // 2-digit minute
      hour12: false, // 24-hour format
    });

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {item.type === 'image' ? (
          <Image
            source={{ uri: item.text }}
            style={styles.messageImage}
            onError={(e) => console.error('Image Load Error:', e.nativeEvent.error)}
          />
        ) : item.type === 'location' ? (
          <Text style={styles.messageText}>
            <Text style={{ color: 'white' }} onPress={() => Linking.openURL(item.text)}>
              📍  Tap here to see my location
            </Text>
          </Text>
        ) : item.type === 'file' ? (
          <Text style={styles.messageText}>
            <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(item.text)}>
              {item.text}
            </Text>
          </Text>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        <Text style={styles.timestamp}>{formattedDate}</Text>
        <View style={styles.reactionContainer}>
          <TouchableOpacity onPress={() => {
            setSelectedMessageId(item.id);
            setShowReactionPicker(true);
          }}>
            <Ionicons name="happy-outline" size={24} color="#fff" />
          </TouchableOpacity>
          {reactions[item.id] && (
            <Text style={styles.reactionText}>{reactions[item.id]}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Image
            source={
              profile.uriImage
                ? { uri: profile.uriImage }
                : require("../assets/profil.png")
            }
            style={styles.profileImage}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>
              {profile.nom}
            </Text>
            <Text style={styles.headerSubText}>
              {profile.pseudo}
            </Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${profile.telephone}`)}>
            <Ionicons name="call-outline" size={24} color="#0F52BA" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={filterMessages}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flexGrow}
        >
          <FlatList
            data={filteredMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
          />

          {isRecipientTyping && (
            <Text style={styles.typingIndicator}>{recipientName} is typing...</Text>
          )}
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={sendLocation} style={styles.locationButton}>
              <Ionicons name="location-outline" size={24} color="#0F52BA" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
              <Ionicons name="image-outline" size={24} color="#0F52BA" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFile} style={styles.fileButton}>
              <Ionicons name="document-outline" size={24} color="#0F52BA" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={handleInputChange}
              onBlur={() => {
                ref_unediscussion.child('typing').child(userId).remove();
              }}
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(inputText)}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={showReactionPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <TouchableOpacity
          style={styles.reactionPickerBackdrop}
          activeOpacity={1}
          onPressOut={() => setShowReactionPicker(false)}
        >
          <View style={styles.reactionPicker}>
            {['😀', '❤️', '👍', '👎', '😂', '😢'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => addReaction(selectedMessageId, emoji)}
                style={styles.reactionButton}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flexGrow: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  headerText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubText: {
    color: "#555",
    fontSize: 14,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchInput: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: "#f9f9f9",
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0F52BA",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "gray",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 5,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#0F52BA",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  locationButton: {
    marginRight: 10,
  },
  imageButton: {
    marginRight: 10,
  },
  fileButton: {
    marginRight: 10,
  },
  typingIndicator: {
    marginVertical: 10,
    textAlign: 'center',
    color: '#555',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  reactionText: {
    marginLeft: 5,
    color: '#fff',
  },
  reactionPickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reactionPickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  reactionButton: {
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  reactionEmoji: {
    fontSize: 24,
  },
});

export default Chat;