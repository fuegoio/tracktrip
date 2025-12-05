import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";

const HomeScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="mb-4 text-2xl font-bold text-foreground">
        Welcome to Tracktrip
      </Text>
      <Text className="mb-6 text-lg text-muted-foreground">
        You are logged in!
      </Text>
      <Link href="/login" className="text-primary underline">
        Go to Login
      </Link>
    </View>
  );
};

export default HomeScreen;

