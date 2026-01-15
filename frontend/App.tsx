import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { DraftScreen } from './screens/DraftScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { colors } from './src/theme';

export type RootStackParamList = {
  Home: undefined;
  Lobby: {
    roomId: string;
    roomCode: string;
    userName: string;
    isHost: boolean;
  };
  Draft: {
    roomId: string;
    roomCode: string;
    userName: string;
  };
  Results: {
    roomId: string;
    roomCode: string;
    userName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Fantasy Draft', headerShown: false }}
        />
        <Stack.Screen
          name="Lobby"
          component={LobbyScreen}
          options={{ title: 'Lobby' }}
        />
        <Stack.Screen
          name="Draft"
          component={DraftScreen}
          options={{ title: 'Draft', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Results', headerBackVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
