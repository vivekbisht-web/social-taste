import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('userData');
    if (jsonValue !== null) {
      const userData = JSON.parse(jsonValue);
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    return true;
  } catch (error) {
    return false;
  }
};