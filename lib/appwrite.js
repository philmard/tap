import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

// Read from environment variables
export const appwriteConfig = {
  endpoint: process.env.APPWRITE_ENDPOINT,
  platform: "com.fmard.counterapp",
  projectId: process.env.APPWRITE_PROJECT_ID,
  storageId: process.env.APPWRITE_STORAGE_ID,
  databaseId: process.env.APPWRITE_DATABASE_ID,
  userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID,
  videoCollectionId: process.env.APPWRITE_VIDEO_COLLECTION_ID,
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
        counter: 0, // Initialize counter to 0
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User (return the counter as well)
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    // Query the user collection using the correct field
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (currentUser.documents.length > 0) {
      return currentUser.documents[0];
    } else {
      throw new Error("User document not found");
    }
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export async function createRandomTestUser() {
  const firstNames = [
    "Robert",
    "George",
    "Alice",
    "Bob",
    "John",
    "Jane",
    "Michael",
    "Sarah",
  ];
  const lastNames = [
    "Doe",
    "Smith",
    "Jones",
    "Brown",
    "Wilson",
    "Taylor",
    "Clark",
  ];

  const generateRandomUsername = () => {
    const patterns = ["firstName", "firstNameLastName", "randomUserNumber"];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    let username;
    switch (pattern) {
      case "firstName":
        username = firstNames[Math.floor(Math.random() * firstNames.length)];
        break;
      case "firstNameLastName":
        username = `${
          firstNames[Math.floor(Math.random() * firstNames.length)]
        } ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        break;
      case "randomUserNumber":
        username = `User${Math.floor(Math.random() * 1000)}`;
        break;
      default:
        username = `User${Math.floor(Math.random() * 1000)}`;
    }

    if (Math.random() < 0.3) {
      username += Math.floor(Math.random() * 1000);
    }

    return username;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const createUserWithRetry = async (
    email,
    password,
    username,
    retries = 3
  ) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await createUser(email, password, username);
        return true;
      } catch (error) {
        if (attempt === retries) throw error;
        await delay(2000 * Math.pow(2, attempt));
      }
    }
  };

  try {
    const password = "test1234";
    const username = generateRandomUsername();

    // Create valid email by removing spaces and special characters
    const email = `${username
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/\s+/g, ".")}@example.com`;

    await createUserWithRetry(email, password, username);
    console.log(`Successfully created user: ${email} (${username})`);
    return { email, username };
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
}

export { client, account, avatars, storage, databases };
