import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { databases, appwriteConfig } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { ENCOURAGEMENT_PHRASES } from "../../constants/messages";

const DEFAULT_COLOR = "#1E1E1E"; // Default background color
const MAX_GREEN_COLOR = "#1E9E1E"; // Target green color

const getRandomPhrase = () => {
  const randomIndex = Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length);
  return ENCOURAGEMENT_PHRASES[randomIndex];
};

const getRandomInterval = () => Math.floor(Math.random() * 11) + 5; // 5-15 taps

const Home = () => {
  const { user, localCounter, setLocalCounter } = useGlobalContext(); // Access current user and counter from context
  // const [counter, setCounter] = useState(0);
  const [bgColor, setBgColor] = useState(DEFAULT_COLOR); // Background color state
  const [lastTapTime, setLastTapTime] = useState(Date.now());
  const [currentPhrase, setCurrentPhrase] = useState("Tap anywhere to count!");

  const tapsSinceLastUpdate = useRef(0);
  const dbCounterRef = useRef(0); // Track taps since last database update
  const tapsSincePhraseChange = useRef(0);
  const nextPhraseThreshold = useRef(getRandomInterval());

  // Initialize counter with user's current value on component mount
  useEffect(() => {
    if (user && user.counter !== undefined) {
      setLocalCounter(user.counter);
      dbCounterRef.current = user.counter; // Initialize database counter ref
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
      const newCount = localCounter + 1;
      setLocalCounter(newCount); // update local counter (global context)

      // Update phrase logic
      tapsSincePhraseChange.current += 1;
      if (tapsSincePhraseChange.current >= nextPhraseThreshold.current) {
        setCurrentPhrase(getRandomPhrase());
        tapsSincePhraseChange.current = 0;
        nextPhraseThreshold.current = getRandomInterval();
      }

      // Gradually change the background color toward green
      const newColor = getNextBgColor(bgColor);
      setBgColor(newColor);
      setLastTapTime(Date.now());

      // Add debug log
      console.log(
        `Local Counter: ${newCount}, Database Counter: ${dbCounterRef.current}`
      );

      // Track taps and update database ONLY every 50 taps
      tapsSinceLastUpdate.current += 1;
      if (tapsSinceLastUpdate.current >= 50) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          user.$id,
          { counter: newCount } // Send current counter value
        );
        tapsSinceLastUpdate.current = 0; // Reset counter after successful update
        dbCounterRef.current = newCount; // Update database counter ref
      }
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
            {localCounter}
          </Text>
          <Text className="text-lg text-gray-100 text-center mt-4">
            {currentPhrase}
          </Text>
        </View>
        <Text className="text-xs text-gray-400 text-center absolute bottom-0 left-0 right-0">
          (Progress is saved every 50 taps!)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;
