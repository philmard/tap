import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, ScrollView, Text, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

import { icons } from "../../constants";
import { signOut, getCurrentUser } from "../../lib/appwrite"; // Import getCurrentUser
import { useGlobalContext } from "../../context/GlobalProvider";
import { InfoBox } from "../../components";

const Profile = () => {
  const { user, setUser, setIsLogged, localCounter } = useGlobalContext(); // Show the Local Counter (!)
  // const [counter, setCounter] = useState(user?.counter || 0);
  const [loading, setLoading] = useState(false);

  /* NOT USEFUL, SINCE IM SHOWING THE LOCAL COUNTER: */
  // Fetch user details and counter from the database
  // const fetchUserDetails = async () => {
  //   try {
  //     setLoading(true);
  //     const updatedUser = await getCurrentUser(); // Fetch the updated user data
  //     if (updatedUser) {
  //       // setUser(updatedUser); // Update global user state
  //       // setCounter(updatedUser.counter); // Update counter state
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch user details:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Fetch user details when the screen is focused
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchUserDetails();
  //   }, [])
  // );

  // Logout function
  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="flex-1">
        <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
          {/* Logout Button */}
          <TouchableOpacity
            onPress={logout}
            className="flex w-full items-end mb-10"
          >
            <Image
              source={icons.logout}
              resizeMode="contain"
              className="w-6 h-6"
            />
          </TouchableOpacity>

          {/* Avatar */}
          <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
            <Image
              source={{ uri: user?.avatar }}
              className="w-[90%] h-[90%] rounded-lg"
              resizeMode="cover"
            />
          </View>

          {/* Username */}
          <InfoBox
            title={user?.username || "Username"}
            containerStyles="mt-5"
            titleStyles="text-lg"
          />

          {/* Counter */}
          <View className="mt-5 flex justify-center items-center">
            {loading ? (
              <Text className="text-white text-1xl font-bold">Loading...</Text>
            ) : (
              <>
                <Text className="text-white text-2xl font-bold text-center">
                  You have TAPPED {"\n"}
                </Text>
                <View className="bg-secondary text-white text-3xl font-bold py-2 px-4 rounded-lg mt-3">
                  <Text className="text-black text-3xl font-bold">
                    {localCounter || 0}
                  </Text>
                </View>
                <Text className="text-white text-2xl font-bold text-center">
                  {"\n"} times!
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
