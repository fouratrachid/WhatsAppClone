import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Chat = (props) => {
  const { nom } = props.route.params; // Access the 'nom' parameter from props

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chat with {nom}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Chat;