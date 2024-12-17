import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your existing screens
import ListeProfils from './Home/Listeprofils';
import Groupes from './Home/Groupes';
import MyProfil from './Home/MyProfil';

const Tab = createMaterialBottomTabNavigator();

export default function HomeNavigation() {
  return (
    <Tab.Navigator
      shifting={true}
      barStyle={{
        backgroundColor: '#6A11CB', // Matching the gradient from previous designs
        overflow: 'hidden',
      }}
      activeColor="#FFFFFF"
      inactiveColor="rgba(255,255,255,0.6)"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let iconSize = focused ? 26 : 22;

          switch (route.name) {
            case 'ListeProfils':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Groupes':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'MyProfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="ListeProfils"
        component={ListeProfils}
        options={{
          tabBarLabel: 'Contacts',
        }}
      />
      <Tab.Screen
        name="Groupes"
        component={Groupes}
        options={{
          tabBarLabel: 'Groups',
        }}
      />
      <Tab.Screen
        name="MyProfil"
        component={MyProfil}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}