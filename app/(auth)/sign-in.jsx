import { useState, useRef, useCallback } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Image,
  Button,
} from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import {
  getCurrentUser,
  signIn,
  createRandomTestUser,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      Alert.alert("Success", "User signed in successfully");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollViewRef = useRef(null);

  const scrollUp = useCallback(() => {
    // Scroll up by 100 pixels when form field is focused
    scrollViewRef.current?.scrollTo({ y: 100, animated: true });
  }, []);

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView ref={scrollViewRef}>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height,
          }}
        >
          <Image
            source={images.tap_logo}
            resizeMode="contain"
            className="w-[115px] h-[34px]"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Log in to Aora
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
            onFocus={scrollUp}
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            onFocus={scrollUp}
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View>

          {/* Redirect to Landing Page Button */}
          <View className="mt-10">
            <Button
              title="Go to Landing Page / Create random user"
              onPress={createRandomTestUser}
              /* onPress={() => router.replace("/")} */
              color="#ff6347"
            />
          </View>
          <View style={{ height: 200, backgroundColor: "transparent" }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
