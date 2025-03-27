import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, ScrollView, Text, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { icons } from "../../constants";
import { signOut, getCurrentUser } from "../../lib/appwrite"; // Import getCurrentUser
import { useGlobalContext } from "../../context/GlobalProvider";
import { InfoBox } from "../../components";

const rankDetails = [
  {
    title: "Noob",
    range: "0 - 199",
    color: "bg-red-500",
    textColor: "text-black",
  },
  {
    title: "Bit less noob",
    range: "200 - 499",
    color: "bg-yellow-500",
    textColor: "text-black",
  },
  {
    title: "Novice",
    range: "500 - 999",
    color: "bg-blue-500",
    textColor: "text-white",
  },
  {
    title: "Beginner",
    range: "1000 - 1499",
    color: "bg-pink-500",
    textColor: "text-black",
  },
  {
    title: "Advanced Beginner",
    range: "1500 - 2499",
    color: "bg-red-500",
    textColor: "text-white",
  },
  {
    title: "Competent",
    range: "2500 - 3499",
    color: "bg-green-500",
    textColor: "text-black",
  },
  {
    title: "Intermediate",
    range: "3500 - 4499",
    color: "bg-orange-500",
    textColor: "text-black",
  },
  {
    title: "Advanced",
    range: "4500 - 5999",
    color: "bg-purple-500",
    textColor: "text-white",
  },
  {
    title: "Proficient",
    range: "6000 - 9999",
    color: "bg-cyan-500",
    textColor: "text-black",
  },
  {
    title: "Expert",
    range: "10000+",
    color: "bg-yellow-500",
    textColor: "text-black",
  },
];

const Profile = () => {
  const { user, setUser, setIsLogged, localCounter } = useGlobalContext(); // Show the Local Counter (!)
  // const [counter, setCounter] = useState(user?.counter || 0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const getRankInfo = (counter) => {
    if (counter < 200)
      return { title: "Noob", bg: "bg-red-500", text: "text-black" };
    if (counter < 500)
      return {
        title: "Bit less noob",
        bg: "bg-yellow-500",
        text: "text-black",
      };
    if (counter < 1000)
      return { title: "Novice", bg: "bg-blue-500", text: "text-white" };
    if (counter < 1500)
      return { title: "Beginner", bg: "bg-pink-500", text: "text-black" };
    if (counter < 2500)
      return {
        title: "Advanced Beginner",
        bg: "bg-red-500",
        text: "text-white",
      };
    if (counter < 3500)
      return { title: "Competent", bg: "bg-green-500", text: "text-black" };
    if (counter < 4500)
      return { title: "Intermediate", bg: "bg-orange-500", text: "text-black" };
    if (counter < 6000)
      return { title: "Advanced", bg: "bg-purple-500", text: "text-white" };
    if (counter < 10000)
      return { title: "Proficient", bg: "bg-cyan-500", text: "text-black" };
    return { title: "Expert", bg: "bg-yellow-500", text: "text-black" };
  };

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
          {/* Rank Badge with Info Button */}
          <View className="flex flex-row items-center justify-center mt-20 mb-12">
            {(() => {
              const { title, bg, text } = getRankInfo(localCounter);
              return (
                <View
                  className={`px-6 py-2 rounded-lg ${bg} flex flex-row items-center`}
                >
                  <Text className={`text-3xl font-bold ${text}`}>{title}</Text>
                  {/* Info Icon Button */}
                  <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="ml-3"
                  >
                    <Feather name="info" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </View>
      </ScrollView>
      {modalVisible && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingTop: 100,
            paddingRight: 50,
            paddingBottom: 50,
            paddingLeft: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View className="bg-gray-800 p-6 rounded-lg w-full relative">
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="absolute top-0 right-0 p-2"
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold text-center mb-4">
              Rank Levels
            </Text>
            <ScrollView>
              {rankDetails.map((rank, index) => (
                <View
                  key={index}
                  className={`p-2 rounded-lg mb-2 ${rank.color}`}
                >
                  <Text className={`text-center font-bold ${rank.textColor}`}>
                    {rank.title}
                  </Text>
                  <Text className="text-center text-white">
                    {rank.range} taps
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Profile;
