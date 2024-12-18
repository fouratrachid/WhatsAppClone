import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import firebase from '../../config';
import { FlatList } from 'react-native';
import { Image } from 'expo-image';

const ListeProfiles = (props) => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = firebase.auth().currentUser.uid;

  useEffect(() => {
    const ref_tableau = firebase.database().ref('TableauProfils');
    const fetchData = () => {
      ref_tableau.on('value', (snapshot) => {
        const items = [];
        snapshot.forEach((childSnapshot) => {
          const contact = childSnapshot.val();
          if (contact.currentId !== userId) {
            items.push(contact);
          }
        });
        setData(items);
      });
    };

    fetchData();
    return () => ref_tableau.off();
  }, [userId]);

  // Filter contacts based on search query
  const filteredContacts = data.filter(contact =>
    contact.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.pseudo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ContactCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => props.navigation.navigate("Chat", { item: item })}
    >
      <View style={styles.cardInner}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.uriImage }}
            style={styles.avatar}
          />
          <Ionicons
            name={item.connected ? "checkmark-circle" : "close-circle"}
            size={20}
            color={item.connected ? "green" : "red"}
            style={styles.statusIcon}
          />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.nom}
          </Text>
          <Text style={styles.pseudoText} numberOfLines={1}>
            @{item.pseudo}
          </Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.telephone}`)} style={styles.callIconContainer}>
          <Ionicons name="call" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Contacts</Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search contacts"
              placeholderTextColor="#888"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={filteredContacts}
          renderItem={ContactCard}
          keyExtractor={(item, index) => item.currentId || index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    marginBottom: 15,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  statusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  pseudoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 5,
  },
  callIconContainer: {
    marginRight: 15,
  },
  chevronContainer: {
    justifyContent: 'center',
  },
};

export default ListeProfiles;