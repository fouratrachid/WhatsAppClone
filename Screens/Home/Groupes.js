import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
      style={styles.groupContainer}
      onPress={() => props.navigation.navigate("GroupChat", { group: item })}
    >
      <Text style={styles.groupName}>{item.name}</Text>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
            <Text style={styles.createButtonText}>Create Group</Text>
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
            <Text style={styles.createGroupButtonText}>Create Group</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupList: {
    flex: 1,
  },
  groupContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  groupName: {
    fontSize: 18,
  },
  createGroupButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  createGroupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  userList: {
    flex: 1,
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
  },
  selectedUser: {
    backgroundColor: '#e0f7fa',
  },
  createButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
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
});

export default Groupes;