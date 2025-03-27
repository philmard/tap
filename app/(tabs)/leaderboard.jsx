import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Image, RefreshControl } from "react-native";
import { databases, appwriteConfig } from "../../lib/appwrite";
import { Query } from "react-native-appwrite";
import { useFocusEffect } from "@react-navigation/native";
import { useGlobalContext } from "../../context/GlobalProvider";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user: currentUser, localCounter } = useGlobalContext();

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.orderDesc("counter"), Query.limit(5000)]
      );

      const updatedLeaders = result.documents.map((leader) =>
        leader.$id === currentUser?.$id
          ? { ...leader, counter: localCounter }
          : leader
      );

      setLeaders(updatedLeaders.sort((a, b) => b.counter - a.counter));
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add current user with latest localCounter if missing
  useEffect(() => {
    if (currentUser && !leaders.some((l) => l.$id === currentUser.$id)) {
      setLeaders((prev) =>
        [...prev, { ...currentUser, counter: localCounter }].sort(
          (a, b) => b.counter - a.counter
        )
      );
    }
  }, [currentUser, localCounter, leaders]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  // Force initial load with latest context values
  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [currentUser?.$id, localCounter])
  );

  return (
    <SafeAreaView className="bg-primary flex-1" edges={["top"]}>
      <View className="flex-1 pt-4 px-4">
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
                <Text className="flex-[0.5] text-black font-semibold text-center">
                  Rank
                </Text>
                <Text className="flex-1 text-black font-semibold text-center">
                  Avatar
                </Text>
                <Text className="flex-1 text-black font-semibold text-center">
                  Username
                </Text>
                <Text className="flex-[1.5] text-black font-semibold text-center">
                  Counter
                </Text>
              </View>
              {leaders.map((leader, index) => (
                <View
                  key={leader.$id}
                  className={`flex-row items-center ${
                    index % 2 === 0 ? "bg-black-200" : "bg-black-100"
                  } p-2 ${
                    leader.$id === currentUser?.$id
                      ? "bg-green-950" // Subtle highlight for current user
                      : ""
                  }`}
                >
                  <Text className="flex-[0.5] text-gray-100 text-center">
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
                    {leader.$id === currentUser?.$id && " (You)"}
                  </Text>
                  <Text className="flex-[1.5] text-gray-100 text-center">
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
