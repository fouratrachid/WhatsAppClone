import { View, Text } from 'react-native'
import React from 'react'
import Auth from './Screens/Auth'
import NewUser from './Screens/NewUser'
import Home from './Screens/Home'
import Chat from './Screens/Chat'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import GroupChat from './Screens/Home/GroupChat'
import Groupes from './Screens/Home/Groupes'
const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator

        screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Auth' component={Auth}></Stack.Screen>
        <Stack.Screen name='Home' component={Home}></Stack.Screen>
        <Stack.Screen name='NewUser' component={NewUser}
          options={{ headerShown: false }}

        ></Stack.Screen>
        <Stack.Screen name='Chat' component={Chat}></Stack.Screen>
        <Stack.Screen name='GroupChat' component={GroupChat}></Stack.Screen>
        <Stack.Screen name='Groupes' component={Groupes}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>

  )
}