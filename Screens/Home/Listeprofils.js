import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, ImageBackground, StyleSheet, Text, View } from 'react-native';
import firebase from '../../config';
import Chat from '../Chat';
const database = firebase.database();
const ref_tableau = database.ref('TableauProfils');

const ListeProfils = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      ref_tableau.on('value', (snapshot) => {
        const items = [];
        snapshot.forEach((childSnapshot) => {
          items.push(childSnapshot.val());
        });
        setData(items);
      });
    };

    fetchData();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/imgbleu.jpg")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Text style={styles.textstyle}>List profils</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <Text
              onPress={() => {
                props.navigation.navigate("Chat", { nom: item.nom });
              }}
              style={styles.textstyle}
            >
              {item.nom}
            </Text>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        style={{ backgroundColor: "#fff4", width: "95%" }}
      />
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
  textstyle: {
    fontSize: 18,
    padding: 10,
  },
});

export default ListeProfils;