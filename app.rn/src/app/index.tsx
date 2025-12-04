import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

const HomeScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-2xl font-bold mb-4 text-foreground">
        Welcome to Tracktrip
      </Text>
      <Text className="text-lg text-muted-foreground mb-6">
        You are logged in!
      </Text>
      <Link href="/login" className="text-primary underline">
        Go to Login
      </Link>
    </View>
  );
};

export default HomeScreen;