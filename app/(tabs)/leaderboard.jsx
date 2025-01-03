import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Image, RefreshControl } from "react-native";
import { databases, appwriteConfig } from "../../lib/appwrite"; // Import databases and config
import { Query } from "react-native-appwrite";
import { useFocusEffect } from "@react-navigation/native"; // React Navigation hook

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.orderDesc("counter"), Query.limit(100)]
      );
      setLeaders(result.documents);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  // Fetch leaderboard when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="flex-1 p-4">
        <Text className="text-base text-slate-400 text-center mb-2">
          Pull down to reload!
        </Text>
        <Text className="text-4xl text-white font-bold text-center mb-4">
          Leaderboard
        </Text>
        {loading ? (
          <Text className="text-white text-center">Loading...</Text>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                tintColor="#ffffff"
                onRefresh={onRefresh}
              />
            }
          >
            <View className="bg-black-100 rounded-lg overflow-hidden">
              <View className="flex-row bg-secondary p-2">
                <Text className="flex-1 text-black font-semibold text-center">
                  Rank
                </Text>
                <Text className="flex-1 text-black font-semibold text-center">
                  Avatar
                </Text>
                <Text className="flex-1 text-black font-semibold text-center">
                  Username
                </Text>
                <Text className="flex-1 text-black font-semibold text-center">
                  Counter
                </Text>
              </View>
              {leaders.map((leader, index) => (
                <View
                  key={leader.$id}
                  className={`flex-row items-center ${
                    index % 2 === 0 ? "bg-black-200" : "bg-black-100"
                  } p-2`}
                >
                  <Text className="flex-1 text-gray-100 text-center">
                    {index + 1}
                  </Text>
                  <View className="flex-1 items-center">
                    <Image
                      source={{ uri: leader.avatar }}
                      className="w-10 h-10 rounded-full"
                      resizeMode="cover"
                    />
                  </View>
                  <Text className="flex-1 text-gray-100 text-center">
                    {leader.username}
                  </Text>
                  <Text className="flex-1 text-gray-100 text-center">
                    {leader.counter}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Leaderboard;
