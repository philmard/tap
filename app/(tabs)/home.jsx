import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { databases, appwriteConfig } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const DEFAULT_COLOR = "#1E1E1E"; // Default background color
const MAX_GREEN_COLOR = "#1E9E1E"; // Target green color

const Home = () => {
  const { user } = useGlobalContext(); // Access current user from context
  const [counter, setCounter] = useState(0);
  const [bgColor, setBgColor] = useState(DEFAULT_COLOR); // Background color state
  const [lastTapTime, setLastTapTime] = useState(Date.now());

  // Initialize counter with user's current value on component mount
  useEffect(() => {
    if (user && user.counter !== undefined) {
      setCounter(user.counter);
    }
  }, [user]);

  // Smoothly reset background color to default if the user stops tapping for 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastTapTime > 1000 && bgColor !== DEFAULT_COLOR) {
        // Gradually transition back to the default color
        setBgColor((prevColor) =>
          smoothColorTransition(prevColor, DEFAULT_COLOR)
        );
      }
    }, 100);

    return () => clearInterval(interval);
  }, [lastTapTime, bgColor]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateCounter = async () => {
    try {
      if (!user || !user.$id) {
        console.error("User is not available. Cannot update counter.");
        return;
      }

      // Update the counter and haptic feedback
      triggerHaptic();
      const newCount = counter + 1;
      setCounter(newCount);

      // Gradually change the background color toward green
      const newColor = getNextBgColor(bgColor);
      setBgColor(newColor);
      setLastTapTime(Date.now());

      // Update the counter in the database
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.$id,
        { counter: newCount }
      );
    } catch (error) {
      console.error("Failed to update counter:", error);
    }
  };

  // Calculate the next background color based on the current color
  const getNextBgColor = (currentColor) => {
    let [r, g, b] = hexToRgb(currentColor);
    g = Math.min(g + 2, 158); // Increment the green value slightly
    return rgbToHex(r, g, b);
  };

  // Smooth transition from one color to another
  const smoothColorTransition = (currentColor, targetColor) => {
    const currentRgb = hexToRgb(currentColor);
    const targetRgb = hexToRgb(targetColor);

    const newRgb = currentRgb.map((value, index) => {
      return value + (targetRgb[index] - value) * 0.5; // Adjust color gradually
    });

    return rgbToHex(...newRgb);
  };

  // Utility to convert hex color to RGB
  const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  };

  // Utility to convert RGB color to hex
  const rgbToHex = (r, g, b) => {
    return `#${[r, g, b]
      .map((x) => Math.round(x).toString(16).padStart(2, "0"))
      .join("")}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <TouchableOpacity
        onPress={updateCounter}
        className="flex-1 justify-center items-center"
        activeOpacity={1} // Prevents darkening effect on press
      >
        <View>
          <Text className="text-6xl font-bold text-white text-center">
            {counter}
          </Text>
          <Text className="text-lg text-gray-100 text-center mt-4">
            Tap anywhere to count!
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
