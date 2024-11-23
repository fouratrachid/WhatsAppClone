import React from 'react';
import { View, Text } from 'react-native';
import ListeProfils from './Home/Listeprofils';
import Groupes from './Home/Groupes';
import MyProfil from './Home/MyProfil';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

const Tab = createMaterialBottomTabNavigator();

export default function Home() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="ListeProfils" component={ListeProfils} />
      <Tab.Screen name="Groupes" component={Groupes} />
      <Tab.Screen name="MyProfil" component={MyProfil} />
    </Tab.Navigator>
  );
}