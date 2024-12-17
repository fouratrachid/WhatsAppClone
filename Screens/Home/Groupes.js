import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import firebase from '../../config';

const Groupes = (props) => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const userId = firebase.auth().currentUser.uid;

  useEffect(() => {
    const ref_groups = firebase.database().ref('groups');
    const fetchGroups = () => {
      ref_groups.on('value', (snapshot) => {
        const items = [];
        snapshot.forEach((childSnapshot) => {
          const group = childSnapshot.val();
          if (group.members.includes(userId)) {
            items.push(group);
          }
        });
        setGroups(items);
      });
    };

    fetchGroups();
    return () => ref_groups.off();
  }, [userId]);

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
        setUsers(items);
      });
    };

    fetchData();
    return () => ref_tableau.off();
  }, [userId]);

  const toggleUserSelection = (user) => {
    if (selectedUsers.includes(user.currentId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== user.currentId));
    } else {
      setSelectedUsers([...selectedUsers, user.currentId]);
    }
  };

  const createGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'At least one member is required');
      return;
    }

    const groupId = firebase.database().ref('groups').push().key;
    const groupData = {
      id: groupId,
      name: groupName,
      members: [userId, ...selectedUsers],
    };

    firebase.database().ref(`groups/${groupId}`).set(groupData)
      .then(() => {
        Alert.alert('Success', 'Group created successfully');
        setIsCreatingGroup(false);
        setGroupName('');
        setSelectedUsers([]);
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  const renderGroup = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => props.navigation.navigate("GroupChat", { group: item })}
    >
      <View style={styles.cardInner}>
        <View style={styles.avatarContainer}>
          <Ionicons name="people" size={40} color="#fff" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={24} color="#888" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.userContainer,
        selectedUsers.includes(item.currentId) && styles.selectedUser
      ]}
      onPress={() => toggleUserSelection(item)}
    >
      <Text style={styles.userName}>{item.nom}</Text>
      {selectedUsers.includes(item.currentId) && (
        <Ionicons name="checkmark-circle" size={24} color="green" />
      )}
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
          <Text style={styles.headerTitle}>Groups</Text>
        </View>

        {isCreatingGroup ? (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
                style={styles.input}
              />
            </View>
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.currentId}
              style={styles.userList}
            />
            <TouchableOpacity style={styles.createButton} onPress={createGroup}>
              <LinearGradient
                colors={['#34ebba', '#34d1eb']}
                style={styles.createButtonGradient}
              >
                <Text style={styles.createButtonText}>Create Group</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCreatingGroup(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <FlatList
              data={groups}
              renderItem={renderGroup}
              keyExtractor={(item) => item.id}
              style={styles.groupList}
            />
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={() => setIsCreatingGroup(true)}
            >
              <LinearGradient
                colors={['#34ebba', '#34d1eb']}
                style={styles.createGroupButtonGradient}
              >
                <Text style={styles.createGroupButtonText}>Create Group</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  groupList: {
    flex: 1,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  chevronContainer: {
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  userList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  selectedUser: {
    backgroundColor: '#e0f7fa',
  },
  createButton: {
    marginTop: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  createButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createGroupButton: {
    marginTop: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  createGroupButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Groupes;